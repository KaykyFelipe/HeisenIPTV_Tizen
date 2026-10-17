/**
 * HeisenIPTV - 1:1 REPLICATION OF ANDROID FLUTTER CORE
 * Full M3U + Xtream Codes API + Netflix Rails + Series Episodes + TV Remote Engine
 */

// Application State
var state = {
    currentView: 'view-dashboard',
    streams: [],
    channels: [],
    categories: [],
    selectedCategory: null,
    categoryChannels: [],
    currentChannel: null,
    
    // Netflix VOD & Series State
    vodType: 'movie', // 'movie' or 'series'
    vodCategories: {},
    vodCatNames: [],
    renderedRails: 0,
    renderedCardsPerRow: [],
    gridItems: [],
    gridRenderedCount: 0,
    focusedVodItem: null,
    currentSeries: null,
    selectedSeason: null,
    seriesEpisodes: {},
    
    // Remote D-Pad Focus State
    focusedElement: null,
    dashIndex: 0,
    catIndex: 0,
    channelIndex: 0,
    netflixRailIndex: 0,
    netflixCardIndex: 0,
    
    // Situação da lista no provedor ('none' | 'ok' | 'expired' | 'blocked' | 'auth' | 'empty')
    listState: 'none',
    listInfo: null,

    // Persistence
    favorites: JSON.parse(localStorage.getItem('flux_favorites') || '[]'),
    credentials: JSON.parse(localStorage.getItem('flux_credentials') || 'null'),
    
    // Player
    osdTimer: null
};

var player = null;

// Built-in Demo Channels
var DEMO_CHANNELS = [
    {
        name: "TV Brasil HD (Ao Vivo)",
        groupTitle: "Abertos Brasil",
        tvgLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/TV_Globo_logo_2021.svg/300px-TV_Globo_logo_2021.svg.png",
        url: "https://ebc-live.akamaized.net/live/tvbrasil/index.m3u8",
        epgNow: "Repórter Brasil - Notícias em Tempo Real",
        streamType: "live"
    },
    {
        name: "Record News HD (Ao Vivo)",
        groupTitle: "Abertos Brasil",
        tvgLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Record_2023.svg/300px-Record_2023.svg.png",
        url: "https://recordnews-live.cdn.jmvstream.com/live/recordnews/playlist.m3u8",
        epgNow: "Jornal Record News - Ao Vivo",
        streamType: "live"
    },
    {
        name: "Jovem Pan News HD",
        groupTitle: "Notícias & 24h",
        tvgLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Jovem_Pan_News_logo.svg/300px-Jovem_Pan_News_logo.svg.png",
        url: "https://stream.jp.com.br/hls/jpnews/index.m3u8",
        epgNow: "Os Pingos nos Is - Análise e Opinião",
        streamType: "live"
    },
    {
        name: "NASA TV HD (Espaço 24h)",
        groupTitle: "Notícias & 24h",
        tvgLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/300px-NASA_logo.svg.png",
        url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8",
        epgNow: "Transmissão ao vivo da Estação Espacial Internacional (ISS)",
        streamType: "live"
    },
    {
        name: "Red Bull TV HD (Esportes Radicais)",
        groupTitle: "Esportes",
        tvgLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/300px-ESPN_wordmark.svg.png",
        url: "https://rbmn-live.akamaized.net/hls/live/590964/Bo1/master.m3u8",
        epgNow: "Red Bull Cliff Diving & Motorsport Highlights",
        streamType: "live"
    },
    {
        name: "Big Buck Bunny HD (Stream Teste)",
        groupTitle: "Esportes",
        tvgLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/SporTV_logo_2021.svg/300px-SporTV_logo_2021.svg.png",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        epgNow: "Transmissão de Teste HLS Multibitrate",
        streamType: "live"
    },
    // Movies / VOD
    {
        name: "Oppenheimer (2023) 4K",
        groupTitle: "Filmes Destaque",
        tvgLogo: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        plot: "A história do físico J. Robert Oppenheimer liderando o Projeto Manhattan e a criação da primeira bomba atômica da história.",
        year: "2023",
        duration: "3h 00m",
        cast: "Cillian Murphy, Emily Blunt, Matt Damon",
        genre: "Biografia, Drama",
        streamType: "movie"
    },
    {
        name: "Top Gun: Maverick",
        groupTitle: "Ação & Aventura",
        tvgLogo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=60",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        plot: "Depois de mais de 30 anos servindo como um dos melhores aviadores da Marinha, Pete Maverick Mitchell continua superando limites.",
        year: "2022",
        duration: "2h 10m",
        cast: "Tom Cruise, Miles Teller",
        genre: "Ação, Aventura",
        streamType: "movie"
    },
    {
        name: "Duna: Parte 2",
        groupTitle: "Ficção Científica",
        tvgLogo: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=60",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        plot: "Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.",
        year: "2024",
        duration: "2h 46m",
        cast: "Timothée Chalamet, Zendaya",
        genre: "Ficção Científica",
        streamType: "movie"
    },
    // Series
    {
        name: "House of the Dragon",
        groupTitle: "Séries Populares",
        tvgLogo: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&auto=format&fit=crop&q=60",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        plot: "A história da guerra civil da Casa Targaryen, que ocorreu cerca de 200 anos antes dos eventos de Game of Thrones.",
        year: "2024",
        duration: "2 Temporadas",
        cast: "Emma D'Arcy, Matt Smith",
        genre: "Fantasia, Drama",
        streamType: "series",
        episodes: {
            "Temporada 1": [
                { title: "Episódio 1: Os Herdeiros do Dragão", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
                { title: "Episódio 2: O Príncipe Rebelde", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
                { title: "Episódio 3: O Segundo de Seu Nome", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
            ],
            "Temporada 2": [
                { title: "Episódio 1: Filho por Filho", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
                { title: "Episódio 2: Rhaenyra a Cruel", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" }
            ]
        }
    }
];

// Document Initialization
window.addEventListener('load', function() {
    console.log('[HeisenIPTV] Window Loaded. Initializing TV App...');

    // 1. Register Tizen Samsung Remote Keys
    registerSamsungKeys();

    // 2. Traduções (antes de qualquer tela aparecer)
    I18N.apply();
    marcarIdiomaAtivo();

    // 3. Start Live Clock
    startClock();

    // 3. Initialize Native Video Player
    player = new HeisenPlayer();
    player.onTimeUpdate = onPlayerTimeUpdate;

    // 4. Start MAC Authentication Flow (Replaces hardcoded loading)
    initMacAuth();

    // 5. Attach Click Handlers
    attachHandlers();

    // 6. Global Keydown Listener
    window.addEventListener('keydown', handleRemoteKey, false);
    document.addEventListener('visibilitychange', aoMudarVisibilidade, false);

    // 7. Focus Guard Interval
    setInterval(function() {
        // Se o app já tem uma seleção lógica VÁLIDA, não mexe: campos de texto
        // ficam selecionados sem foco real no DOM e o guard roubaria a seleção.
        // Se o elemento sumiu num re-render, cai fora do if e se recupera.
        if (state.focusedElement && document.body.contains(state.focusedElement)) return;
        if (!document.activeElement || document.activeElement === document.body) {
            var currentScreen = document.getElementById(state.currentView);
            if (currentScreen) {
                var first = currentScreen.querySelector('.focusable');
                if (first) setElementFocus(first);
            }
        }
    }, 1500);
});

function registerSamsungKeys() {
    try {
        if (window.tizen && window.tizen.tvinputdevice) {
            var keys = [
                'MediaPlay', 'MediaPause', 'MediaStop', 'MediaFastForward', 'MediaRewind',
                'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue',
                'ChannelUp', 'ChannelDown', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
            ];
            for (var i = 0; i < keys.length; i++) {
                try { window.tizen.tvinputdevice.registerKey(keys[i]); } catch (e) {}
            }
            console.log('[HeisenIPTV] Samsung TV Remote keys registered successfully.');
        }
    } catch (err) {
        console.warn('[HeisenIPTV] TV key registration notice:', err);
    }
}

// ==========================================================================
// MAC AUTHENTICATION (FIREBASE POLLING)
// ==========================================================================
function initMacAuth() {
    try {
        macAddress = window.webapis.network.getMac().toUpperCase();
    } catch(e) {
        console.warn('Failed to get MAC natively. Falling back to generated ID.');
        var storedMac = localStorage.getItem('flux_virtual_mac');
        if (!storedMac) {
            var hex = function() { return Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase(); };
            storedMac = hex()+':'+hex()+':'+hex()+':'+hex()+':'+hex()+':'+hex();
            localStorage.setItem('flux_virtual_mac', storedMac);
        }
        macAddress = storedMac;
    }

    deviceKey = localStorage.getItem('flux_device_key');
    if (!deviceKey) {
        deviceKey = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('flux_device_key', deviceKey);
    }
    
    var macEl = document.getElementById('act-mac-address');
    var keyEl = document.getElementById('act-device-key');
    if(macEl) macEl.innerText = macAddress;
    if(keyEl) keyEl.innerText = deviceKey;

    var setMac = document.getElementById('settings-mac-address');
    var setKey = document.getElementById('settings-device-key');
    if(setMac) setMac.innerText = macAddress;
    if(setKey) setKey.innerText = deviceKey;
    
    switchView('view-activation');
    
    // Registrar a TV no banco de dados e inicializar Trial se for novo
    var safeMac = macAddress.replace(/:/g, ''); 
    var url = firebaseDbUrl + '/devices/' + safeMac + '.json';
    
    fetch(url + '?t=' + new Date().getTime(), { cache: 'no-store' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var updates = { mac: macAddress, deviceKey: deviceKey };
            if (!data || !data.trialStartDate) {
                updates.trialStartDate = new Date().toISOString();
                updates.isPaid = false;
            }
            return fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        })
        .then(function() { pollFirebaseAuth(); })
        .catch(function(e) {
            console.error('Erro ao inicializar Firebase:', e);
            pollFirebaseAuth();
        });
}

function pollFirebaseAuth() {
    var safeMac = macAddress.replace(/:/g, ''); 
    // Quebrar cache agressivo do Tizen com timestamp
    var url = firebaseDbUrl + '/devices/' + safeMac + '.json?t=' + new Date().getTime();
    
    fetch(url, { cache: 'no-store' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            // Se o usuário está ativo no Firebase
            if (data && data.status === 'active' && data.playlist) {
                
                // --- LICENSE GUARD (TRIAL & EXPIRATION CHECK) ---
                var isPaid = data.isPaid === true;
                var now = new Date();
                
                if (isPaid && data.expirationDate) {
                    var expDate = new Date(data.expirationDate);
                    if (now > expDate) {
                        isPaid = false; // Licença anual expirada
                    }
                }

                var trialStart = new Date(data.trialStartDate || new Date());
                var diffDays = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) diffDays = 0; // Previne datas no futuro gerarem mais de 7 dias
                
                if (!isPaid && diffDays >= 7) {
                    // LICENÇA EXPIRADA
                    clearInterval(macAuthTimer); // Para o polling rápido
                    
                    var expTitle = document.querySelector('#view-activation .brand-title');
                    var expMsg = document.querySelector('#view-activation p');
                    if (expTitle) {
                        expTitle.innerText = t('ativacao.expirada');
                        expTitle.style.color = '#e50914';
                    }
                    if (expMsg) {
                        expMsg.innerHTML = t('ativacao.expirada_msg');
                    }
                    
                    switchView('view-activation');
                    
                    // Começa a fazer polling mais lento (a cada 15 segs) esperando o pagamento
                    macAuthTimer = setInterval(pollFirebaseAuth, 15000);
                    return; // Bloqueia o carregamento
                }
                
                // Atualiza o texto de expiração no rodapé da Dashboard
                var expFooter = document.getElementById('footer-expiration');
                if (expFooter) {
                    if (isPaid) {
                        if (data.expirationDate) {
                            var eDate = new Date(data.expirationDate);
                            expFooter.innerText = t('dash.exp_data', { d: eDate.toLocaleDateString(dataLocale()) });
                        } else {
                            expFooter.innerText = t('dash.exp_vitalicia');
                        }
                    } else {
                        var remainingDays = 7 - diffDays;
                        expFooter.innerText = t('dash.exp_teste', { n: remainingDays });
                    }
                }

                clearInterval(macAuthTimer);
                
                // Conectar usando os dados remotos
                if (data.playlist.type === 'xtream') {
                    connectXtream(data.playlist.url, data.playlist.user, data.playlist.pass);
                } else if (data.playlist.type === 'm3u') {
                    loadM3U(data.playlist.url);
                }
                
                // Mudar para a tela principal
                switchView('view-dashboard');
                
                // Aviso de Trial
                if (!isPaid) {
                    var diasRestantes = 7 - diffDays;
                    if (diasRestantes < 0) diasRestantes = 0;
                    showToast(t('toast.trial', { n: diasRestantes }));
                }

                focusDashboardItem(0);
            } else {
                // Manter na tela de ativação
                if (!macAuthTimer) macAuthTimer = setInterval(pollFirebaseAuth, 5000);
            }
        })
        .catch(function(e) {
            console.error('Firebase polling error:', e);
            // Em caso de erro na rede (Tizen offline), tenta novamente
            if (!macAuthTimer) macAuthTimer = setInterval(pollFirebaseAuth, 5000);
        });
}

/** Locale de datas conforme o idioma escolhido nas Configurações. */
function dataLocale() {
    if (I18N.lang === 'es') return 'es-ES';
    if (I18N.lang === 'en') return 'en-US';
    return 'pt-BR';
}

function startClock() {
    var update = function() {
        var now = new Date();
        var timeStr = now.toLocaleTimeString(dataLocale(), { hour: '2-digit', minute: '2-digit' });
        var dateStr = now.toLocaleDateString(dataLocale(), { month: 'short', day: '2-digit', year: 'numeric' });
        
        var headerClock = document.getElementById('header-clock');
        var playerClock = document.getElementById('player-clock');
        
        if (headerClock) headerClock.innerText = timeStr + '   ' + dateStr;
        if (playerClock) playerClock.innerText = timeStr;
    };
    update();
    setInterval(update, 1000);
}

function loadStreams(streamsArray) {
    state.streams = streamsArray;
    state.channels = streamsArray;

    // Group Live Channels
    var live = [];
    for (var i = 0; i < streamsArray.length; i++) {
        if (streamsArray[i].streamType === 'live' || !streamsArray[i].streamType) {
            live.push(streamsArray[i]);
        }
    }

    var catMap = {};
    catMap[t('live.favoritos')] = state.favorites.length;
    for (var j = 0; j < live.length; j++) {
        var g = live[j].groupTitle || t('live.geral');
        catMap[g] = (catMap[g] || 0) + 1;
    }

    state.categories = Object.keys(catMap).map(function(name) {
        return { name: name, count: catMap[name] };
    });

    renderLiveCategories();
}

// ==========================================================================
// SITUAÇÃO DA LISTA NO PROVEDOR
// O HeisenIPTV é só o player: quem controla a validade da lista é o provedor
// de IPTV do usuário. Aqui a gente apenas lê o que o painel informa e avisa —
// sem bloquear nada, do mesmo jeito que IBO Player e IPTV Smarters fazem.
// ==========================================================================

function setListState(kind, info) {
    state.listState = kind;
    if (info) state.listInfo = info;
    renderListInfoSettings();
}

/** Lê o user_info do Xtream e decide em que situação a lista está. */
function readProviderInfo(domain, user, info) {
    var expMs = 0;
    if (info.exp_date) {
        expMs = parseInt(info.exp_date, 10) * 1000;
        if (isNaN(expMs)) expMs = 0;
    }

    var parsed = {
        type: 'xtream',
        server: domain.replace(/^https?:\/\//, ''),
        user: user,
        status: info.status || '',
        expMs: expMs,
        expLabel: expMs ? new Date(expMs).toLocaleDateString(dataLocale()) : t('lista.nao_informada'),
        maxConnections: info.max_connections || '',
        activeConnections: (info.active_cons === 0 || info.active_cons) ? String(info.active_cons) : '',
        isTrial: String(info.is_trial) === '1',
        checkedAt: new Date().toISOString()
    };

    var statusText = String(parsed.status).toLowerCase();
    var kind = 'ok';

    if (statusText && statusText !== 'active') {
        // Painéis Xtream costumam usar Expired, Banned ou Disabled.
        kind = (statusText === 'expired') ? 'expired' : 'blocked';
    } else if (expMs && Date.now() > expMs) {
        // Alguns painéis deixam "Active" mesmo depois da data já ter passado.
        kind = 'expired';
    }

    setListState(kind, parsed);
    publishListInfo(parsed, kind);
}

/** Mesma frase no toast, na tela vazia e nas configurações. */
function listStateMessage() {
    var info = state.listInfo;
    if (state.listState === 'expired') {
        return (info && info.expMs ? t('lista.msg_expired', { d: info.expLabel }) : t('lista.msg_expired_sd'));
    }
    if (state.listState === 'blocked') {
        return t('lista.msg_blocked', { s: (info && info.status) ? info.status : '-' });
    }
    if (state.listState === 'auth') {
        return t('lista.msg_auth');
    }
    if (state.listState === 'empty') {
        return t('lista.msg_empty');
    }
    if (state.listState === 'none') {
        return t('lista.msg_none');
    }
    return '';
}

/** Bloco de "sem conteúdo" mostrado dentro das grades vazias. */
function listEmptyStateHtml() {
    var expired = (state.listState === 'expired' || state.listState === 'blocked');
    return '<div class="list-empty-state">' +
               '<div class="list-empty-icon">' + (expired ? '⚠️' : '📭') + '</div>' +
               '<h3 class="list-empty-title">' +
                   (expired ? t('lista.vazio_inativa') : t('lista.vazio_nada')) +
               '</h3>' +
               '<p class="list-empty-msg">' + listStateMessage() + '</p>' +
           '</div>';
}

/** Manda o status para o Firebase para o portal poder mostrar no celular. */
function publishListInfo(info, kind) {
    if (!macAddress || macAddress === 'CARREGANDO...') return;
    var safeMac = macAddress.replace(/:/g, '');
    fetch(firebaseDbUrl + '/devices/' + safeMac + '.json', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            listInfo: {
                state: kind,
                status: info.status || '',
                expDate: info.expMs ? new Date(info.expMs).toISOString() : null,
                maxConnections: info.maxConnections || '',
                checkedAt: info.checkedAt
            }
        })
    }).catch(function(e) {
        console.warn('[HeisenIPTV] Não foi possível publicar o status da lista:', e);
    });
}

/** Preenche o cartão "Informações da Lista" na tela de Configurações. */
function renderListInfoSettings() {
    var info = state.listInfo;
    var set = function(id, text) {
        var el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    var rotulos = {
        ok: t('lista.ok'), expired: t('lista.expired'), blocked: t('lista.blocked'),
        auth: t('lista.auth'), empty: t('lista.empty'), none: t('lista.none')
    };

    set('list-info-status', rotulos[state.listState] || '—');
    set('list-info-server', info ? info.server : '—');
    set('list-info-user', info && info.user ? info.user : '—');
    set('list-info-exp', info && info.type === 'xtream' ? info.expLabel : t('lista.nao_informada_m3u'));
    set('list-info-conns', info && info.maxConnections
        ? info.activeConnections + ' de ' + info.maxConnections
        : '—');

    var statusEl = document.getElementById('list-info-status');
    if (statusEl) {
        statusEl.style.color = (state.listState === 'ok') ? '#46D369'
                             : (state.listState === 'none') ? '' : '#E50914';
    }

    var noteEl = document.getElementById('list-info-note');
    if (noteEl) {
        var msg = (state.listState === 'ok') ? '' : listStateMessage();
        noteEl.innerText = msg;
        noteEl.style.display = msg ? 'block' : 'none';
    }
}

function switchView(viewId) {
    state.currentView = viewId;
    var screens = document.querySelectorAll('.view-screen');
    for (var i = 0; i < screens.length; i++) {
        if (screens[i].id === viewId) {
            screens[i].classList.remove('hidden');
            screens[i].classList.add('active');
        } else {
            screens[i].classList.add('hidden');
            screens[i].classList.remove('active');
        }
    }

    var mainContainer = document.getElementById('main-container');
    if (viewId === 'player-view') {
        if (mainContainer) mainContainer.classList.add('hidden');
        document.body.classList.add('in-player-mode');
    } else {
        if (mainContainer) mainContainer.classList.remove('hidden');
        document.body.classList.remove('in-player-mode');
    }
}

// ==========================================================================
// DETERMINISTIC FOCUS CONTROLLER
// ==========================================================================

function setElementFocus(el) {
    if (!el) return;
    if (state.focusedElement) {
        state.focusedElement.classList.remove('focused');
    }
    state.focusedElement = el;
    el.classList.add('focused');
    
    // Em <input>, chamar focus() faz a TV abrir o teclado na hora. Aqui a
    // seleção é só visual (classe .focused); o teclado abre no OK, em
    // handleRemoteKey.
    if (el.tagName !== 'INPUT') {
        try {
            el.focus();
        } catch (e) {}
    }

    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    // Sync index state
    if (el.classList.contains('category-card') && el.dataset.index !== undefined) {
        state.catIndex = parseInt(el.dataset.index, 10);
    } else if (el.classList.contains('channel-list-card') && el.dataset.index !== undefined) {
        state.channelIndex = parseInt(el.dataset.index, 10);
    } else if (el.classList.contains('dash-tile') && el.dataset.index !== undefined) {
        state.dashIndex = parseInt(el.dataset.index, 10);
    }

    // Handle Netflix Card Change
    if (el.classList.contains('movie-poster-card')) {
        revealRailOfCard(el);
        var data = el.dataset.item ? JSON.parse(el.dataset.item) : null;
        if (data) updateHeroSection(data);
    }
}

/**
 * Rola a fileira INTEIRA para dentro da área visível, título junto.
 * O scrollIntoView acima só garante o card; como o nome da categoria fica
 * acima dele, ao descer com o controle o título ficava cortado para fora.
 */
function revealRailOfCard(card) {
    var lista = card.parentNode;
    var fileira = lista && lista.parentNode;
    if (!fileira || !fileira.className || fileira.className.indexOf('rail-row') === -1) return;

    var cont = document.getElementById('netflix-rails');
    if (!cont) return;

    var topoFileira = fileira.getBoundingClientRect().top;
    var topoCont = cont.getBoundingClientRect().top;

    // Encosta o topo da fileira no topo da área, com uma folga de respiro.
    var alvo = cont.scrollTop + (topoFileira - topoCont) - 10;
    cont.scrollTop = alvo < 0 ? 0 : alvo;
}

function focusDashboardItem(index) {
    var tiles = document.querySelectorAll('.dash-tile');
    if (index >= 0 && index < tiles.length) {
        state.dashIndex = index;
        setElementFocus(tiles[index]);
    }
}

function focusCategoryItem(index) {
    var cards = document.querySelectorAll('.category-card');
    if (cards.length === 0) return;
    state.catIndex = Math.max(0, Math.min(index, cards.length - 1));
    setElementFocus(cards[state.catIndex]);
}

function focusChannelItem(index) {
    var cards = document.querySelectorAll('.channel-list-card');
    if (cards.length === 0) return;
    state.channelIndex = Math.max(0, Math.min(index, cards.length - 1));
    setElementFocus(cards[state.channelIndex]);
}

// ==========================================================================
// VIEW RENDERING
// ==========================================================================

function renderLiveCategories() {
    var grid = document.getElementById('live-categories-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Sem nenhum canal carregado: explica o motivo em vez de deixar a tela vazia.
    if (state.streams.length === 0) {
        grid.innerHTML = listEmptyStateHtml();
        return;
    }

    for (var i = 0; i < state.categories.length; i++) {
        var cat = state.categories[i];
        var card = document.createElement('div');
        card.className = 'category-card focusable';
        card.tabIndex = 0;
        card.dataset.index = i;
        card.innerHTML = 
            '<span class="category-folder-icon">' + (cat.name === t('live.favoritos') ? '⭐' : '📁') + '</span>' +
            '<div class="category-card-meta">' +
                '<div class="category-card-name">' + cat.name + '</div>' +
                '<div class="category-card-count">' + t('live.n_canais', { n: cat.count }) + '</div>' +
            '</div>';
        
        (function(cName) {
            card.addEventListener('click', function() {
                openCategoryChannels(cName);
            });
        })(cat.name);

        grid.appendChild(card);
    }
}

function openCategoryChannels(categoryName, searchQuery) {
    state.selectedCategory = categoryName;
    document.getElementById('selected-category-title').innerText = categoryName;

    var filtered = [];
    if (searchQuery) {
        var query = searchQuery.toLowerCase();
        for (var i = 0; i < state.channels.length; i++) {
            var s = state.channels[i];
            if ((s.streamType === 'live' || !s.streamType) && s.name.toLowerCase().indexOf(query) !== -1) {
                filtered.push(s);
            }
        }
    } else if (categoryName === t('live.favoritos')) {
        filtered = state.favorites;
    } else {
        for (var i = 0; i < state.channels.length; i++) {
            var s = state.channels[i];
            if ((s.streamType === 'live' || !s.streamType) && (s.groupTitle || t('live.geral')) === categoryName) {
                filtered.push(s);
            }
        }
    }
    state.categoryChannels = filtered;
    document.getElementById('selected-category-count').innerText = t('live.itens', { n: filtered.length });

    var grid = document.getElementById('category-channels-grid');
    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = listEmptyStateHtml();
        switchView('view-category-channels');
        return;
    }

    for (var j = 0; j < filtered.length; j++) {
        var ch = filtered[j];
        var card = document.createElement('div');
        card.className = 'channel-list-card focusable';
        card.tabIndex = 0;
        card.dataset.index = j;
        
        var isFav = false;
        for (var f = 0; f < state.favorites.length; f++) {
            if (state.favorites[f].name === ch.name) {
                isFav = true;
                break;
            }
        }

        card.innerHTML = 
            '<img src="' + (ch.tvgLogo || '') + '" class="channel-card-logo" alt="" onerror="this.style.display=\'none\'">' +
            '<div class="channel-card-info">' +
                '<div class="channel-card-title">' + ch.name + '</div>' +
                '<div class="channel-card-sub">' + (ch.epgNow || ch.groupTitle || t('player.transmissao')) + '</div>' +
            '</div>' +
            '<span class="btn-fav-icon ' + (isFav ? 'active' : '') + '">' + (isFav ? '❤️' : '🤍') + '</span>';
        
        (function(channel) {
            card.addEventListener('click', function() {
                playChannelFullscreen(channel);
            });
        })(ch);

        grid.appendChild(card);
    }

    switchView('view-category-channels');
    focusChannelItem(0);
}

// --------------------------------------------------------------------------
// LAYOUT DO VOD: "Destaques" (trilhos) ou "Por Categoria" (pastas)
// --------------------------------------------------------------------------

/** Agrupa os títulos por categoria. Usado pelos dois layouts. */
function buildVodGroups(type) {
    var filtered = [];
    for (var i = 0; i < state.streams.length; i++) {
        if (state.streams[i].streamType === type) filtered.push(state.streams[i]);
    }

    var groups = {};
    for (var j = 0; j < filtered.length; j++) {
        var s = filtered[j];
        var g = s.groupTitle || (type === 'movie' ? t('vod.filmes_destaque') : t('vod.series_populares'));
        if (!groups[g]) groups[g] = [];
        groups[g].push(s);
    }

    state.vodCategories = groups;
    state.vodCatNames = Object.keys(groups);
    return filtered;
}

/**
 * Busca enquanto digita. Redesenha só os trilhos, sem trocar de tela e sem
 * tocar no foco — se trocasse de view, o teclado da TV fecharia a cada letra.
 */
var vodSearchTimer = null;

function runVodSearch(termo) {
    var q = String(termo || '').trim().toLowerCase();

    // Termo apagado (ou curto demais): volta ao catálogo normal.
    if (q.length < 2) {
        buildVodGroups(state.vodType);
        renderVodRails();
        return;
    }

    var achados = [];
    for (var i = 0; i < state.streams.length; i++) {
        var s = state.streams[i];
        if (s.streamType !== state.vodType) continue;
        if (String(s.name).toLowerCase().indexOf(q) === -1) continue;
        achados.push(s);
        if (achados.length >= 60) break;   // catálogo tem mais de 20 mil itens
    }

    var railsContainer = document.getElementById('netflix-rails');
    if (!railsContainer) return;

    if (achados.length === 0) {
        state.vodCategories = {};
        state.vodCatNames = [];
        state.renderedRails = 0;
        state.renderedCardsPerRow = [];
        railsContainer.innerHTML =
            '<div class="rail-row"><h3 class="rail-title">' + t('vod.nada_encontrado', { q: termo }) + '</h3></div>';
        return;
    }

    var rotulo = t(achados.length === 1 ? 'vod.resultado' : 'vod.resultados',
                   { n: achados.length, q: termo }) +
                 (achados.length >= 60 ? t('vod.primeiros') : '');

    state.vodCategories = {};
    state.vodCategories[rotulo] = achados;
    state.vodCatNames = [rotulo];
    renderVodRails();
    updateHeroSection(achados[0]);
}

/** Só pinta qual opção está ativa, nos dois seletores da tela. */
function markVodLayout(layout) {
    var opts = document.querySelectorAll('.layout-opt');
    for (var i = 0; i < opts.length; i++) {
        opts[i].classList.toggle('is-on', opts[i].getAttribute('data-layout') === layout);
    }
}

/** Troca de layout de verdade. */
function setVodLayout(layout) {
    if (layout === 'cats') {
        buildVodGroups(state.vodType);
        renderVodCategories();
    } else {
        openNetflixView(state.vodType);
    }
}

function openNetflixView(type) {
    state.vodType = type;
    markVodLayout('rails');
    var railsContainer = document.getElementById('netflix-rails');
    railsContainer.innerHTML = '';

    var filteredStreams = buildVodGroups(type);

    var heroEl = document.getElementById('netflix-hero');

    if (filteredStreams.length === 0) {
        if (heroEl) heroEl.style.display = 'none';
        railsContainer.innerHTML = listEmptyStateHtml();
        switchView('view-netflix');
        setTimeout(function() {
            var back = document.querySelector('#view-netflix .btn-back');
            if (back) setElementFocus(back);
        }, 50);
        return;
    }
    if (heroEl) heroEl.style.display = '';

    renderVodRails();

    if (filteredStreams.length > 0) {
        updateHeroSection(filteredStreams[0]);
    }

    switchView('view-netflix');

    setTimeout(function() {
        var firstCard = document.querySelector('.movie-poster-card');
        if (firstCard) setElementFocus(firstCard);
    }, 50);
}

/**
 * Desenha os trilhos a partir de state.vodCategories.
 * Não troca de tela nem mexe no foco — é isso que permite a busca
 * redesenhar os resultados sem fechar o teclado da TV.
 */
function renderVodRails() {
    var railsContainer = document.getElementById('netflix-rails');
    if (!railsContainer) return;
    railsContainer.innerHTML = '';
    state.renderedRails = 0;
    state.renderedCardsPerRow = [];

    var maxInitialCats = Math.min(state.vodCatNames.length, 5);
    for (var r = 0; r < maxInitialCats; r++) {
        appendVodRow();
    }

    state.netflixRailIndex = 0;
    state.netflixCardIndex = 0;
}

function appendVodRow() {
    var r = state.renderedRails;
    if (r >= state.vodCatNames.length) return; // No more rows

    var railsContainer = document.getElementById('netflix-rails');
    var catName = state.vodCatNames[r];
    
    var row = document.createElement('div');
    row.className = 'rail-row';
    row.dataset.row = r;
    row.innerHTML = '<h3 class="rail-title">' + catName + '</h3>';

    var list = document.createElement('div');
    list.className = 'rail-horizontal-list';
    row.appendChild(list);
    railsContainer.appendChild(row);

    state.renderedRails++;
    state.renderedCardsPerRow[r] = 0;

    // Append first 10 cards to this row
    appendVodCards(r, 10);
}

function appendVodCards(rowIndex, count) {
    var catName = state.vodCatNames[rowIndex];
    var items = state.vodCategories[catName];
    var currentCards = state.renderedCardsPerRow[rowIndex];
    
    var rowEl = document.querySelector('.rail-row[data-row="' + rowIndex + '"] .rail-horizontal-list');
    if (!rowEl) return;

    var maxItems = Math.min(currentCards + count, items.length);
    
    for (var c = currentCards; c < maxItems; c++) {
        var item = items[c];
        var card = document.createElement('div');
        card.className = 'movie-poster-card focusable';
        card.tabIndex = 0;
        card.dataset.row = rowIndex;
        card.dataset.col = c;
        card.dataset.item = JSON.stringify(item);
        if (item.tvgLogo) {
            card.style.backgroundImage = 'url(\'' + item.tvgLogo + '\')';
        }
        // O <span> é necessário: o clamp de 2 linhas só funciona num elemento
        // que não seja filho direto de flex nem posicionado em absoluto.
        card.innerHTML = '<div class="movie-poster-title"><span>' + item.name + '</span></div>';
        
        (function(vodItem) {
            card.addEventListener('click', function() {
                if (vodItem.streamType === 'series') {
                    openSeriesDetails(vodItem);
                } else {
                    playChannelFullscreen(vodItem);
                }
            });
        })(item);

        rowEl.appendChild(card);
    }
    
    state.renderedCardsPerRow[rowIndex] = maxItems;
}

var heroDebounceTimer = null;

function updateHeroSection(item) {
    if (!item) return;
    state.focusedVodItem = item;
    
    // Set immediate basic info
    document.getElementById('hero-title').innerText = item.name;
    document.getElementById('hero-plot').innerText = item.plot || t('vod.buscando_info');
    document.getElementById('hero-year').innerText = item.year || '';
    document.getElementById('hero-duration').innerText = item.duration || (item.streamType === 'series' ? t('serie.rotulo') : '');
    document.getElementById('hero-cast').innerText = t('vod.elenco', { v: item.cast || '...' });
    document.getElementById('hero-genre').innerText = t('vod.genero', { v: item.genre || item.groupTitle || t('live.geral') });
    
    var backdrop = document.getElementById('hero-backdrop');
    if (item.tvgLogo) {
        backdrop.style.backgroundImage = 'url(\'' + item.tvgLogo + '\')';
    }

    // Fetch full details from Xtream API after 500ms
    if (item.streamId && item.streamType === 'movie' && !item.plot) {
        clearTimeout(heroDebounceTimer);
        heroDebounceTimer = setTimeout(function() {
            fetchVodInfo(item);
        }, 500);
    }
}

function fetchVodInfo(item) {
    var creds = localStorage.getItem('flux_credentials');
    if (!creds) return;
    try {
        var parsed = JSON.parse(creds);
        var url = parsed.domain + '/player_api.php?username=' + parsed.user + '&password=' + parsed.pass + '&action=get_vod_info&vod_id=' + item.streamId;
        
        fetch(url)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data && data.info) {
                    item.plot = data.info.plot || t('vod.sem_descricao');
                    item.year = data.info.releasedate ? data.info.releasedate.split('-')[0] : (data.info.year || '');
                    item.durationSecs = data.info.duration_secs ? parseInt(data.info.duration_secs, 10) : 0;
                    item.duration = item.durationSecs ? Math.floor(item.durationSecs/60) + 'm' : (data.info.duration || '');
                    item.cast = data.info.cast || t('vod.desconhecido');
                    item.genre = data.info.genre || item.groupTitle;

                    // Update Hero UI if still focused
                    if (state.focusedVodItem && state.focusedVodItem.streamId === item.streamId) {
                        document.getElementById('hero-plot').innerText = item.plot;
                        document.getElementById('hero-year').innerText = item.year;
                        document.getElementById('hero-duration').innerText = item.duration;
                        document.getElementById('hero-cast').innerText = t('vod.elenco', { v: item.cast });
                        document.getElementById('hero-genre').innerText = t('vod.genero', { v: item.genre });
                    }
                    
                    // Update Player UI if this item is currently playing
                    if (state.currentView === 'player-view' && state.currentChannel && state.currentChannel.streamId === item.streamId) {
                        document.getElementById('vod-total-time').innerText = formatTime(item.durationSecs * 1000);
                    }
                }
            })
            .catch(function(e) { console.error('Erro ao buscar info', e); });
    } catch(e) {}
}

// --------------------------------------------------------------------------
// 4.5. VOD CATEGORIES & GRID VIEWS
// --------------------------------------------------------------------------

function renderVodCategories() {
    var container = document.getElementById('vod-categories-list');
    if (!container) return;
    markVodLayout('cats');
    container.innerHTML = '';
    
    var titleEl = document.querySelector('#view-vod-categories .sub-title');
    if (titleEl) {
        titleEl.innerText = state.vodType === 'series' ? t('vod.pastas_series') : t('vod.pastas_filmes');
    }

    for (var i = 0; i < state.vodCatNames.length; i++) {
        var catName = state.vodCatNames[i];
        var count = state.vodCategories[catName] ? state.vodCategories[catName].length : 0;
        
        var card = document.createElement('div');
        card.className = 'category-card focusable';
        card.tabIndex = 0;
        card.dataset.index = i;
        card.innerHTML = 
            '<span class="category-folder-icon">📁</span>' +
            '<div class="category-card-meta">' +
                '<div class="category-card-name">' + catName + '</div>' +
                '<div class="category-card-count">' + t('live.itens', { n: count }) + '</div>' +
            '</div>';
        
        (function(cName) {
            card.addEventListener('click', function() {
                openVodCategory(cName);
            });
        })(catName);

        container.appendChild(card);
    }
    
    switchView('view-vod-categories');
    setTimeout(function() {
        var first = document.querySelector('#view-vod-categories .focusable');
        if (first) setElementFocus(first);
    }, 50);
}

function openVodCategory(categoryName, searchQuery) {
    document.getElementById('selected-vod-category-title').innerText = categoryName;
    
    if (searchQuery) {
        var query = searchQuery.toLowerCase();
        state.gridItems = [];
        for (var i = 0; i < state.streams.length; i++) {
            var s = state.streams[i];
            if (s.streamType === state.vodType && s.name.toLowerCase().indexOf(query) !== -1) {
                state.gridItems.push(s);
            }
        }
    } else {
        state.gridItems = state.vodCategories[categoryName] || [];
    }
    
    state.gridRenderedCount = 0;
    document.getElementById('selected-vod-category-count').innerText = t('live.itens', { n: state.gridItems.length });

    var grid = document.getElementById('vod-items-grid');
    grid.innerHTML = '';

    appendVodGridCards(42); // 7 rows of 6

    switchView('view-vod-grid');
    setTimeout(function() {
        var first = document.querySelector('#view-vod-grid .focusable');
        if (first) setElementFocus(first);
    }, 50);
}

function appendVodGridCards(count) {
    var grid = document.getElementById('vod-items-grid');
    if (!grid) return;

    var maxItems = Math.min(state.gridRenderedCount + count, state.gridItems.length);

    for (var i = state.gridRenderedCount; i < maxItems; i++) {
        var item = state.gridItems[i];
        var card = document.createElement('div');
        card.className = 'vod-grid-card focusable';
        card.tabIndex = 0;
        card.dataset.index = i;
        if (item.tvgLogo) {
            card.style.backgroundImage = 'url(\'' + item.tvgLogo + '\')';
        }
        card.innerHTML = '<div class="vod-grid-title"><span>' + item.name + '</span></div>';

        (function(vodItem) {
            card.addEventListener('click', function() {
                if (vodItem.streamType === 'series') {
                    openSeriesDetails(vodItem);
                } else {
                    playChannelFullscreen(vodItem);
                }
            });
        })(item);

        grid.appendChild(card);
    }
    
    state.gridRenderedCount = maxItems;
}

function openSeriesDetails(seriesItem) {
    state.currentSeries = seriesItem;
    document.getElementById('series-details-title').innerText = seriesItem.name;
    document.getElementById('series-hero-name').innerText = seriesItem.name;
    document.getElementById('series-hero-plot').innerText = seriesItem.plot || t('serie.acompanhe');
    document.getElementById('series-hero-cast').innerText = t('vod.elenco', { v: seriesItem.cast || t('serie.elenco_principal') });
    document.getElementById('series-hero-genre').innerText = t('vod.genero', { v: seriesItem.genre || seriesItem.groupTitle || t('serie.rotulo') });
    
    var coverImg = document.getElementById('series-cover-img');
    if (seriesItem.tvgLogo) {
        coverImg.src = seriesItem.tvgLogo;
        coverImg.style.display = 'block';
    } else {
        coverImg.style.display = 'none';
    }

    var tabsRow = document.getElementById('season-tabs-row');
    var grid = document.getElementById('episodes-grid');
    tabsRow.innerHTML = '<span style="color:white; font-size:18px;">' + t('serie.carregando_temporadas') + '</span>';
    grid.innerHTML = '';
    
    switchView('view-series-details');
    
    if (seriesItem.streamId) {
        var creds = localStorage.getItem('flux_credentials');
        if (creds) {
            var parsed = JSON.parse(creds);
            var url = parsed.domain + '/player_api.php?username=' + parsed.user + '&password=' + parsed.pass + '&action=get_series_info&series_id=' + seriesItem.streamId;
            
            fetch(url)
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data && data.episodes) {
                        var epsData = {};
                        var seasonKeys = Object.keys(data.episodes);
                        for (var k = 0; k < seasonKeys.length; k++) {
                            var sNum = seasonKeys[k];
                            var sName = t('serie.temporada', { n: sNum });
                            epsData[sName] = [];
                            var epsArray = data.episodes[sNum];
                            if (Array.isArray(epsArray)) {
                                for (var e = 0; e < epsArray.length; e++) {
                                    var epObj = epsArray[e];
                                    epsData[sName].push({
                                        title: epObj.title || t('serie.episodio', { n: e + 1 }),
                                        url: parsed.domain + '/series/' + parsed.user + '/' + parsed.pass + '/' + epObj.id + '.' + epObj.container_extension
                                    });
                                }
                            }
                        }
                        
                        if (data.info) {
                            if (data.info.plot) document.getElementById('series-hero-plot').innerText = data.info.plot;
                            if (data.info.cast) document.getElementById('series-hero-cast').innerText = t('vod.elenco', { v: data.info.cast });
                        }
                        
                        state.seriesEpisodes = epsData;
                        buildSeasonTabs(epsData);
                    }
                })
                .catch(function(e) {
                    tabsRow.innerHTML = '<span style="color:red; font-size:18px;">' + t('serie.erro_episodios') + '</span>';
                });
            return;
        }
    }

    // Fallback for M3U series or missing Xtream API
    var episodesData = seriesItem.episodes || {
        [t('serie.temporada', { n: 1 })]: [
            { title: t('serie.piloto'), url: seriesItem.url || '' }
        ]
    };
    state.seriesEpisodes = episodesData;
    buildSeasonTabs(episodesData);
}

function buildSeasonTabs(episodesData) {
    var seasons = Object.keys(episodesData);
    var tabsRow = document.getElementById('season-tabs-row');
    tabsRow.innerHTML = '';

    for (var i = 0; i < seasons.length; i++) {
        var sName = seasons[i];
        var btn = document.createElement('button');
        btn.className = 'season-tab-btn focusable' + (i === 0 ? ' active' : '');
        btn.innerText = sName;
        btn.tabIndex = 0;
        
        (function(sn) {
            btn.addEventListener('click', function() {
                var allTabs = document.querySelectorAll('.season-tab-btn');
                for (var j = 0; j < allTabs.length; j++) allTabs[j].classList.remove('active');
                this.classList.add('active');
                renderSeasonEpisodes(sn);
            });
        })(sName);

        tabsRow.appendChild(btn);
    }

    if (seasons.length > 0) {
        renderSeasonEpisodes(seasons[0]);
    }

    setTimeout(function() {
        var firstTab = document.querySelector('.season-tab-btn');
        if (firstTab) setElementFocus(firstTab);
    }, 50);
}

function renderSeasonEpisodes(seasonName) {
    state.selectedSeason = seasonName;
    var eps = state.seriesEpisodes[seasonName] || [];
    var grid = document.getElementById('episodes-grid');
    grid.innerHTML = '';

    for (var i = 0; i < eps.length; i++) {
        var ep = eps[i];
        var card = document.createElement('div');
        card.className = 'episode-card focusable';
        card.tabIndex = 0;
        card.innerHTML = 
            '<span class="episode-num">E' + (i + 1) + '</span>' +
            '<span class="episode-name">' + (ep.title || t('serie.episodio', { n: i + 1 })) + '</span>';
        
        (function(epItem) {
            card.addEventListener('click', function() {
                playChannelFullscreen({
                    name: state.currentSeries.name + ' - ' + epItem.title,
                    url: epItem.url || state.currentSeries.url,
                    plot: state.currentSeries.plot,
                    streamType: 'movie'
                });
            });
        })(ep);

        grid.appendChild(card);
    }
}

// ==========================================================================
// PLAYER CONTROLLER
// ==========================================================================

function playChannelFullscreen(channel) {
    state.currentChannel = channel;
    document.getElementById('player-channel-name').innerText = channel.name;
    document.getElementById('player-epg-now').innerText = channel.epgNow || channel.plot || t('player.transmissao');
    
    var isVod = channel.streamType === 'movie' || channel.streamType === 'series';
    
    // Toggle OSD Layout
    if (isVod) {
        document.getElementById('osd-live-info').classList.add('hidden');
        document.getElementById('player-hints-live').classList.add('hidden');
        document.getElementById('osd-vod-info').classList.remove('hidden');
        document.getElementById('player-hints-vod').classList.remove('hidden');
        document.getElementById('player-progress-fill').style.width = '0%';
        document.getElementById('vod-play-icon').innerText = '⏸'; // Force pause icon on start since it auto-plays
        document.getElementById('vod-current-time').innerText = '00:00:00';
        document.getElementById('vod-total-time').innerText = channel.durationSecs ? formatTime(channel.durationSecs * 1000) : '00:00:00';
        document.getElementById('player-live-badge').classList.add('hidden');
        
        // Failsafe: if duration isn't loaded yet, fetch it immediately!
        if (!channel.durationSecs) {
            fetchVodInfo(channel);
        }
    } else {
        document.getElementById('osd-live-info').classList.remove('hidden');
        document.getElementById('player-hints-live').classList.remove('hidden');
        document.getElementById('osd-vod-info').classList.add('hidden');
        document.getElementById('player-hints-vod').classList.add('hidden');
        document.getElementById('player-progress-fill').style.width = '50%';
        document.getElementById('player-live-badge').classList.remove('hidden');
    }

    switchView('player-view');
    // O terceiro parâmetro liga o vigia de travamento, só para canais ao vivo.
    // O nome do canal diz se vale pedir modo 4K ao motor (marcadores UHD/4K).
    player.play(channel.url, true, !isVod, false, channel.name);
    showPlayerOSD();
}

function formatTime(ms) {
    if (!ms || isNaN(ms)) return '00:00:00';
    var totalSecs = Math.floor(ms / 1000);
    var h = Math.floor(totalSecs / 3600);
    var m = Math.floor((totalSecs % 3600) / 60);
    var s = totalSecs % 60;
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

function onPlayerTimeUpdate(currentTimeMs) {
    if (state.currentView !== 'player-view') return;
    if (state.currentChannel && (state.currentChannel.streamType === 'movie' || state.currentChannel.streamType === 'series')) {
        var durationMs = player.getDuration();
        if ((isNaN(durationMs) || durationMs <= 0) && state.currentChannel.durationSecs) {
            durationMs = state.currentChannel.durationSecs * 1000;
        }

        document.getElementById('vod-current-time').innerText = formatTime(currentTimeMs);
        document.getElementById('vod-total-time').innerText = formatTime(durationMs);
        
        if (durationMs > 0) {
            var pct = (currentTimeMs / durationMs) * 100;
            if (pct > 100) pct = 100;
            document.getElementById('player-progress-fill').style.width = pct + '%';
        }
    }
};

function closePlayer() {
    player.stop();
    if (state.currentView === 'player-view' && state.currentChannel) {
        if (state.currentChannel.streamType === 'movie') {
            switchView('view-netflix');
            var card = document.querySelector('.movie-poster-card');
            if (card) setElementFocus(card);
        } else if (state.currentChannel.streamType === 'series') {
            switchView('view-series-details');
            var epCards = document.querySelectorAll('.episode-card');
            if (epCards.length > 0) setElementFocus(epCards[0]);
        } else {
            switchView('view-category-channels');
            focusChannelItem(state.channelIndex);
        }
    } else {
        switchView('view-dashboard');
        focusDashboardItem(state.dashIndex);
    }
}

function showPlayerOSD() {
    var topBar = document.getElementById('player-top-bar');
    var bottomBar = document.getElementById('player-bottom-bar');
    if (topBar) topBar.style.opacity = '1';
    if (bottomBar) bottomBar.style.opacity = '1';
    
    clearTimeout(state.osdTimer);
    state.osdTimer = setTimeout(function() {
        if (topBar) topBar.style.opacity = '0';
        if (bottomBar) bottomBar.style.opacity = '0';
    }, 5000);
}

// ==========================================================================
// REMOTE CONTROL ENGINE (D-PAD ARROWS, ENTER, BACK, COLORS)
// ==========================================================================

var lastKeyTimestamp = 0;

// MAC Authentication State
var macAddress = 'CARREGANDO...';
var deviceKey = '';
var macAuthTimer = null;
var firebaseDbUrl = 'https://fluxiptv-5c6b5-default-rtdb.firebaseio.com';

function showKeyFeedback(name) {
    var badge = document.getElementById('key-feedback');
    var label = document.getElementById('key-name');
    if (badge && label) {
        label.innerText = name;
        badge.classList.remove('hidden');
        clearTimeout(window.keyFeedbackTimer);
        window.keyFeedbackTimer = setTimeout(function() {
            badge.classList.add('hidden');
        }, 1000);
    }
}

/* ---------------------------------------------------------------------------
   CICLO DE VIDA

   A TV pode esconder o aplicativo a qualquer momento: entrar em espera, trocar
   de entrada, abrir outro app. Continuar segurando o decodificador por hardware
   nessa hora prende um recurso que a TV inteira disputa, e é causa conhecida de
   reprovação na certificação da Samsung.

   Filme e série apenas pausam, para o usuário voltar de onde parou. Canal ao
   vivo é encerrado de fato: não existe "de onde parou", e manter o stream aberto
   em segundo plano só gasta banda do cliente.
   ------------------------------------------------------------------------- */
var retomadaPendente = null;

function aoEsconderApp() {
    if (!player || state.currentView !== 'player-view' || !state.currentChannel) return;

    var canal = state.currentChannel;
    var ehVod = (canal.streamType === 'movie' || canal.streamType === 'series');

    if (ehVod) {
        retomadaPendente = { tipo: 'vod' };
        try { player.pause(); } catch (e) {}
    } else {
        retomadaPendente = { tipo: 'live', canal: canal };
        try { player.stop(); } catch (e) {}
    }
}

function aoVoltarParaOApp() {
    var r = retomadaPendente;
    retomadaPendente = null;
    if (!r || !player) return;
    // O usuário pode ter saído do player enquanto o app estava escondido.
    if (state.currentView !== 'player-view') return;

    if (r.tipo === 'vod') {
        try { player.resume(); } catch (e) {}
        return;
    }
    if (r.canal) player.play(r.canal.url, true, true, false, r.canal.name);
}

function aoMudarVisibilidade() {
    if (document.hidden) aoEsconderApp();
    else aoVoltarParaOApp();
}

function handleRemoteKey(e) {
    var code = e.keyCode || e.which;
    var key = e.key || '';

    // Debounce to prevent rapid double-clicks from remote bounce
    var now = Date.now();
    if (now - lastKeyTimestamp < 110) {
        e.preventDefault();
        e.stopPropagation();
        return;
    }
    lastKeyTimestamp = now;

    console.log('[Remote Key]: code=' + code + ', key=' + key + ', view=' + state.currentView);

    // Return / Back Keys (Samsung: 10009, Escape: 27)
    if (code === 10009 || code === 27 || key === 'Escape' || key === 'XF86Back') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.voltar'));
        handleBackKey();
        return;
    }

    // Enter / OK Keys (13)
    if (code === 13 || key === 'Enter' || key === 'Select') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.ok'));
        if (state.currentView === 'player-view') {
            if (state.currentChannel && (state.currentChannel.streamType === 'movie' || state.currentChannel.streamType === 'series')) {
                toggleVodPlayPause();
            }
            showPlayerOSD();
        } else if (state.focusedElement) {
            // Num campo de texto, OK é o que abre o teclado da TV.
            if (state.focusedElement.tagName === 'INPUT') {
                try { state.focusedElement.focus(); } catch (e) {}
            } else {
                state.focusedElement.click();
            }
        }
        return;
    }

    // Media Control Keys (Samsung AVPlay)
    if (code === 415 || code === 10252) { // MediaPlay / MediaPlayPause
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.play'));
        if (state.currentView === 'player-view') {
            player.resume();
            document.getElementById('vod-play-icon').innerText = '▶';
            showPlayerOSD();
        }
        return;
    } else if (code === 19) { // MediaPause
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.pause'));
        if (state.currentView === 'player-view') {
            player.pause();
            document.getElementById('vod-play-icon').innerText = '⏸';
            showPlayerOSD();
        }
        return;
    } else if (code === 417 || code === 10233) { // MediaFastForward
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.avancar'));
        if (state.currentView === 'player-view' && state.currentChannel && (state.currentChannel.streamType === 'movie' || state.currentChannel.streamType === 'series')) {
            handleNavigate('right');
        }
        return;
    } else if (code === 412 || code === 10232) { // MediaRewind
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.voltar'));
        if (state.currentView === 'player-view' && state.currentChannel && (state.currentChannel.streamType === 'movie' || state.currentChannel.streamType === 'series')) {
            handleNavigate('left');
        }
        return;
    }

    // Directional Arrows (37: Left, 38: Up, 39: Right, 40: Down)
    if (code === 37 || key === 'ArrowLeft' || key === 'Left') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.esquerda'));
        handleNavigate('left');
    } else if (code === 38 || key === 'ArrowUp' || key === 'Up') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.cima'));
        handleNavigate('up');
    } else if (code === 39 || key === 'ArrowRight' || key === 'Right') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.direita'));
        handleNavigate('right');
    } else if (code === 40 || key === 'ArrowDown' || key === 'Down') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.baixo'));
        handleNavigate('down');
    } else if (code === 403) { // Red Color Key
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback(t('tecla.favorito'));
        if (state.currentView === 'player-view') {
            toggleFavorite(state.currentChannel);
        } else if (state.currentView === 'view-category-channels') {
            if (state.categoryChannels[state.channelIndex]) {
                toggleFavorite(state.categoryChannels[state.channelIndex]);
            }
        }
    }
}

function toggleVodPlayPause() {
    if (player.isPlaying) {
        player.pause();
        document.getElementById('vod-play-icon').innerText = '⏸';
    } else {
        player.resume();
        document.getElementById('vod-play-icon').innerText = '▶';
    }
}

function showSeekOverlay(text, icon) {
    var overlay = document.getElementById('vod-seek-overlay');
    var txtEl = document.getElementById('vod-seek-time');
    var iconEl = document.getElementById('vod-seek-icon');
    if (!overlay) return;
    
    txtEl.innerText = text;
    iconEl.innerText = icon;
    
    // Re-trigger animation
    overlay.classList.remove('hidden');
    overlay.style.animation = 'none';
    overlay.offsetHeight; /* trigger reflow */
    overlay.style.animation = null;
    
    clearTimeout(state.seekOverlayTimer);
    state.seekOverlayTimer = setTimeout(function() {
        overlay.classList.add('hidden');
    }, 1000);
}

var fastSeekAccumulator = 0;
var fastSeekCombo = 0;
var fastSeekExecuteTimer = null;

function handleNavigate(direction) {
    if (state.currentView === 'player-view') {
        var isVod = state.currentChannel && (state.currentChannel.streamType === 'movie' || state.currentChannel.streamType === 'series');
        
        if (direction === 'up' || direction === 'down') {
            if (!isVod) { // Only allow changing channels on Live TV
                var diff = direction === 'up' ? 1 : -1;
                if (state.categoryChannels.length > 0) {
                    var curName = state.currentChannel ? state.currentChannel.name : '';
                    var curIdx = 0;
                    for (var i = 0; i < state.categoryChannels.length; i++) {
                        if (state.categoryChannels[i].name === curName) {
                            curIdx = i;
                            break;
                        }
                    }
                    var nextIdx = (curIdx + diff + state.categoryChannels.length) % state.categoryChannels.length;
                    playChannelFullscreen(state.categoryChannels[nextIdx]);
                }
            }
        } else if (direction === 'left' || direction === 'right') {
            if (isVod) { // Allow seeking with D-PAD Left/Right on VOD
                var baseSkip = direction === 'right' ? 15000 : -15000;
                
                // Fast Seek Combo Logic
                fastSeekCombo++;
                var multiplier = 1;
                if (fastSeekCombo > 15) multiplier = 12;      // ~3 mins per tick
                else if (fastSeekCombo > 10) multiplier = 8;  // ~2 mins per tick
                else if (fastSeekCombo > 5) multiplier = 4;   // ~1 min per tick
                else if (fastSeekCombo > 2) multiplier = 2;   // 30s per tick
                
                fastSeekAccumulator += (baseSkip * multiplier);
                
                // Format UI Text
                var totalSeconds = Math.abs(fastSeekAccumulator / 1000);
                var skipIcon = fastSeekAccumulator > 0 ? '⏩' : '⏪';
                var skipText = (fastSeekAccumulator > 0 ? '+' : '-') + totalSeconds + 's';
                if (totalSeconds >= 60) {
                    var m = Math.floor(totalSeconds / 60);
                    var s = totalSeconds % 60;
                    skipText = (fastSeekAccumulator > 0 ? '+' : '-') + m + 'm' + (s > 0 ? s + 's' : '');
                }
                
                showSeekOverlay(skipText, skipIcon);
                
                // Instantly update timeline DOM without calling the TV Engine yet
                if (player && player.onTimeUpdate) {
                    var tempTime = player.virtualTime + fastSeekAccumulator;
                    if (tempTime < 0) tempTime = 0;
                    
                    var dur = player.getDuration();
                    if ((isNaN(dur) || dur <= 0) && state.currentChannel && state.currentChannel.durationSecs) {
                        dur = state.currentChannel.durationSecs * 1000;
                    }
                    if (dur > 0 && tempTime > dur) tempTime = dur;
                    
                    player.onTimeUpdate(tempTime);
                }
                
                // Debounce the actual hardware seek command
                clearTimeout(fastSeekExecuteTimer);
                fastSeekExecuteTimer = setTimeout(function() {
                    player.seek(fastSeekAccumulator);
                    fastSeekAccumulator = 0;
                    fastSeekCombo = 0;
                }, 600);
            }
        }
        showPlayerOSD();
        return;
    }

    if (state.currentView === 'view-dashboard') {
        navigateDashboard(direction);
    } else if (state.currentView === 'view-live-categories') {
        navigateCategories(direction);
    } else if (state.currentView === 'view-category-channels') {
        navigateChannels(direction);
    } else if (state.currentView === 'view-netflix') {
        navigateNetflix(direction);
    } else if (state.currentView === 'view-series-details') {
        navigateSeriesDetails(direction);
    } else if (state.currentView === 'view-playlists') {
        navigatePlaylists(direction);
    } else if (state.currentView === 'view-vod-categories') {
        navigateVodCategories(direction);
    } else if (state.currentView === 'view-vod-grid') {
        navigateVodGrid(direction);
    } else if (state.currentView === 'view-settings') {
        navigateSettings(direction);
    }
}

// --------------------------------------------------------------------------
// 1. DASHBOARD NAVIGATION
// --------------------------------------------------------------------------
function navigateDashboard(dir) {
    // 0: TV AO VIVO | 1: FILMES | 2: SÉRIES
    // 3: CONFIGURAÇÕES
    var cur = state.dashIndex;

    if (dir === 'right') {
        if (cur === 0) focusDashboardItem(1);
        else if (cur === 1) focusDashboardItem(2);
    } else if (dir === 'left') {
        if (cur === 2) focusDashboardItem(1);
        else if (cur === 1) focusDashboardItem(0);
    } else if (dir === 'down') {
        if (cur === 0 || cur === 1 || cur === 2) focusDashboardItem(3);
    } else if (dir === 'up') {
        if (cur === 3) focusDashboardItem(1);
    }
}

// --------------------------------------------------------------------------
// 2. LIVE CATEGORIES NAVIGATION (Vertical 1-Column List)
// --------------------------------------------------------------------------
function navigateCategories(dir) {
    var backBtn = document.querySelector('#view-live-categories .btn-back');
    var searchInput = document.getElementById('live-search-input');
    var cards = document.querySelectorAll('#live-categories-grid .category-card');
    var total = cards.length;

    if (state.focusedElement === backBtn) {
        if (dir === 'right') {
            setElementFocus(searchInput);
        } else if (dir === 'down' && total > 0) {
            focusCategoryItem(0);
        }
        return;
    }

    if (state.focusedElement === searchInput) {
        if (dir === 'left') {
            setElementFocus(backBtn);
        } else if (dir === 'down' && total > 0) {
            if (total > 1) focusCategoryItem(1);
            else focusCategoryItem(0);
        }
        return;
    }

    var cur = state.catIndex;
    var isLeft = (cur % 2 === 0);

    if (dir === 'down') {
        if (cur + 2 < total) {
            focusCategoryItem(cur + 2);
        } else if (isLeft && cur + 1 === total - 1) {
            focusCategoryItem(cur + 1);
        }
    } else if (dir === 'up') {
        if (cur - 2 >= 0) {
            focusCategoryItem(cur - 2);
        } else {
            setElementFocus(isLeft ? backBtn : searchInput);
        }
    } else if (dir === 'right') {
        if (isLeft && cur + 1 < total) {
            focusCategoryItem(cur + 1);
        } else if (!isLeft && cards[cur]) {
            cards[cur].click();
        }
    } else if (dir === 'left') {
        if (!isLeft) {
            focusCategoryItem(cur - 1);
        } else {
            setElementFocus(backBtn);
        }
    }
}

// --------------------------------------------------------------------------
// 3. LIVE CHANNELS NAVIGATION (Vertical 1-Column List)
// --------------------------------------------------------------------------
function navigateChannels(dir) {
    var backBtn = document.querySelector('#view-category-channels .btn-back');
    var cards = document.querySelectorAll('#category-channels-grid .channel-list-card');
    var total = cards.length;

    if (state.focusedElement === backBtn) {
        if (dir === 'down' && total > 0) {
            focusChannelItem(0);
        }
        return;
    }

    var cur = state.channelIndex;
    var isLeft = (cur % 2 === 0);

    if (dir === 'down') {
        if (cur + 2 < total) {
            focusChannelItem(cur + 2);
        } else if (isLeft && cur + 1 === total - 1) {
            focusChannelItem(cur + 1);
        }
    } else if (dir === 'up') {
        if (cur - 2 >= 0) {
            focusChannelItem(cur - 2);
        } else {
            setElementFocus(backBtn);
        }
    } else if (dir === 'right') {
        if (isLeft && cur + 1 < total) {
            focusChannelItem(cur + 1);
        } else if (!isLeft && cards[cur]) {
            cards[cur].click();
        }
    } else if (dir === 'left') {
        if (!isLeft) {
            focusChannelItem(cur - 1);
        } else {
            setElementFocus(backBtn);
        }
    }
}

// --------------------------------------------------------------------------
// 4. NETFLIX RAILS & HERO NAVIGATION
// --------------------------------------------------------------------------
function navigateNetflix(dir) {
    var backBtn = document.querySelector('#view-netflix .btn-back');
    var searchInput = document.getElementById('vod-search-input');
    var railsOpt = document.querySelector('#view-netflix .layout-opt[data-layout="rails"]');
    var catsOpt = document.querySelector('#view-netflix .layout-opt[data-layout="cats"]');
    var heroBtn = document.getElementById('btn-hero-play');
    var rows = document.querySelectorAll('.rail-row');

    // Barra de cima, da esquerda para a direita:
    // voltar -> Destaques -> Por Categoria -> busca. De qualquer uma, baixo vai ao hero.
    if (state.focusedElement === backBtn) {
        if (dir === 'right') setElementFocus(railsOpt);
        else if (dir === 'down') setElementFocus(heroBtn);
        return;
    }

    if (state.focusedElement === railsOpt) {
        if (dir === 'left') setElementFocus(backBtn);
        else if (dir === 'right') setElementFocus(catsOpt);
        else if (dir === 'down') setElementFocus(heroBtn);
        return;
    }

    if (state.focusedElement === catsOpt) {
        if (dir === 'left') setElementFocus(railsOpt);
        else if (dir === 'right') setElementFocus(searchInput);
        else if (dir === 'down') setElementFocus(heroBtn);
        return;
    }

    if (state.focusedElement === searchInput) {
        if (dir === 'left') setElementFocus(catsOpt);
        else if (dir === 'down') setElementFocus(heroBtn);
        return;
    }

    if (state.focusedElement === heroBtn) {
        if (dir === 'up') {
            setElementFocus(backBtn);
        } else if (dir === 'down' && rows.length > 0) {
            var firstCard = rows[0].querySelector('.movie-poster-card');
            if (firstCard) {
                state.netflixRailIndex = 0;
                state.netflixCardIndex = 0;
                setElementFocus(firstCard);
            }
        }
        return;
    }

    if (rows.length === 0) return;

    if (dir === 'right') {
        var currentRowCards = rows[state.netflixRailIndex] ? rows[state.netflixRailIndex].querySelectorAll('.movie-poster-card') : null;
        
        if (currentRowCards && state.netflixCardIndex + 2 >= currentRowCards.length) {
            appendVodCards(state.netflixRailIndex, 10);
            currentRowCards = rows[state.netflixRailIndex].querySelectorAll('.movie-poster-card');
        }

        if (currentRowCards && state.netflixCardIndex + 1 < currentRowCards.length) {
            state.netflixCardIndex++;
            setElementFocus(currentRowCards[state.netflixCardIndex]);
        }
    } else if (dir === 'left') {
        var currentRowCards = rows[state.netflixRailIndex] ? rows[state.netflixRailIndex].querySelectorAll('.movie-poster-card') : null;
        if (currentRowCards && state.netflixCardIndex - 1 >= 0) {
            state.netflixCardIndex--;
            setElementFocus(currentRowCards[state.netflixCardIndex]);
        }
    } else if (dir === 'down') {
        if (state.netflixRailIndex + 2 >= rows.length) {
            appendVodRow();
            rows = document.querySelectorAll('.rail-row');
        }

        if (state.netflixRailIndex + 1 < rows.length) {
            state.netflixRailIndex++;
            var nextRowCards = rows[state.netflixRailIndex].querySelectorAll('.movie-poster-card');
            state.netflixCardIndex = Math.min(state.netflixCardIndex, nextRowCards.length - 1);
            setElementFocus(nextRowCards[state.netflixCardIndex]);
        }
    } else if (dir === 'up') {
        if (state.netflixRailIndex === 0) {
            setElementFocus(heroBtn);
        } else {
            state.netflixRailIndex--;
            var prevRowCards = rows[state.netflixRailIndex].querySelectorAll('.movie-poster-card');
            state.netflixCardIndex = Math.min(state.netflixCardIndex, prevRowCards.length - 1);
            setElementFocus(prevRowCards[state.netflixCardIndex]);
        }
    }
}

// --------------------------------------------------------------------------
// 4.5. VOD GRID NAVIGATION
// --------------------------------------------------------------------------
function navigateVodCategories(dir) {
    var backBtn = document.querySelector('#view-vod-categories .btn-back');
    var railsOpt = document.querySelector('#view-vod-categories .layout-opt[data-layout="rails"]');
    var catsOpt = document.querySelector('#view-vod-categories .layout-opt[data-layout="cats"]');
    var cards = document.querySelectorAll('#view-vod-categories .category-card');

    // O cabeçalho é tratado antes da guarda de lista vazia: mesmo sem pastas,
    // o usuário precisa conseguir voltar para os Destaques.
    if (state.focusedElement === backBtn) {
        if (dir === 'right') setElementFocus(railsOpt);
        else if (dir === 'down' && cards.length) setElementFocus(cards[0]);
        return;
    }

    if (state.focusedElement === railsOpt) {
        if (dir === 'left') setElementFocus(backBtn);
        else if (dir === 'right') setElementFocus(catsOpt);
        else if (dir === 'down' && cards.length) setElementFocus(cards[0]);
        return;
    }

    if (state.focusedElement === catsOpt) {
        if (dir === 'left') setElementFocus(railsOpt);
        else if (dir === 'down' && cards.length) setElementFocus(cards[0]);
        return;
    }

    if (cards.length === 0) return;

    var cur = -1;
    for (var i = 0; i < cards.length; i++) {
        if (cards[i] === state.focusedElement) { cur = i; break; }
    }
    if (cur === -1) return;

    // Categories are rendered in 2 columns via flexbox
    var isLeft = cur % 2 === 0;
    var total = cards.length;

    if (dir === 'down') {
        if (cur + 2 < total) setElementFocus(cards[cur + 2]);
        else if (isLeft && cur + 1 === total - 1) setElementFocus(cards[cur + 1]);
    } else if (dir === 'up') {
        if (cur - 2 >= 0) setElementFocus(cards[cur - 2]);
        else setElementFocus(backBtn);
    } else if (dir === 'right') {
        if (isLeft && cur + 1 < total) setElementFocus(cards[cur + 1]);
    } else if (dir === 'left') {
        if (!isLeft) setElementFocus(cards[cur - 1]);
        else setElementFocus(backBtn);
    }
}

function navigateVodGrid(dir) {
    var backBtn = document.querySelector('#view-vod-grid .btn-back');
    var cards = document.querySelectorAll('#view-vod-grid .vod-grid-card');
    if (cards.length === 0) return;

    if (state.focusedElement === backBtn) {
        if (dir === 'down') setElementFocus(cards[0]);
        return;
    }

    var cur = -1;
    for (var i = 0; i < cards.length; i++) {
        if (cards[i] === state.focusedElement) { cur = i; break; }
    }
    if (cur === -1) return;

    // VOD Grid has 6 columns
    var cols = 6;
    var total = cards.length;

    if (dir === 'down') {
        if (cur + cols >= total) {
            appendVodGridCards(30); // 5 rows of 6
            cards = document.querySelectorAll('#view-vod-grid .vod-grid-card');
            total = cards.length;
        }

        if (cur + cols < total) setElementFocus(cards[cur + cols]);
        else if (total > cols) setElementFocus(cards[total - 1]); // jump to last item if no bottom match
    } else if (dir === 'up') {
        if (cur - cols >= 0) setElementFocus(cards[cur - cols]);
        else setElementFocus(backBtn);
    } else if (dir === 'right') {
        if ((cur + 1) % cols !== 0 && cur + 1 < total) {
            setElementFocus(cards[cur + 1]);
        } else if ((cur + 1) % cols !== 0 && cur + 1 >= total && total < state.gridItems.length) {
            // Trigger load if they press right on the last item of an incomplete row
            appendVodGridCards(30);
            cards = document.querySelectorAll('#view-vod-grid .vod-grid-card');
            total = cards.length;
            if (cur + 1 < total) setElementFocus(cards[cur + 1]);
        }
    } else if (dir === 'left') {
        if (cur % cols !== 0 && cur - 1 >= 0) setElementFocus(cards[cur - 1]);
        else if (cur % cols === 0) setElementFocus(backBtn);
    }
}

// --------------------------------------------------------------------------
// 5. SERIES DETAILS NAVIGATION
// --------------------------------------------------------------------------
function navigateSeriesDetails(dir) {
    var backBtn = document.querySelector('#view-series-details .btn-back');
    var tabBtns = Array.from(document.querySelectorAll('.season-tab-btn'));
    var epCards = Array.from(document.querySelectorAll('.episode-card'));

    if (state.focusedElement === backBtn) {
        if (dir === 'down' && tabBtns.length > 0) setElementFocus(tabBtns[0]);
        return;
    }

    var tabIdx = tabBtns.indexOf(state.focusedElement);
    if (tabIdx !== -1) {
        if (dir === 'right' && tabIdx + 1 < tabBtns.length) {
            setElementFocus(tabBtns[tabIdx + 1]);
        } else if (dir === 'left' && tabIdx - 1 >= 0) {
            setElementFocus(tabBtns[tabIdx - 1]);
        } else if (dir === 'up') {
            setElementFocus(backBtn);
        } else if (dir === 'down' && epCards.length > 0) {
            setElementFocus(epCards[0]);
        }
        return;
    }

    var epIdx = epCards.indexOf(state.focusedElement);
    if (epIdx !== -1) {
        var cols = 3;
        if (dir === 'right') {
            if ((epIdx + 1) % cols !== 0 && epIdx + 1 < epCards.length) setElementFocus(epCards[epIdx + 1]);
        } else if (dir === 'left') {
            if (epIdx % cols !== 0 && epIdx - 1 >= 0) setElementFocus(epCards[epIdx - 1]);
        } else if (dir === 'down') {
            if (epIdx + cols < epCards.length) setElementFocus(epCards[epIdx + cols]);
        } else if (dir === 'up') {
            if (epIdx - cols >= 0) setElementFocus(epCards[epIdx - cols]);
            else if (tabBtns.length > 0) setElementFocus(tabBtns[0]);
        }
    }
}

// --------------------------------------------------------------------------
// 6. PLAYLISTS SCREEN NAVIGATION (Exact 3-Card Spatial Matrix)
// --------------------------------------------------------------------------
function navigatePlaylists(dir) {
    var backBtn = document.querySelector('#view-playlists .btn-back');
    var discBtn = document.getElementById('btn-disconnect-playlist');
    var m3uName = document.getElementById('m3u-name-input');
    var m3uUrl = document.getElementById('m3u-url-input');
    var m3uSubmit = document.getElementById('btn-submit-m3u');
    var demoBtn = document.getElementById('btn-load-demo-playlist');
    var xcDomain = document.getElementById('xc-domain-input');
    var xcUser = document.getElementById('xc-user-input');
    var xcPass = document.getElementById('xc-pass-input');
    var xcSubmit = document.getElementById('btn-submit-xc');

    var cur = state.focusedElement;

    if (cur === backBtn) {
        if (dir === 'down') setElementFocus(discBtn || m3uName);
        return;
    }

    // Card 1: Status / Disconnect
    if (cur === discBtn) {
        if (dir === 'up') setElementFocus(backBtn);
        else if (dir === 'right') setElementFocus(m3uName);
        return;
    }

    // Card 2: M3U Form
    if (cur === m3uName) {
        if (dir === 'up') setElementFocus(backBtn);
        else if (dir === 'down') setElementFocus(m3uUrl);
        else if (dir === 'left') setElementFocus(discBtn);
        else if (dir === 'right') setElementFocus(xcDomain);
    } else if (cur === m3uUrl) {
        if (dir === 'up') setElementFocus(m3uName);
        else if (dir === 'down') setElementFocus(m3uSubmit);
        else if (dir === 'left') setElementFocus(discBtn);
        else if (dir === 'right') setElementFocus(xcDomain);
    } else if (cur === m3uSubmit) {
        if (dir === 'up') setElementFocus(m3uUrl);
        else if (dir === 'down') setElementFocus(demoBtn);
        else if (dir === 'left') setElementFocus(discBtn);
        else if (dir === 'right') setElementFocus(xcSubmit);
    } else if (cur === demoBtn) {
        if (dir === 'up') setElementFocus(m3uSubmit);
        else if (dir === 'left') setElementFocus(discBtn);
        else if (dir === 'right') setElementFocus(xcSubmit);
    }

    // Card 3: Xtream Codes Form
    else if (cur === xcDomain) {
        if (dir === 'up') setElementFocus(backBtn);
        else if (dir === 'down') setElementFocus(xcUser);
        else if (dir === 'left') setElementFocus(m3uName);
    } else if (cur === xcUser) {
        if (dir === 'up') setElementFocus(xcDomain);
        else if (dir === 'down') setElementFocus(xcSubmit);
        else if (dir === 'right') setElementFocus(xcPass);
        else if (dir === 'left') setElementFocus(m3uUrl);
    } else if (cur === xcPass) {
        if (dir === 'up') setElementFocus(xcDomain);
        else if (dir === 'down') setElementFocus(xcSubmit);
        else if (dir === 'left') setElementFocus(xcUser);
    } else if (cur === xcSubmit) {
        if (dir === 'up') setElementFocus(xcUser);
        else if (dir === 'left') setElementFocus(m3uSubmit);
    }
}

// --------------------------------------------------------------------------
// 7. SETTINGS SCREEN NAVIGATION
// --------------------------------------------------------------------------
function navigateSettings(dir) {
    var backBtn = document.querySelector('#view-settings .btn-back');
    var discBtn = document.getElementById('btn-settings-disconnect');
    var langs = document.querySelectorAll('#view-settings .lang-opt');

    // voltar -> idiomas (troca com esquerda/direita) -> botão de desconectar
    if (state.focusedElement === backBtn) {
        if (dir === 'down' && langs.length) setElementFocus(langs[0]);
        else if (dir === 'down' && discBtn) setElementFocus(discBtn);
        return;
    }

    for (var i = 0; i < langs.length; i++) {
        if (state.focusedElement !== langs[i]) continue;
        if (dir === 'right' && i + 1 < langs.length) setElementFocus(langs[i + 1]);
        else if (dir === 'left' && i > 0) setElementFocus(langs[i - 1]);
        else if (dir === 'left') setElementFocus(backBtn);
        else if (dir === 'up') setElementFocus(backBtn);
        else if (dir === 'down' && discBtn) setElementFocus(discBtn);
        return;
    }

    if (state.focusedElement === discBtn) {
        if (dir === 'up') {
            if (langs.length) setElementFocus(langs[0]);
            else setElementFocus(backBtn);
        }
        return;
    }
}

function handleBackKey() {
    if (state.currentView === 'player-view') {
        closePlayer();
    } else if (state.currentView === 'view-series-details') {
        switchView('view-netflix');
        var card = document.querySelector('.movie-poster-card');
        if (card) setElementFocus(card);
    } else if (state.currentView === 'view-category-channels') {
        switchView('view-live-categories');
        focusCategoryItem(state.catIndex);
    } else if (state.currentView === 'view-vod-categories') {
        switchView('view-netflix');
        markVodLayout('rails');
        var first = document.querySelector('#view-netflix .layout-opt[data-layout="cats"]');
        if (first) setElementFocus(first);
    } else if (state.currentView === 'view-vod-grid') {
        switchView('view-vod-categories');
        var cats = document.querySelectorAll('#view-vod-categories .category-card');
        if (cats.length > 0) setElementFocus(cats[0]);
    } else if (state.currentView !== 'view-dashboard') {
        switchView('view-dashboard');
        focusDashboardItem(state.dashIndex);
    } else {
        if (window.tizen && window.tizen.application) {
            window.tizen.application.getCurrentApplication().exit();
        }
    }
}

// ==========================================================================
// UTILITY & ATTACH HANDLERS
// ==========================================================================

function attachHandlers() {
    // Dashboard Cards Click
    var tiles = document.querySelectorAll('.dash-tile');
    for (var i = 0; i < tiles.length; i++) {
        (function(tile, idx) {
            tile.addEventListener('click', function() {
                state.dashIndex = idx;
                var route = tile.dataset.route;
                if (route === 'content-live') {
                    switchView('view-live-categories');
                    focusCategoryItem(0);
                } else if (route === 'content-movies') {
                    openNetflixView('movie');
                } else if (route === 'content-series') {
                    openNetflixView('series');
                } else if (route === 'playlists') {
                    switchView('view-playlists');
                    setTimeout(function() {
                        var first = document.querySelector('#view-playlists .focusable');
                        if (first) setElementFocus(first);
                    }, 50);
                } else if (route === 'settings') {
                    switchView('view-settings');
                    setTimeout(function() {
                        var first = document.querySelector('#view-settings .focusable');
                        if (first) setElementFocus(first);
                    }, 50);
                }
            });
        })(tiles[i], i);
    }

    // Back Buttons
    var backBtns = document.querySelectorAll('.btn-back');
    for (var b = 0; b < backBtns.length; b++) {
        backBtns[b].addEventListener('click', handleBackKey);
    }

    // Player Back
    var playerBack = document.getElementById('btn-player-back');
    if (playerBack) playerBack.addEventListener('click', closePlayer);

    // Hero Play
    var heroPlay = document.getElementById('btn-hero-play');
    if (heroPlay) {
        heroPlay.addEventListener('click', function() {
            if (state.focusedVodItem) {
                if (state.focusedVodItem.streamType === 'series') {
                    openSeriesDetails(state.focusedVodItem);
                } else {
                    playChannelFullscreen(state.focusedVodItem);
                }
            }
        });
    }

    // Search Handlers
    var liveSearch = document.getElementById('live-search-input');
    if (liveSearch) {
        liveSearch.addEventListener('change', function() {
            if (this.value.trim() !== '') {
                openCategoryChannels('Busca: ' + this.value, this.value);
            } else {
                switchView('view-live-categories');
                focusCategoryItem(0);
            }
        });
        liveSearch.addEventListener('keydown', function(e) {
            if (e.keyCode === 13 || e.key === 'Enter') {
                e.preventDefault();
                // Sem isto o handler global veria o Enter e reabriria o teclado.
                e.stopPropagation();
                this.blur();
            }
        });
    }

    var vodSearch = document.getElementById('vod-search-input');
    if (vodSearch) {
        // "input" dispara a cada tecla; "change" só disparava ao fechar o
        // teclado, que era o motivo de o resultado só aparecer no fim.
        vodSearch.addEventListener('input', function() {
            var termo = this.value;
            clearTimeout(vodSearchTimer);
            vodSearchTimer = setTimeout(function() {
                runVodSearch(termo);
            }, 300);   // respira entre teclas: são 20 mil títulos por varredura
        });

        vodSearch.addEventListener('keydown', function(e) {
            if (e.keyCode === 13 || e.key === 'Enter') {
                e.preventDefault();
                // Impede o handler global de ver este Enter e reabrir o teclado.
                e.stopPropagation();
                clearTimeout(vodSearchTimer);
                runVodSearch(this.value);
                this.blur();
            }
        });
    }

    // Seletor de idioma (Configurações)
    var langOpts = document.querySelectorAll('.lang-opt');
    for (var G = 0; G < langOpts.length; G++) {
        (function(btn) {
            btn.addEventListener('click', function() {
                trocarIdioma(btn.getAttribute('data-lang'));
            });
        })(langOpts[G]);
    }

    // Seletor de layout do VOD (existe nas duas telas)
    var layoutOpts = document.querySelectorAll('.layout-opt');
    for (var L = 0; L < layoutOpts.length; L++) {
        (function(btn) {
            btn.addEventListener('click', function() {
                setVodLayout(btn.getAttribute('data-layout'));
            });
        })(layoutOpts[L]);
    }

    // Demo Playlist
    var demoBtn = document.getElementById('btn-load-demo-playlist');
    if (demoBtn) {
        demoBtn.addEventListener('click', function() {
            loadStreams(DEMO_CHANNELS);
            showToast(t('toast.demo_ok'));
            switchView('view-dashboard');
            focusDashboardItem(0);
        });
    }

    // Disconnect Playlist
    var discBtn = document.getElementById('btn-disconnect-playlist');
    if (discBtn) {
        discBtn.addEventListener('click', function() {
            localStorage.removeItem('flux_m3u_url');
            localStorage.removeItem('flux_credentials');
            state.channels = [];
            state.streams = [];
            showToast(t('toast.desconectada'));
            loadStreams(DEMO_CHANNELS);
            switchView('view-dashboard');
            focusDashboardItem(0);
        });
    }

    // M3U Submit
    var m3uBtn = document.getElementById('btn-submit-m3u');
    if (m3uBtn) {
        m3uBtn.addEventListener('click', function() {
            var url = document.getElementById('m3u-url-input').value.trim();
            if (url) loadM3U(url);
        });
    }

    // Xtream Submit
    var xcBtn = document.getElementById('btn-submit-xc');
    if (xcBtn) {
        xcBtn.addEventListener('click', function() {
            var dom = document.getElementById('xc-domain-input').value.trim();
            var usr = document.getElementById('xc-user-input').value.trim();
            var pwd = document.getElementById('xc-pass-input').value.trim();
            if (dom && usr && pwd) {
                connectXtream(dom, usr, pwd);
            } else {
                showToast(t('toast.preencha_xtream'));
            }
        });
    }

    // Settings Disconnect
    var setDiscBtn = document.getElementById('btn-settings-disconnect');
    if (setDiscBtn) {
        setDiscBtn.addEventListener('click', function() {
            // Volta para a tela de ativação forçando um refresh na UI (não apaga Firebase, apenas local)
            // Se o firebase permitir, a TV pode reconectar ou o user pode colocar dados novos
            // Para "limpar" de fato o banco de dados via TV não faremos aqui, mas limparemos os dados na TV para pedir ativação de novo
            showToast(t('toast.dados_apagados'));
            
            // Pausa polling para evitar loop
            clearInterval(macAuthTimer);
            
            // Remove playlists se existirem
            state.channels = [];
            state.streams = [];
            
            var expTitle = document.querySelector('#view-activation .brand-title');
            var expMsg = document.querySelector('#view-activation p');
            if (expTitle) {
                expTitle.innerText = t('ativacao.desconectado');
                expTitle.style.color = '#fff';
            }
            if (expMsg) {
                expMsg.innerHTML = t('ativacao.desconectado_msg');
            }
            
            switchView('view-activation');
            macAuthTimer = setInterval(pollFirebaseAuth, 5000);
        });
    }

    // Back Keys
    var allBacks = document.querySelectorAll('.btn-back');
    for (var j = 0; j < allBacks.length; j++) {
        allBacks[j].addEventListener('click', function() {
            handleBackKey();
        });
    }
}

function loadM3U(url) {
    showToast(t('toast.carregando_m3u'));
    fetch(url)
        .then(function(r) { return r.text(); })
        .then(function(data) {
            var parsed = parseM3U(data);
            // M3U não tem API de conta: o provedor não informa validade nenhuma.
            var infoM3U = {
                type: 'm3u',
                server: url.replace(/^https?:\/\//, '').split('/')[0],
                user: '',
                status: '',
                expMs: 0,
                expLabel: t('lista.nao_informada'),
                maxConnections: '',
                activeConnections: '',
                checkedAt: new Date().toISOString()
            };

            if (parsed.length > 0) {
                localStorage.setItem('flux_m3u_url', url);
                setListState('ok', infoM3U);
                loadStreams(parsed);
                showToast(t('toast.canais_ok', { n: parsed.length }));
                switchView('view-dashboard');
                focusDashboardItem(0);
            } else {
                // Provedor devolveu a lista vazia — normalmente assinatura vencida.
                setListState('empty', infoM3U);
                loadStreams([]);
                showToast(listStateMessage());
                switchView('view-dashboard');
                focusDashboardItem(0);
            }
        })
        .catch(function(err) {
            console.error(err);
            setListState('auth', null);
            showToast(t('toast.erro_baixar'));
        });
}

function parseM3U(content) {
    var lines = content.split('\n');
    var channels = [];
    var cur = {};

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.indexOf('#EXTINF:') === 0) {
            cur = {};
            var logo = line.match(/tvg-logo="([^"]+)"/i);
            var group = line.match(/group-title="([^"]+)"/i);
            var parts = line.split(',');
            cur.tvgLogo = logo ? logo[1] : '';
            cur.groupTitle = group ? group[1] : t('live.geral');
            cur.name = parts.length > 1 ? parts[1].trim() : 'Canal ' + (channels.length + 1);
            
            // Detect stream type
            var gLower = cur.groupTitle.toLowerCase();
            if (gLower.indexOf('filme') !== -1 || gLower.indexOf('movie') !== -1 || gLower.indexOf('vod') !== -1) {
                cur.streamType = 'movie';
            } else if (gLower.indexOf('série') !== -1 || gLower.indexOf('serie') !== -1) {
                cur.streamType = 'series';
            } else {
                cur.streamType = 'live';
            }
        } else if (line.indexOf('http://') === 0 || line.indexOf('https://') === 0) {
            if (cur.name) {
                cur.url = line;
                channels.push(cur);
                cur = {};
            }
        }
    }
    return channels;
}

function connectXtream(domain, user, pass) {
    showToast(t('toast.conectando_xtream'));
    if (domain.indexOf('http://') !== 0 && domain.indexOf('https://') !== 0) {
        domain = 'http://' + domain;
    }

    var authUrl = domain + '/player_api.php?username=' + user + '&password=' + pass;
    fetch(authUrl)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var info = data && data.user_info;

            // Credenciais erradas / recusadas pelo painel.
            if (!info || info.auth !== 1) {
                setListState('auth', null);
                showToast(listStateMessage());
                switchView('view-dashboard');
                focusDashboardItem(0);
                return;
            }

            // Guarda o que o provedor informou sobre a assinatura desta lista.
            readProviderInfo(domain, user, info);

            // Assinatura vencida/bloqueada: não adianta baixar nada.
            if (state.listState !== 'ok') {
                showToast(listStateMessage());
                switchView('view-dashboard');
                focusDashboardItem(0);
                return;
            }

            if (state.listState === 'ok') {
                localStorage.setItem('flux_credentials', JSON.stringify({ domain: domain, user: user, pass: pass }));
                showToast(t('toast.login_ok'));

                // Fetch Live, VOD, Series Streams and Series Categories
                var urlLive = domain + '/player_api.php?username=' + user + '&password=' + pass + '&action=get_live_streams';
                var urlVod = domain + '/player_api.php?username=' + user + '&password=' + pass + '&action=get_vod_streams';
                var urlSeries = domain + '/player_api.php?username=' + user + '&password=' + pass + '&action=get_series';
                var urlSeriesCats = domain + '/player_api.php?username=' + user + '&password=' + pass + '&action=get_series_categories';

                Promise.all([
                    fetch(urlLive).then(function(res) { return res.json(); }).catch(function() { return []; }),
                    fetch(urlVod).then(function(res) { return res.json(); }).catch(function() { return []; }),
                    fetch(urlSeries).then(function(res) { return res.json(); }).catch(function() { return []; }),
                    fetch(urlSeriesCats).then(function(res) { return res.json(); }).catch(function() { return []; })
                ]).then(function(results) {
                    var liveList = results[0];
                    var vodList = results[1];
                    var seriesList = results[2];
                    var seriesCatsList = results[3];
                    
                    var seriesCatMap = {};
                    if (Array.isArray(seriesCatsList)) {
                        for (var c = 0; c < seriesCatsList.length; c++) {
                            seriesCatMap[seriesCatsList[c].category_id] = seriesCatsList[c].category_name;
                        }
                    }

                    var parsed = [];

                    if (Array.isArray(liveList)) {
                        for (var k = 0; k < liveList.length; k++) {
                            var item = liveList[k];
                            parsed.push({
                                name: item.name || 'Canal',
                                groupTitle: item.category_name || 'Ao Vivo',
                                tvgLogo: item.stream_icon || '',
                                url: domain + '/live/' + user + '/' + pass + '/' + item.stream_id + '.m3u8',
                                streamType: 'live',
                                streamId: item.stream_id
                            });
                        }
                    }

                    if (Array.isArray(vodList)) {
                        for (var v = 0; v < vodList.length; v++) {
                            var vItem = vodList[v];
                            parsed.push({
                                name: vItem.name || 'Filme',
                                groupTitle: vItem.category_name || 'Filmes',
                                tvgLogo: vItem.stream_icon || '',
                                url: domain + '/movie/' + user + '/' + pass + '/' + vItem.stream_id + '.' + (vItem.container_extension || 'mp4'),
                                streamType: 'movie',
                                streamId: vItem.stream_id,
                                plot: '',
                                year: '',
                                duration: '',
                                cast: '',
                                genre: vItem.category_name || 'Filme'
                            });
                        }
                    }

                    if (Array.isArray(seriesList)) {
                        for (var s = 0; s < seriesList.length; s++) {
                            var sItem = seriesList[s];
                            var cName = seriesCatMap[sItem.category_id] || sItem.category_name || 'Séries';
                            parsed.push({
                                name: sItem.name || 'Série',
                                groupTitle: cName,
                                tvgLogo: sItem.cover || '',
                                url: '', // Series don't have a direct URL, episodes do
                                streamType: 'series',
                                streamId: sItem.series_id,
                                plot: sItem.plot || '',
                                year: sItem.year || '',
                                duration: '',
                                cast: sItem.cast || '',
                                genre: sItem.genre || cName || 'Série'
                            });
                        }
                    }

                    if (parsed.length > 0) {
                        loadStreams(parsed);
                        showToast(t('toast.tudo_ok', { n: parsed.length }));
                    } else {
                        // Painel autorizou, mas não devolveu conteúdo nenhum.
                        setListState('empty', state.listInfo);
                        showToast(listStateMessage());
                        loadStreams([]);
                    }
                    switchView('view-dashboard');
                    focusDashboardItem(0);
                });
            }
        })
        .catch(function(err) {
            console.error(err);
            showToast(t('toast.erro_auth'));
        });
}

function toggleFavorite(channel) {
    if (!channel) return;
    var idx = -1;
    for (var i = 0; i < state.favorites.length; i++) {
        if (state.favorites[i].name === channel.name) {
            idx = i;
            break;
        }
    }

    if (idx >= 0) {
        state.favorites.splice(idx, 1);
        showToast(t('toast.fav_rem', { v: channel.name }));
    } else {
        state.favorites.push(channel);
        showToast(t('toast.fav_add', { v: channel.name }));
    }
    localStorage.setItem('flux_favorites', JSON.stringify(state.favorites));
    if (state.currentView === 'view-category-channels' && state.selectedCategory === t('live.favoritos')) {
        openCategoryChannels(t('live.favoritos'));
    }
}

/** Marca visualmente qual idioma está ativo. */
function marcarIdiomaAtivo() {
    var opts = document.querySelectorAll('.lang-opt');
    for (var i = 0; i < opts.length; i++) {
        opts[i].classList.toggle('is-on', opts[i].getAttribute('data-lang') === I18N.lang);
    }
}

/**
 * Troca o idioma e redesenha o que foi montado por JavaScript.
 * O HTML estático o próprio I18N.apply() resolve; o resto (categorias,
 * trilhos, rótulos da lista) precisa ser remontado com os textos novos.
 */
function trocarIdioma(lang) {
    I18N.set(lang);
    marcarIdiomaAtivo();
    renderListInfoSettings();
    if (state.streams && state.streams.length) {
        loadStreams(state.streams);
    }
    showToast(t('config.idioma') + ': ' + I18N.t('idioma.nome'));
}

function showToast(msg) {
    var toast = document.getElementById('toast');
    var text = document.getElementById('toast-text');
    if (!toast || !text) return;
    text.innerText = msg;
    toast.classList.remove('hidden');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(function() {
        toast.classList.add('hidden');
    }, 3500);
}
