/**
 * HEINSEN IPTV - PLAYER ENGINE (SAMSUNG AVPLAY + HTML5/HLS FALLBACK)
 * Native hardware-accelerated playback for Samsung Tizen Smart TVs + PC Web Preview
 */

// Dynamically load HLS.js on Desktop PC Browsers only (safe for PC, avoids TV Chromium 56 issue)
if (typeof window !== 'undefined' && !window.webapis && !window.Hls) {
    var hlsScript = document.createElement('script');
    hlsScript.src = "https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js";
    document.head.appendChild(hlsScript);
}

/* --------------------------------------------------------------------------
   VIGIA DE TRAVAMENTO (canais ao vivo)
   Em lista de IPTV é comum o servidor parar de alimentar o stream e o player
   ficar preso no buffer para sempre. O vigia percebe e reinicia sozinho, sem
   o usuário precisar sair do canal e entrar de novo.
   -------------------------------------------------------------------------- */
var VIGIA_PARADO = 8;    // segundos com o vídeo sem avançar
var VIGIA_BUFFER = 15;   // segundos preso carregando o buffer
var VIGIA_MAX = 5;       // reinícios seguidos antes de desistir
var VIGIA_BUFFER_TOTAL = 40; // segundos carregando no total, mesmo que progrida

/* Tempo máximo esperando o motor ficar pronto. Canal de bitrate alto (FHD/UHD)
   precisa baixar muito mais dado que um SD antes do primeiro quadro, então um
   limite curto derruba justamente os canais de melhor qualidade. */
var PREPARO_TIMEOUT = 25000;

class HeisenPlayer {
    constructor() {
        this.html5Video = document.getElementById('html5-video');
        this.avplayerObj = document.getElementById('avplayer');
        this.loader = document.getElementById('video-loader');
        this.statusText = document.getElementById('video-status-text');
        this.errorBanner = document.getElementById('video-error');
        this.errorMsg = document.getElementById('video-error-msg');
        
        this.currentUrl = '';
        this.isAvPlayAvailable = (typeof window.webapis !== 'undefined' && window.webapis.avplay);
        this.hlsInstance = null;
        this.isPlaying = false;
        this.isStopped = false;
        this.isFullscreen = false;
        this.retryCount = 0;
        this.activeEngine = 'avplay';
        this.virtualTime = 0; // Smart fallback ticker
        this.virtualDuration = 0;

        this.isLive = false;
        this.recuperando = false;
        this.formatoAlternativoTentado = false;
        this.prepareSeq = 0;       // identifica a tentativa de prepare em curso
        this.prepareTimeoutId = null;
        this.preparando = false;
        this.nomeCanal = '';
        this.zerarVigia();

        var self = this;

        // Sinais de travamento do lado HTML5 (PC e fallback na TV).
        this.html5Video.addEventListener('waiting', function() {
            if (self.activeEngine === 'html5') { self.vigia.bufferando = true; self.vigia.bufferandoHa = 0; }
        });
        this.html5Video.addEventListener('stalled', function() {
            if (self.activeEngine === 'html5') self.vigia.bufferando = true;
        });
        this.html5Video.addEventListener('playing', function() {
            self.vigia.bufferando = false;
            self.vigia.bufferandoHa = 0;
            self.vigia.bufferandoTotal = 0;
        });
        this.html5Video.addEventListener('error', function() {
            if (self.activeEngine === 'html5' && self.isLive) self.recuperar('erro no elemento de vídeo');
        });

        this.html5Video.addEventListener('timeupdate', function() {
            if (self.activeEngine === 'html5' && self.onTimeUpdate) {
                var cTime = Math.floor(self.html5Video.currentTime * 1000);
                if (cTime >= 0) {
                    self.onTimeUpdate(cTime);
                }
            }
        });
        
        console.log('[HeisenPlayer] Initialized. Samsung AVPlay native engine detected:', this.isAvPlayAvailable);
    }

    play(url, isFullscreen = false, isLive = false, ehRecuperacao = false, nomeCanal = null) {
        if (!url) return;
        this.currentUrl = url;
        if (nomeCanal !== null) this.nomeCanal = nomeCanal;
        this.isFullscreen = isFullscreen;
        this.isLive = isLive;
        this.isStopped = false;
        this.retryCount = 0;

        if (ehRecuperacao) {
            // Mantém o contador de tentativas: é a mesma crise, não um canal novo.
            // Mantém também o formato já escolhido, para não ficar alternando
            // entre .ts e .m3u8 a cada reinício do vigia.
            this.vigia.paradoHa = 0;
            this.vigia.bufferandoHa = 0;
            this.vigia.bufferandoTotal = 0;
            this.vigia.bufferando = false;
            this.vigia.ultimoTempo = -1;
        } else {
            this.formatoAlternativoTentado = false;
            this.zerarVigia();
            this.showLoader(true, t('player.conectando'));
        }
        this.hideError();

        console.log('[HeisenPlayer] Playing URL:', url, 'Mode:', isFullscreen ? 'FullScreen' : 'MiniPreview');

        var self = this;
        this.virtualTime = 0;
        
        if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
        this.timeUpdateInterval = setInterval(function() {
            // Force sync isPlaying from actual AVPlay engine to prevent frozen states
            if (self.activeEngine === 'avplay' && self.isAvPlayAvailable) {
                try {
                    var st = window.webapis.avplay.getState();
                    if (st === 'PLAYING') self.isPlaying = true;
                    else if (st === 'PAUSED' || st === 'IDLE' || st === 'NONE') self.isPlaying = false;
                } catch(e){}
            }

            if (self.isPlaying) {
                // If the TV engine is struggling, we force our own virtual clock to tick
                self.virtualTime += 1000;
                
                var cTime = self.getCurrentTime();
                
                // If it's AVPlay and it's a VOD (the only time we use virtualTime heavily), just trust virtualTime
                // because AVPlay's clock is often completely corrupted (e.g. stuck at 5ms).
                if (self.activeEngine === 'avplay') {
                    cTime = self.virtualTime;
                } else if (isNaN(cTime) || cTime <= 0) {
                    cTime = self.virtualTime;
                }
                
                if (self.onTimeUpdate && cTime >= 0) {
                    self.onTimeUpdate(cTime);
                }
            }

            self.verificarTravamento();
        }, 1000);

        if (this.isAvPlayAvailable) {
            this.playWithAvPlay(url, isFullscreen);
        } else {
            this.playWithHtml5(url);
        }
    }

    zerarVigia() {
        this.vigia = {
            ultimoTempo: -1,
            paradoHa: 0,
            bufferandoHa: 0,
            bufferandoTotal: 0,
            bufferando: false,
            tentativas: 0,
            relogioConfiavel: false
        };
    }

    /** Posição real informada pelo motor (não o relógio virtual da interface). */
    tempoReal() {
        try {
            if (this.activeEngine === 'avplay') {
                return parseInt(window.webapis.avplay.getCurrentTime(), 10) || 0;
            }
            if (this.html5Video) return Math.floor((this.html5Video.currentTime || 0) * 1000);
        } catch (e) {}
        return -1;
    }

    /** Roda a cada segundo. Decide se o canal travou. */
    verificarTravamento() {
        if (!this.isLive || this.isStopped || this.recuperando) return;

        var v = this.vigia;

        // 1) Preso no buffer — o sintoma que o usuário descreve.
        if (v.bufferando) {
            v.bufferandoHa++;
            v.bufferandoTotal++;
            if (v.bufferandoHa >= VIGIA_BUFFER) {
                this.recuperar('buffer parado há ' + v.bufferandoHa + 's');
                return;
            }
            // bufferandoHa zera a cada 1% de progresso, então um buffer que
            // arrasta para sempre sem completar nunca o faria disparar.
            if (v.bufferandoTotal >= VIGIA_BUFFER_TOTAL) {
                this.recuperar('buffer sem completar há ' + v.bufferandoTotal + 's');
                return;
            }
        }

        if (!this.isPlaying) return;

        // 2) Vídeo sem avançar. Só vale DEPOIS que o relógio do motor provar
        //    que funciona neste aparelho: no AVPlay ele às vezes fica fixo num
        //    valor mesmo com o vídeo rodando, e isso reiniciaria canal bom.
        var agora = this.tempoReal();
        if (v.ultimoTempo >= 0 && agora > v.ultimoTempo) v.relogioConfiavel = true;

        // v.ultimoTempo >= 0 é essencial: na primeira passada ele vale -1 e
        // qualquer tempo pareceria "avanço", zerando o contador de tentativas.
        // Sem isso o teto de 5 nunca é atingido e um canal morto reinicia
        // para sempre, em vez de avisar o usuário.
        if (v.relogioConfiavel && v.ultimoTempo >= 0) {
            if (agora === v.ultimoTempo) {
                v.paradoHa++;
                if (v.paradoHa >= VIGIA_PARADO) {
                    this.recuperar('vídeo parado há ' + v.paradoHa + 's');
                    return;
                }
            } else {
                v.paradoHa = 0;
                v.tentativas = 0;   // voltou a rodar bem: zera o histórico
            }
        }

        v.ultimoTempo = agora;
    }

    /** Reabre o mesmo canal, com espera crescente e um teto de tentativas. */
    recuperar(motivo) {
        if (this.recuperando || this.isStopped || !this.isLive) return;
        // Reabrir o motor enquanto ele ainda está preparando é o caminho mais
        // curto para derrubar o aplicativo. Espera o prepare se resolver.
        if (this.preparando) return;

        var v = this.vigia;
        if (v.tentativas >= VIGIA_MAX) {
            console.warn('[Vigia] Desisti depois de ' + v.tentativas + ' tentativas. Motivo:', motivo);
            this.showLoader(false);
            this.showError(t('player.sem_sinal'));
            return;
        }

        v.tentativas++;
        this.recuperando = true;
        console.warn('[Vigia] ' + motivo + ' -> reiniciando (tentativa ' + v.tentativas + ')');
        this.showLoader(true, t('player.reconectando', { n: v.tentativas }));

        var url = this.currentUrl;
        var fs = this.isFullscreen;
        var espera = Math.min(1000 * Math.pow(2, v.tentativas - 1), 8000);
        var self = this;

        setTimeout(function() {
            self.recuperando = false;
            if (self.isStopped) return;          // usuário saiu do canal nesse meio-tempo
            self.play(url, fs, true, true);
        }, espera);
    }

    /**
     * Devolve o motor ao estado NONE, que é o único em que open() é válido.
     *
     * O código antigo pulava o close() quando o estado era IDLE. Só que IDLE é
     * justamente o estado de um canal que ainda está conectando: quem saía
     * desse canal deixava o motor em IDLE, e o open() do canal seguinte era
     * uma violação de estado que derrubava o aplicativo.
     *
     * Reler o estado entre as chamadas também importa: stop() muda o estado,
     * e decidir o close() com o valor lido antes acerta por acaso.
     */
    /** A TV tem painel UHD? Pergunta uma vez só e guarda a resposta. */
    painelUhd() {
        if (this._painelUhd === undefined) {
            this._painelUhd = false;
            try {
                var pi = window.webapis && window.webapis.productinfo;
                if (pi && pi.isUdPanelSupported) this._painelUhd = !!pi.isUdPanelSupported();
            } catch (e) {}
        }
        return this._painelUhd;
    }

    /** Vale a pena pedir modo 4K para este canal nesta TV? */
    querUhd() {
        if (!this.painelUhd()) return false;
        return /(^|[^A-Z])(4K|UHD|2160P?)([^A-Z]|$)/i.test(this.nomeCanal || '');
    }

    liberarMotor() {
        if (!this.isAvPlayAvailable) return;
        var avplay = window.webapis.avplay;
        var st;

        try { st = avplay.getState(); } catch (e) { return; }

        // stop() só é aceito em READY, PLAYING e PAUSED.
        if (st === 'READY' || st === 'PLAYING' || st === 'PAUSED') {
            try { avplay.stop(); } catch (e) { console.warn('[AVPlay] stop recusado:', e); }
        }

        try { st = avplay.getState(); } catch (e) { st = 'NONE'; }
        if (st !== 'NONE') {
            try { avplay.close(); } catch (e) { console.warn('[AVPlay] close recusado:', e); }
        }
    }

    /**
     * No painel Xtream o mesmo canal ao vivo existe em dois formatos:
     *   .../live/usuario/senha/ID.m3u8  -> HLS, o painel remuxa na hora
     *   .../live/usuario/senha/ID.ts    -> MPEG-TS direto, sem remux
     * Quando um não abre, o outro quase sempre abre. Só vale para canal ao
     * vivo: em filme e série a extensão é o arquivo de verdade.
     */
    urlAlternativa(url) {
        if (!this.isLive || !url) return null;
        if (/\.m3u8(\?|$)/.test(url)) return url.replace(/\.m3u8(\?|$)/, '.ts$1');
        if (/\.ts(\?|$)/.test(url)) return url.replace(/\.ts(\?|$)/, '.m3u8$1');
        return null;
    }

    playWithAvPlay(url, isFullscreen) {
        var self = this;
        this.activeEngine = 'avplay';

        /* Como agora pode haver uma segunda tentativa (o outro formato), o
           callback atrasado da primeira chegaria em cima dela e mandaria
           play() num motor que está reabrindo. Cada tentativa carrega seu
           número e as antigas se calam sozinhas. */
        var meuPrepare = ++this.prepareSeq;

        /* Cronômetro da abertura do canal. Serve para diagnosticar bitrate
           alto: no log dá para ver se o tempo foi no prepare ou no buffer. */
        var t0 = Date.now();
        var diag = function(m) { console.log('[Diag +' + (Date.now() - t0) + 'ms] ' + m); };
        diag('abrindo ' + (self.isLive ? 'AO VIVO' : 'VOD') + ': ' + url);
        try {
            var avplay = window.webapis.avplay;
            
            // Motor obrigatoriamente em NONE antes de abrir o próximo canal.
            this.liberarMotor();

            // Open stream
            avplay.open(url);

            // Set screen coordinates
            if (isFullscreen) {
                avplay.setDisplayRect(0, 0, 1920, 1080);
            } else {
                avplay.setDisplayRect(1200, 115, 670, 280);
            }

            avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_LETTER_BOX');

            // Set streaming properties for IPTV compatibility
            try {
                avplay.setStreamingProperty("USER_AGENT", "Mozilla/5.0 (SMART-TV; Linux; Tizen 4.0) SamsungSmartTV");
            } catch (e) {}

            /* Quanto o motor exige antes de soltar o primeiro quadro.
               O padrão da Samsung é "32MB ou 10s de vídeo". Num canal UHD de
               ~25 Mbps esses 10s dão ~31MB: meio minuto baixando antes de
               aparecer qualquer coisa. O mesmo canal em SD são ~2MB e abre na
               hora -- era por isso que só FHD/UHD ficavam presos conectando.
               4 segundos é o mínimo que a API aceita.
               Só vale em IDLE, ou seja: depois do open() e antes do prepare(). */
            try {
                if (avplay.setBufferingParam) {
                    avplay.setBufferingParam('PLAYER_BUFFER_FOR_PLAY', 'PLAYER_BUFFER_SIZE_IN_SECOND', 4);
                    avplay.setBufferingParam('PLAYER_BUFFER_FOR_RESUME', 'PLAYER_BUFFER_SIZE_IN_SECOND', 4);
                    diag('buffer de partida ajustado para 4s');
                } else {
                    diag('ATENCAO: setBufferingParam nao existe neste firmware');
                }
            } catch (e) { diag('ATENCAO: setBufferingParam recusado -> ' + e); }

            /* Libera a decodificação 4K. Equivale a
               FIXED_MAX_RESOLUTION=3840X2160, ou seja: manda o motor reservar
               recursos de 4K. Pedir isso em todo canal, inclusive SD numa TV
               de painel 1080p, é desperdício e deixa o motor instável -- por
               isso só pedimos quando a TV é UHD e o canal se diz UHD/4K. */
            if (this.querUhd()) {
                try {
                    avplay.setStreamingProperty('SET_MODE_4K', 'TRUE');
                    diag('modo 4K liberado');
                } catch (e) { diag('ATENCAO: SET_MODE_4K recusado -> ' + e); }
            } else {
                diag('modo 4K dispensado (painel UHD: ' + this.painelUhd() +
                     ', canal: "' + (this.nomeCanal || '?') + '")');
            }

            /* ATENÇÃO: este parâmetro é em SEGUNDOS, não em milissegundos.
               Estava 15000, que são mais de 4 horas -- na prática desligava o
               escape e deixava o canal preso no buffer para sempre. Com 10s o
               motor começa a tocar mesmo com o buffer incompleto. */
            try {
                if (avplay.setTimeoutForBuffering) {
                    avplay.setTimeoutForBuffering(10); // segundos
                    diag('timeout de buffer: 10s');
                }
            } catch (e) { diag('ATENCAO: setTimeoutForBuffering recusado -> ' + e); }

            // Event Listeners
            avplay.setListener({
                onbufferingstart: function() {
                    diag('buffer COMECOU a carregar');
                    self.vigia.bufferando = true;
                    self.vigia.bufferandoHa = 0;
                    self.showLoader(true, t('player.buffer'));
                },
                onbufferingprogress: function(percent) {
                    // Buffer que progride não está travado: reinicia a contagem.
                    self.vigia.bufferandoHa = 0;
                    self.showLoader(true, t('player.buffer_pct', { n: percent }));
                },
                onbufferingcomplete: function() {
                    diag('buffer COMPLETO -- video deve aparecer agora');
                    self.vigia.bufferando = false;
                    self.vigia.bufferandoHa = 0;
                    self.vigia.bufferandoTotal = 0;
                    self.showLoader(false);
                    self.isPlaying = true;
                },
                oncurrentplaytime: function(time) {
                    var t = parseInt(time, 10);
                    // For AVPlay, we strictly use our virtual timer to prevent small corrupted ticks (e.g. 5ms) 
                    // from overwriting the UI continuously.
                    var finalTime = self.virtualTime; 
                    
                    if (self.onTimeUpdate && finalTime >= 0) {
                        self.onTimeUpdate(finalTime);
                    }
                },
                onerror: function(eventType) {
                    console.error('[AVPlay] Playback Error Event:', eventType);
                    // Ao vivo, erro do motor é quase sempre a lista engasgando:
                    // tenta reconectar em vez de só mostrar o aviso e parar.
                    if (self.isLive) {
                        self.recuperar('erro do motor (' + eventType + ')');
                        return;
                    }
                    self.showLoader(false);
                    self.showError(t('player.sinal_off_cod', { cod: eventType }));
                },
                onevent: function(eventType, eventData) {},
                onstreamcompleted: function() {
                    console.log('[AVPlay] Stream finished.');
                    // Canal ao vivo não "termina": se terminou, a fonte caiu.
                    if (self.isLive) self.recuperar('o stream terminou sozinho');
                }
            });

            /* Caminho único de desistência: antes de cair no HTML5 (que na TV
               não dá conta de MPEG-TS), tenta o mesmo canal no outro formato. */
            var desistirDoPrepare = function(motivo) {
                if (self.isStopped) return;
                var alt = self.urlAlternativa(url);
                if (alt && !self.formatoAlternativoTentado) {
                    self.formatoAlternativoTentado = true;
                    console.warn('[AVPlay] ' + motivo + ' -> tentando o outro formato: ' + alt);
                    self.liberarMotor();
                    self.currentUrl = alt;   // o vigia precisa reiniciar por esta
                    self.showLoader(true, t('player.conectando'));
                    self.playWithAvPlay(alt, isFullscreen);
                    return;
                }
                console.warn('[AVPlay] ' + motivo + ' -> caindo para o HTML5.');
                self.liberarMotor();
                self.playWithHtml5(url);
            };

            diag('chamando prepareAsync');
            this.preparando = true;
            var prepareTimeout = setTimeout(function() {
                if (meuPrepare !== self.prepareSeq) return;   // tentativa velha
                self.preparando = false;
                diag('ESTOUROU o tempo de prepare');
                desistirDoPrepare('prepareAsync passou de ' + (PREPARO_TIMEOUT / 1000) + 's');
            }, PREPARO_TIMEOUT);
            this.prepareTimeoutId = prepareTimeout;

            avplay.prepareAsync(function() {
                clearTimeout(prepareTimeout);
                self.preparando = false;
                if (meuPrepare !== self.prepareSeq) return;   // tentativa velha
                diag('motor PRONTO (prepare concluido)');
                if (self.isStopped) {
                    console.log('[AVPlay] Stream prepared but player was stopped during loading. Cancelling playback.');
                    try { avplay.stop(); } catch(e){}
                    return;
                }
                console.log('[AVPlay] Stream prepared successfully, starting playback...');
                avplay.play();
                self.isPlaying = true;
                self.showLoader(false);
            }, function(err) {
                clearTimeout(prepareTimeout);
                self.preparando = false;
                if (meuPrepare !== self.prepareSeq) return;   // tentativa velha
                diag('prepare FALHOU: ' + ((err && err.name) || err));
                console.warn('[AVPlay] prepareAsync notice:', err);

                // If async failed once, retry with sync prepare or html5 fallback
                if (self.retryCount < 1) {
                    self.retryCount++;
                    console.log('[AVPlay] Retrying prepare...');
                    try {
                        avplay.prepare();
                        avplay.play();
                        self.isPlaying = true;
                        self.showLoader(false);
                        return;
                    } catch (e) {
                        console.warn('[AVPlay] Sync prepare also failed:', e);
                    }
                }

                desistirDoPrepare('prepareAsync falhou (' + ((err && err.name) || err) + ')');
            });

        } catch (e) {
            console.error('[AVPlay] Exception in playWithAvPlay:', e);
            this.playWithHtml5(url);
        }
    }

    playWithHtml5(url) {
        if (!this.html5Video) return;
        this.activeEngine = 'html5';
        
        // Stop & clean previous state
        this.html5Video.pause();
        this.html5Video.removeAttribute('src');
        this.html5Video.load();

        var self = this;

        if (this.hlsInstance) {
            this.hlsInstance.destroy();
            this.hlsInstance = null;
        }

        var isHls = url.indexOf('.m3u8') !== -1 || url.indexOf('type=m3u') !== -1;
        var self = this;
        var isTizen = (typeof window.webapis !== 'undefined');

        if (isHls && window.Hls && Hls.isSupported() && !isTizen) {
            this.hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            this.hlsInstance.loadSource(url);
            this.hlsInstance.attachMedia(this.html5Video);
            
            this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                self.isPlaying = true; // Always set to true for older browsers
                self.showLoader(false);
                var playPromise = self.html5Video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(function(e) {
                        console.warn('[HTML5 Video] Autoplay blocked, unmuting:', e);
                        self.html5Video.muted = true;
                        self.html5Video.play();
                    });
                }
            });

            this.hlsInstance.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                    console.error('[Hls.js] Fatal Error:', data.type);
                    self.showLoader(false);
                    self.showError(t('player.sinal_off'));
                }
            });
        } else {
            // Direct MP4 / Video
            this.html5Video.src = url;
            this.isPlaying = true; // Always set to true for older browsers that return undefined
            self.showLoader(false);
            
            var playPromise = this.html5Video.play();
            if (playPromise !== undefined) {
                playPromise.catch(function(err) {
                    console.warn('[HTML5 Video] Play error, trying muted:', err);
                    self.html5Video.muted = true;
                    self.html5Video.play();
                });
            }
        }
    }

    stop() {
        this.isPlaying = false;
        this.isStopped = true;
        this.isLive = false;
        this.recuperando = false;
        this.zerarVigia();
        this.showLoader(false);
        this.hideError();

        /* Qualquer prepare ainda no ar passa a ser tentativa velha e se cala
           sozinho. Sem isso o callback de um canal abandonado chegava em cima
           do canal seguinte. */
        this.prepareSeq++;
        this.preparando = false;
        if (this.prepareTimeoutId) {
            clearTimeout(this.prepareTimeoutId);
            this.prepareTimeoutId = null;
        }

        this.liberarMotor();

        if (this.hlsInstance) {
            this.hlsInstance.destroy();
            this.hlsInstance = null;
        }

        if (this.html5Video) {
            this.html5Video.pause();
            this.html5Video.removeAttribute('src');
            this.html5Video.load();
        }
        
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
            this.timeUpdateInterval = null;
        }
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        if (this.activeEngine === 'avplay') {
            try {
                window.webapis.avplay.pause();
            } catch (e) {
                console.warn('[AVPlay] Pause error:', e);
            }
        } else if (this.activeEngine === 'html5' && this.html5Video) {
            this.html5Video.pause();
        }
    }

    resume() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        if (this.activeEngine === 'avplay') {
            try {
                window.webapis.avplay.play();
            } catch (e) {
                console.warn('[AVPlay] Resume error:', e);
            }
        } else if (this.activeEngine === 'html5' && this.html5Video) {
            this.html5Video.play().catch(function(e){});
        }
    }

    seek(milliseconds) {
        var self = this;
        var current = this.getCurrentTime();
        if (current <= 0) current = this.virtualTime;
        
        var duration = this.getDuration();
        var targetTime = current + milliseconds;
        
        if (targetTime < 0) targetTime = 0;
        if (targetTime > duration && duration > 0) targetTime = duration - 1000;
        
        milliseconds = targetTime - current; // Adjust actual jump distance based on clamped targetTime
        
        this.virtualTime = targetTime; // Update our smart clock
        if (this.onTimeUpdate) this.onTimeUpdate(targetTime); // Instantly update UI while seeking
        
        if (this.activeEngine === 'avplay') {
            try {
                // Instantly resume ticking from the new time
                self.virtualTime = targetTime;
                
                var jumpSuccess = function() { self.showLoader(false); };
                var jumpError = function(e) { 
                    console.warn('[AVPlay] Jump failed:', e);
                    self.showLoader(false); 
                };

                if (milliseconds > 0) {
                    window.webapis.avplay.jumpForward(milliseconds, jumpSuccess, jumpError);
                } else {
                    window.webapis.avplay.jumpBackward(Math.abs(milliseconds), jumpSuccess, jumpError);
                }
            } catch (e) {
                console.warn('[AVPlay] Seek exception:', e);
                self.showLoader(false);
            }
        } else if (this.activeEngine === 'html5' && this.html5Video) {
            this.html5Video.currentTime = targetTime / 1000;
            self.showLoader(false);
        }
    }

    getCurrentTime() {
        if (this.activeEngine === 'avplay') {
            try {
                return window.webapis.avplay.getCurrentTime();
            } catch (e) { return 0; }
        } else if (this.activeEngine === 'html5' && this.html5Video) {
            return (this.html5Video.currentTime || 0) * 1000;
        }
        return 0;
    }

    getDuration() {
        if (this.activeEngine === 'avplay') {
            try {
                return parseInt(window.webapis.avplay.getDuration(), 10) || 0;
            } catch (e) { return 0; }
        } else if (this.activeEngine === 'html5' && this.html5Video) {
            return (this.html5Video.duration || 0) * 1000;
        }
        return 0;
    }

    showLoader(show, text) {
        if (!this.loader) return;
        if (show) {
            this.loader.classList.remove('hidden');
            if (this.statusText) this.statusText.innerText = text;
        } else {
            this.loader.classList.add('hidden');
        }
    }

    showError(msg) {
        if (!this.errorBanner) return;
        this.errorBanner.classList.remove('hidden');
        if (this.errorMsg) this.errorMsg.innerText = msg;
    }

    hideError() {
        if (!this.errorBanner) return;
        this.errorBanner.classList.add('hidden');
    }
}
