/**
 * HEISENIPTV — PORTAL DE ATIVAÇÃO / ASSINATURA
 *
 * Formato dos dados em /devices/<MAC sem ":">:
 *   mac, deviceKey, trialStartDate, isPaid, expirationDate   (gerados pela TV / pagamento)
 *   status: 'active'                                         (lido pela TV)
 *   playlist: { type, url, user, pass }                      (lido pela TV — NÃO mudar o formato)
 *   playlists: { <id>: { id, name, type, url, user, pass, createdAt } }   (só o portal usa)
 *   activePlaylistId: <id>                                   (só o portal usa)
 *
 * "playlist" continua sendo a cópia achatada da lista ativa, então o app da TV
 * funciona sem nenhuma alteração.
 */

(function () {
    'use strict';

    // ---------------------------------------------------------------- Config

    var FIREBASE_URL = 'https://fluxiptv-5c6b5-default-rtdb.firebaseio.com';
    var CHECKOUT_URL = 'https://createcheckout-gmiujppikq-uc.a.run.app';
    var SESSION_KEY = 'heisen_portal_session';
    var TRIAL_DAYS = 7;

    var PLANS = {
        anual: { label: 'Anual', price: 'R$ 29,90' },
        vitalicio: { label: 'Vitalício', price: 'R$ 59,90' }
    };

    // ----------------------------------------------------------------- Estado

    var state = {
        mac: '',
        key: '',
        device: null,
        playlists: [],
        activeId: null,
        plan: null,
        editingId: null
    };

    var $ = function (id) { return document.getElementById(id); };

    // -------------------------------------------------------------- Utilidades

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function safeMac(mac) { return mac.replace(/:/g, '').toUpperCase(); }

    function deviceUrl(path) {
        return FIREBASE_URL + '/devices/' + safeMac(state.mac) + (path || '') + '.json';
    }

    function showMsg(el, text, kind) {
        el.textContent = text;
        el.className = 'msg is-' + (kind || 'error');
        el.hidden = false;
    }

    function hideMsg(el) { el.hidden = true; }

    var toastTimer = null;
    function toast(text) {
        var el = $('toast');
        el.textContent = text;
        el.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.hidden = true; }, 3200);
    }

    function setLoading(btn, loading, label) {
        btn.disabled = loading;
        btn.classList.toggle('is-loading', loading);
        if (label) btn.querySelector('.btn-label').textContent = label;
    }

    function daysBetween(from, to) {
        var diff = Math.floor((to - from) / 86400000);
        return diff < 0 ? 0 : diff;
    }

    function formatDate(value) {
        var d = new Date(value);
        return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
    }

    // ------------------------------------------------------------------- API

    /* O Firebase responde 401 com {"error":"Permission denied"} quando as regras
       do Realtime Database bloqueiam o acesso — inclusive quando as regras de
       teste vencem sozinhas. Sem essa distinção, o sintoma vira um "erro de
       conexão" genérico e se perde muito tempo procurando no lugar errado. */
    var BLOCKED = 'Serviço indisponível: o banco de dados negou o acesso. ' +
                  'Se você é o administrador, revise as regras do Realtime Database.';

    function checkResponse(res, fallback) {
        if (res.status === 401 || res.status === 403) {
            console.error('[HeisenIPTV] Firebase respondeu ' + res.status +
                          ' (Permission denied). As regras do Realtime Database ' +
                          'estão bloqueando /devices.');
            throw new Error(BLOCKED);
        }
        if (!res.ok) throw new Error(fallback);
        return res;
    }

    function apiGet(path) {
        return fetch(deviceUrl(path) + '?t=' + Date.now(), { cache: 'no-store' })
            .then(function (res) {
                checkResponse(res, 'Não foi possível consultar o servidor.');
                return res.json();
            })
            .then(function (data) {
                // Rede de segurança: erro devolvido no corpo com status 200.
                if (data && data.error) throw new Error(BLOCKED);
                return data;
            });
    }

    function apiWrite(method, path, body) {
        return fetch(deviceUrl(path), {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body)
        }).then(function (res) {
            return checkResponse(res, 'Não foi possível salvar no servidor.');
        });
    }

    // --------------------------------------------------- Licença / assinatura

    /** Resume o estado da licença a partir do registro do dispositivo. */
    function readLicense(device) {
        var now = new Date();
        var paid = device.isPaid === true;
        var expiration = device.expirationDate ? new Date(device.expirationDate) : null;

        if (paid && expiration && now > expiration) paid = false;

        var trialStart = new Date(device.trialStartDate || now);
        var used = daysBetween(trialStart, now);
        var left = TRIAL_DAYS - used;

        if (paid) {
            return { kind: 'active', lifetime: !expiration, expiration: expiration };
        }
        if (left > 0) {
            return { kind: 'trial', used: used, left: left };
        }
        return { kind: 'expired', wasPaid: device.isPaid === true, expiration: expiration };
    }

    function renderSubscription() {
        var license = readLicense(state.device || {});
        var box = $('status-box');
        var meter = $('status-meter');
        var plansArea = $('plans-area');

        box.className = 'status is-' + license.kind;
        meter.hidden = true;

        if (license.kind === 'active') {
            $('status-title').textContent = 'Licença ativa';
            $('status-desc').textContent = license.lifetime
                ? 'Acesso vitalício — este dispositivo está liberado permanentemente.'
                : 'Liberado até ' + formatDate(license.expiration) + '.';

            // Vitalício não tem o que comprar; anual pode ser estendido.
            plansArea.hidden = license.lifetime;
            $('plans-title').textContent = 'Estender sua licença';

        } else if (license.kind === 'trial') {
            $('status-title').textContent = 'Período de teste';
            $('status-desc').textContent = license.left === 1
                ? 'Resta 1 dia de teste. Assine para não perder o acesso.'
                : 'Restam ' + license.left + ' dias de teste. Assine quando quiser.';

            meter.hidden = false;
            $('meter-fill').style.width = ((license.used / TRIAL_DAYS) * 100) + '%';
            $('meter-left').textContent = license.left + (license.left === 1 ? ' dia restante' : ' dias restantes');
            $('meter-total').textContent = TRIAL_DAYS + ' dias de teste';

            plansArea.hidden = false;
            $('plans-title').textContent = 'Escolha seu plano';

        } else {
            $('status-title').textContent = license.wasPaid ? 'Licença expirada' : 'Teste encerrado';
            $('status-desc').textContent = license.wasPaid
                ? 'Sua licença venceu em ' + formatDate(license.expiration) + '. Renove para liberar a TV de novo.'
                : 'Seus ' + TRIAL_DAYS + ' dias de teste acabaram. Escolha um plano para liberar a TV.';

            meter.hidden = false;
            $('meter-fill').style.width = '100%';
            $('meter-left').textContent = 'Acesso bloqueado';
            $('meter-total').textContent = TRIAL_DAYS + ' dias de teste';

            plansArea.hidden = false;
            $('plans-title').textContent = 'Escolha seu plano';
        }
    }

    function selectPlan(plan) {
        state.plan = plan;
        var buttons = document.querySelectorAll('.plan');
        for (var i = 0; i < buttons.length; i++) {
            var on = buttons[i].dataset.plan === plan;
            buttons[i].classList.toggle('is-selected', on);
            buttons[i].setAttribute('aria-checked', on ? 'true' : 'false');
        }
        var btn = $('btn-pay');
        btn.disabled = false;
        btn.querySelector('.btn-label').textContent =
            'Assinar ' + PLANS[plan].label + ' — ' + PLANS[plan].price;
    }

    function startCheckout() {
        var btn = $('btn-pay');
        var emailInput = $('buyer-email');
        var email = emailInput.value.trim();
        var msg = $('pay-msg');

        hideMsg(msg);
        emailInput.classList.remove('is-invalid');

        if (!state.plan) return;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            emailInput.classList.add('is-invalid');
            emailInput.focus();
            showMsg(msg, 'Digite um e-mail válido para receber a confirmação do pagamento.');
            return;
        }

        setLoading(btn, true);

        fetch(CHECKOUT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mac: state.mac, planType: state.plan, email: email })
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (!data || !data.init_point) throw new Error('Link de pagamento indisponível.');
                window.location.href = data.init_point;
            })
            .catch(function (err) {
                console.error(err);
                setLoading(btn, false, 'Assinar ' + PLANS[state.plan].label + ' — ' + PLANS[state.plan].price);
                showMsg(msg, 'Não foi possível gerar o pagamento agora. Tente novamente em instantes.');
            });
    }

    // ------------------------------------------------------------- Playlists

    /** Converte o objeto do Firebase em lista ordenada e migra o formato antigo. */
    function loadPlaylists(device) {
        var map = device.playlists || {};
        var list = Object.keys(map).map(function (id) {
            var item = map[id];
            item.id = item.id || id;
            return item;
        });

        // Dispositivo cadastrado antes do portal novo: só tem "playlist".
        if (list.length === 0 && device.playlist && device.playlist.url) {
            var legacy = {
                id: 'pl_legado',
                name: device.playlist.type === 'xtream' ? 'Servidor Xtream' : 'Lista M3U',
                type: device.playlist.type || 'm3u',
                url: device.playlist.url,
                user: device.playlist.user || '',
                pass: device.playlist.pass || '',
                createdAt: device.updatedAt || new Date().toISOString()
            };
            list.push(legacy);
            device.activePlaylistId = legacy.id;
            // Duas escritas diretas: um PATCH com chave "playlists/pl_legado"
            // depende de o REST tratar a barra como caminho, e não é confiável.
            apiWrite('PUT', '/playlists/' + legacy.id, legacy)
                .then(function () {
                    return apiWrite('PATCH', '', { activePlaylistId: legacy.id });
                })
                .catch(function (e) { console.warn('Migração da lista antiga falhou:', e); });
        }

        list.sort(function (a, b) {
            return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
        });

        state.playlists = list;
        state.activeId = device.activePlaylistId || null;

        // Sem id gravado, deduz a ativa comparando com o que a TV está lendo.
        if (!state.activeId && device.playlist && device.playlist.url) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].url === device.playlist.url && list[i].user === (device.playlist.user || '')) {
                    state.activeId = list[i].id;
                    break;
                }
            }
        }
    }

    /* A TV grava em listInfo o que o provedor respondeu na última conexão.
       O portal só mostra — o painel do provedor é HTTP puro e o navegador
       bloquearia a consulta direta como conteúdo misto num site HTTPS. */
    function providerHtml(listInfo) {
        if (!listInfo || !listInfo.state) return '';

        var quando = listInfo.expDate ? new Date(listInfo.expDate).toLocaleDateString('pt-BR') : '';
        var ok = listInfo.state === 'ok';
        var texto;

        if (ok) {
            texto = quando ? 'Ativa no provedor até ' + quando : 'Ativa no provedor (sem data informada)';
        } else if (listInfo.state === 'expired') {
            texto = 'Venceu no provedor' + (quando ? ' em ' + quando : '') + ' — renove com ele';
        } else if (listInfo.state === 'blocked') {
            texto = 'Bloqueada pelo provedor' + (listInfo.status ? ' (' + listInfo.status + ')' : '');
        } else if (listInfo.state === 'auth') {
            texto = 'O provedor recusou o usuário e a senha';
        } else if (listInfo.state === 'empty') {
            texto = 'O provedor não enviou nenhum canal';
        } else {
            return '';
        }

        var visto = '';
        if (listInfo.checkedAt) {
            var d = new Date(listInfo.checkedAt);
            if (!isNaN(d.getTime())) {
                visto = ' <span class="pl-checked">· visto pela TV em ' +
                        d.toLocaleDateString('pt-BR') + '</span>';
            }
        }

        return '<p class="pl-provider ' + (ok ? 'is-ok' : 'is-bad') + '">' +
                   esc(texto) + visto +
               '</p>';
    }

    function describe(playlist) {
        if (playlist.type === 'xtream') {
            var host = playlist.url.replace(/^https?:\/\//, '');
            return host + (playlist.user ? ' · ' + playlist.user : '');
        }
        return playlist.url;
    }

    function renderPlaylists() {
        var container = $('pl-list');
        var list = state.playlists;

        $('pl-counter').textContent = list.length;
        $('pl-empty').hidden = list.length > 0;
        container.innerHTML = '';

        list.forEach(function (playlist) {
            var isActive = playlist.id === state.activeId;

            var el = document.createElement('div');
            el.className = 'pl-item' + (isActive ? ' is-active' : '');
            el.innerHTML =
                '<div class="pl-top">' +
                    '<span class="pl-name">' + esc(playlist.name) + '</span>' +
                    '<span class="tag tag-type">' + (playlist.type === 'xtream' ? 'Xtream' : 'M3U') + '</span>' +
                    (isActive ? '<span class="tag tag-live">Ativa na TV</span>' : '') +
                '</div>' +
                '<p class="pl-meta">' + esc(describe(playlist)) + '</p>' +
                // Só a lista ativa tem status: é a que a TV está usando.
                (isActive && state.device ? providerHtml(state.device.listInfo) : '') +
                '<div class="pl-actions">' +
                    (isActive ? '' : '<button type="button" class="btn btn-ghost btn-sm" data-act="activate">Ativar na TV</button>') +
                    '<button type="button" class="btn btn-ghost btn-sm" data-act="edit">Editar</button>' +
                    '<button type="button" class="btn btn-danger-ghost btn-sm" data-act="remove">Remover</button>' +
                '</div>';

            el.addEventListener('click', function (event) {
                var action = event.target.dataset ? event.target.dataset.act : null;
                if (action === 'activate') activatePlaylist(playlist);
                else if (action === 'edit') openPlaylistModal(playlist);
                else if (action === 'remove') removePlaylist(playlist);
            });

            container.appendChild(el);
        });
    }

    /** Grava a cópia achatada que o app da TV lê. */
    function activatePlaylist(playlist) {
        var payload = {
            status: 'active',
            updatedAt: new Date().toISOString(),
            activePlaylistId: playlist.id,
            playlist: {
                type: playlist.type,
                url: playlist.url,
                user: playlist.user || '',
                pass: playlist.pass || ''
            }
        };

        return apiWrite('PATCH', '', payload)
            .then(function () {
                state.activeId = playlist.id;
                state.device.playlist = payload.playlist;
                state.device.status = 'active';
                renderPlaylists();
                toast('"' + playlist.name + '" ativada — a TV carrega em alguns segundos.');
            })
            .catch(function (err) {
                console.error(err);
                toast('Erro ao ativar a lista. Tente de novo.');
            });
    }

    function removePlaylist(playlist) {
        if (!window.confirm('Remover a lista "' + playlist.name + '"?')) return;

        apiWrite('DELETE', '/playlists/' + playlist.id)
            .then(function () {
                // Se a removida era a ativa, a TV precisa parar de usá-la.
                if (playlist.id === state.activeId) {
                    return apiWrite('PATCH', '', {
                        status: 'pending',
                        playlist: null,
                        activePlaylistId: null,
                        updatedAt: new Date().toISOString()
                    }).then(function () {
                        state.activeId = null;
                        state.device.playlist = null;
                        toast('Lista removida. Ative outra para a TV voltar a carregar.');
                    });
                }
                toast('Lista removida.');
            })
            .then(function () {
                state.playlists = state.playlists.filter(function (item) { return item.id !== playlist.id; });
                renderPlaylists();
            })
            .catch(function (err) {
                console.error(err);
                toast('Erro ao remover a lista.');
            });
    }

    // --------------------------------------------------------- Modal da lista

    function setPlaylistType(type) {
        var buttons = document.querySelectorAll('.seg-btn');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.toggle('is-on', buttons[i].dataset.type === type);
        }
        $('fields-xtream').classList.toggle('is-on', type === 'xtream');
        $('fields-m3u').classList.toggle('is-on', type === 'm3u');
    }

    function currentPlaylistType() {
        var on = document.querySelector('.seg-btn.is-on');
        return on ? on.dataset.type : 'xtream';
    }

    function openPlaylistModal(playlist) {
        state.editingId = playlist ? playlist.id : null;

        $('pl-modal-title').textContent = playlist ? 'Editar lista' : 'Adicionar lista';
        $('btn-save-playlist').querySelector('.btn-label').textContent = playlist ? 'Salvar alterações' : 'Salvar lista';
        hideMsg($('pl-msg'));

        $('pl-name').value = playlist ? playlist.name : '';
        $('x-url').value = playlist && playlist.type === 'xtream' ? playlist.url : '';
        $('x-user').value = playlist && playlist.type === 'xtream' ? (playlist.user || '') : '';
        $('x-pass').value = playlist && playlist.type === 'xtream' ? (playlist.pass || '') : '';
        $('m-url').value = playlist && playlist.type === 'm3u' ? playlist.url : '';

        $('pl-activate').checked = playlist
            ? playlist.id === state.activeId
            : true;

        setPlaylistType(playlist ? playlist.type : 'xtream');

        var invalid = document.querySelectorAll('#form-playlist .is-invalid');
        for (var i = 0; i < invalid.length; i++) invalid[i].classList.remove('is-invalid');

        $('pl-modal').hidden = false;
        document.body.style.overflow = 'hidden';
        setTimeout(function () { $('pl-name').focus(); }, 60);
    }

    function closePlaylistModal() {
        $('pl-modal').hidden = true;
        document.body.style.overflow = '';
        state.editingId = null;
    }

    function normalizeUrl(url) {
        url = url.trim();
        if (url && !/^https?:\/\//i.test(url)) url = 'http://' + url;
        return url.replace(/\/+$/, '');
    }

    function savePlaylist() {
        var msg = $('pl-msg');
        var type = currentPlaylistType();
        var name = $('pl-name').value.trim();

        hideMsg(msg);
        var invalid = document.querySelectorAll('#form-playlist .is-invalid');
        for (var i = 0; i < invalid.length; i++) invalid[i].classList.remove('is-invalid');

        var playlist = {
            id: state.editingId || 'pl_' + Date.now().toString(36),
            name: name,
            type: type,
            url: '',
            user: '',
            pass: '',
            createdAt: new Date().toISOString()
        };

        if (type === 'xtream') {
            playlist.url = normalizeUrl($('x-url').value);
            playlist.user = $('x-user').value.trim();
            playlist.pass = $('x-pass').value.trim();

            if (!playlist.url || !playlist.user || !playlist.pass) {
                if (!playlist.url) $('x-url').classList.add('is-invalid');
                if (!playlist.user) $('x-user').classList.add('is-invalid');
                if (!playlist.pass) $('x-pass').classList.add('is-invalid');
                showMsg(msg, 'Preencha servidor, usuário e senha do Xtream Codes.');
                return;
            }
            if (!playlist.name) playlist.name = playlist.url.replace(/^https?:\/\//, '');
        } else {
            playlist.url = normalizeUrl($('m-url').value);
            if (!playlist.url) {
                $('m-url').classList.add('is-invalid');
                showMsg(msg, 'Cole a URL da sua lista M3U.');
                return;
            }
            if (!playlist.name) playlist.name = 'Lista M3U';
        }

        // Edição mantém a data original para não bagunçar a ordem.
        if (state.editingId) {
            var existing = state.playlists.filter(function (item) { return item.id === state.editingId; })[0];
            if (existing && existing.createdAt) playlist.createdAt = existing.createdAt;
        }

        var btn = $('btn-save-playlist');
        setLoading(btn, true);

        apiWrite('PUT', '/playlists/' + playlist.id, playlist)
            .then(function () {
                var index = -1;
                for (var i = 0; i < state.playlists.length; i++) {
                    if (state.playlists[i].id === playlist.id) { index = i; break; }
                }
                if (index >= 0) state.playlists[index] = playlist;
                else state.playlists.push(playlist);

                // Editar a lista ativa sempre re-sincroniza a cópia que a TV lê.
                var shouldActivate = $('pl-activate').checked || playlist.id === state.activeId;
                renderPlaylists();

                if (shouldActivate) return activatePlaylist(playlist);
                toast(state.editingId ? 'Lista atualizada.' : 'Lista adicionada.');
            })
            .then(function () {
                setLoading(btn, false);
                closePlaylistModal();
            })
            .catch(function (err) {
                console.error(err);
                setLoading(btn, false);
                showMsg(msg, 'Não foi possível salvar a lista. Verifique sua conexão.');
            });
    }

    // ------------------------------------------------------------ Acesso/sessão

    function enterPanel(device) {
        state.device = device;
        loadPlaylists(device);

        $('panel-mac').textContent = state.mac;
        renderSubscription();
        renderPlaylists();

        $('screen-access').classList.remove('is-visible');
        $('screen-panel').classList.add('is-visible');
        window.scrollTo(0, 0);
    }

    function submitAccess(event) {
        if (event) event.preventDefault();

        var macInput = $('mac-address');
        var keyInput = $('device-key');
        var msg = $('access-msg');
        var btn = $('btn-access');

        var mac = macInput.value.trim().toUpperCase();
        var key = keyInput.value.trim();

        hideMsg(msg);
        macInput.classList.remove('is-invalid');
        keyInput.classList.remove('is-invalid');

        if (safeMac(mac).length !== 12) {
            macInput.classList.add('is-invalid');
            showMsg(msg, 'MAC Address incompleto — confira os 12 caracteres mostrados na TV.');
            return;
        }
        if (key.length < 6) {
            keyInput.classList.add('is-invalid');
            showMsg(msg, 'A Device Key tem 6 dígitos.');
            return;
        }

        state.mac = mac;
        state.key = key;
        setLoading(btn, true);

        apiGet('')
            .then(function (device) {
                if (!device) {
                    throw new Error('Dispositivo não encontrado. Abra o app HeisenIPTV na TV pelo menos uma vez.');
                }
                if (String(device.deviceKey) !== key) {
                    throw new Error('Device Key incorreta para este MAC. Confira o código na tela da TV.');
                }

                try {
                    localStorage.setItem(SESSION_KEY, JSON.stringify({ mac: mac, key: key }));
                } catch (e) { /* modo privado */ }

                setLoading(btn, false, 'Acessar painel');
                enterPanel(device);
            })
            .catch(function (err) {
                setLoading(btn, false, 'Acessar painel');
                showMsg(msg, err.message || 'Erro de conexão com o servidor.');
            });
    }

    function logout() {
        try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignora */ }
        state.mac = '';
        state.key = '';
        state.device = null;
        state.playlists = [];
        state.plan = null;

        $('device-key').value = '';
        $('screen-panel').classList.remove('is-visible');
        $('screen-access').classList.add('is-visible');
        window.scrollTo(0, 0);
    }

    function restoreSession() {
        var raw;
        try { raw = localStorage.getItem(SESSION_KEY); } catch (e) { return; }
        if (!raw) return;

        var session;
        try { session = JSON.parse(raw); } catch (e) { return; }
        if (!session || !session.mac || !session.key) return;

        $('mac-address').value = session.mac;
        $('device-key').value = session.key;
        state.mac = session.mac;
        state.key = session.key;

        apiGet('')
            .then(function (device) {
                if (device && String(device.deviceKey) === session.key) enterPanel(device);
            })
            .catch(function () { /* fica na tela de acesso */ });
    }

    // ------------------------------------------------------- Máscara do MAC

    function maskMac(event) {
        var input = event.target;
        var digits = input.value.replace(/[^a-fA-F0-9]/g, '').toUpperCase().slice(0, 12);
        var out = '';
        for (var i = 0; i < digits.length; i++) {
            if (i > 0 && i % 2 === 0) out += ':';
            out += digits[i];
        }
        input.value = out;
    }

    // -------------------------------------------------- Carrossel das prévias

    function setupShowcase() {
        var track = $('shots');
        var dotsBox = $('shot-dots');
        if (!track || !dotsBox) return;

        var shots = track.querySelectorAll('.shot');
        if (shots.length < 2) return;

        var DELAY = 5000;      // tempo em cada prévia
        var RESUME = 9000;     // volta a girar depois de mexerem nele
        var index = 0;
        var timer = null;
        var idleTimer = null;
        var scrollTimer = null;
        var onScreen = true;
        var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var dots = [];

        for (var i = 0; i < shots.length; i++) {
            (function (position) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'dot';
                dot.setAttribute('aria-label', 'Prévia ' + (position + 1));
                dot.addEventListener('click', function () {
                    hold();
                    goTo(position);
                });
                dotsBox.appendChild(dot);
                dots.push(dot);
            })(i);
        }

        function paint() {
            for (var d = 0; d < dots.length; d++) {
                dots[d].classList.toggle('is-on', d === index);
            }
        }

        function goTo(position) {
            index = (position + shots.length) % shots.length;
            var shot = shots[index];
            // Centraliza o quadro no trilho sem mexer na rolagem da página.
            var left = shot.offsetLeft - (track.clientWidth - shot.clientWidth) / 2;
            try {
                track.scrollTo({ left: left, behavior: still ? 'auto' : 'smooth' });
            } catch (e) {
                track.scrollLeft = left;   // navegadores sem scrollTo suave
            }
            paint();
        }

        // Com "reduzir movimento" ligado o carrossel continua girando,
        // só que trocando de quadro na hora, sem a rolagem animada.
        function play() {
            if (timer) return;
            timer = setInterval(function () {
                if (onScreen && !document.hidden) goTo(index + 1);
            }, DELAY);
        }

        function stop() {
            clearInterval(timer);
            timer = null;
        }

        /** Pausa enquanto mexem no carrossel e retoma sozinho depois. */
        function hold() {
            stop();
            clearTimeout(idleTimer);
            idleTimer = setTimeout(play, RESUME);
        }

        // Arrastar com o dedo também atualiza as bolinhas.
        track.addEventListener('scroll', function () {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function () {
                var center = track.scrollLeft + track.clientWidth / 2;
                var nearest = 0;
                var shortest = Infinity;
                for (var s = 0; s < shots.length; s++) {
                    var distance = Math.abs((shots[s].offsetLeft + shots[s].clientWidth / 2) - center);
                    if (distance < shortest) { shortest = distance; nearest = s; }
                }
                index = nearest;
                paint();
            }, 130);
        }, { passive: true });

        track.addEventListener('pointerdown', hold);
        track.addEventListener('touchstart', hold, { passive: true });
        track.addEventListener('mouseenter', stop);
        track.addEventListener('mouseleave', play);

        if (window.IntersectionObserver) {
            new IntersectionObserver(function (entries) {
                onScreen = entries[0].isIntersecting;
            }, { threshold: 0.3 }).observe(track);
        }

        paint();
        play();
    }

    // ------------------------------------------------------------- Bootstrap

    document.addEventListener('DOMContentLoaded', function () {
        $('form-access').addEventListener('submit', submitAccess);
        $('mac-address').addEventListener('input', maskMac);
        $('device-key').addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 6);
        });

        $('btn-logout').addEventListener('click', logout);
        $('btn-add-playlist').addEventListener('click', function () { openPlaylistModal(null); });

        var planButtons = document.querySelectorAll('.plan');
        for (var i = 0; i < planButtons.length; i++) {
            planButtons[i].addEventListener('click', function () { selectPlan(this.dataset.plan); });
        }
        $('btn-pay').addEventListener('click', startCheckout);

        var segButtons = document.querySelectorAll('.seg-btn');
        for (var s = 0; s < segButtons.length; s++) {
            segButtons[s].addEventListener('click', function () { setPlaylistType(this.dataset.type); });
        }

        $('form-playlist').addEventListener('submit', function (event) {
            event.preventDefault();
            savePlaylist();
        });

        var closers = document.querySelectorAll('#pl-modal [data-close]');
        for (var c = 0; c < closers.length; c++) {
            closers[c].addEventListener('click', closePlaylistModal);
        }
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !$('pl-modal').hidden) closePlaylistModal();
        });

        setupShowcase();
        restoreSession();
    });
})();
