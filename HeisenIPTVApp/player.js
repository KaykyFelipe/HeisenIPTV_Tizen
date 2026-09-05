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
        
        var self = this;
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

    play(url, isFullscreen = false) {
        if (!url) return;
        this.currentUrl = url;
        this.isFullscreen = isFullscreen;
        this.isStopped = false;
        this.retryCount = 0;
        this.showLoader(true, 'Conectando ao canal...');
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
        }, 1000);

        if (this.isAvPlayAvailable) {
            this.playWithAvPlay(url, isFullscreen);
        } else {
            this.playWithHtml5(url);
        }
    }

    playWithAvPlay(url, isFullscreen) {
        var self = this;
        this.activeEngine = 'avplay';
        try {
            var avplay = window.webapis.avplay;
            
            // Clean up previous state safely
            try {
                var curState = avplay.getState();
                if (curState === 'PLAYING' || curState === 'PAUSED') {
                    avplay.stop();
                }
                if (curState !== 'NONE' && curState !== 'IDLE') {
                    avplay.close();
                }
            } catch (e) {
                console.warn('[AVPlay] State cleanup notice:', e);
            }

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

            // Set a buffering timeout so it doesn't hang forever
            try {
                if (avplay.setTimeoutForBuffering) {
                    avplay.setTimeoutForBuffering(15000); // 15s timeout
                }
            } catch (e) {}

            // Event Listeners
            avplay.setListener({
                onbufferingstart: function() {
                    self.showLoader(true, 'Carregando buffer...');
                },
                onbufferingprogress: function(percent) {
                    self.showLoader(true, 'Buffer ' + percent + '%...');
                },
                onbufferingcomplete: function() {
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
                    self.showLoader(false);
                    self.showError('Sinal temporariamente indisponível (' + eventType + ').');
                },
                onevent: function(eventType, eventData) {},
                onstreamcompleted: function() {
                    console.log('[AVPlay] Stream finished.');
                }
            });

            // Prepare stream
            var prepareTimeout = setTimeout(function() {
                console.warn('[AVPlay] prepareAsync timeout (8s). Falling back to HTML5 Native.');
                try { avplay.stop(); } catch(e){}
                self.playWithHtml5(url);
            }, 8000);

            avplay.prepareAsync(function() {
                clearTimeout(prepareTimeout);
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
                
                self.playWithHtml5(url);
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
                    self.showError('Sinal temporariamente indisponível.');
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
        this.showLoader(false);
        this.hideError();

        if (this.isAvPlayAvailable) {
            try {
                var avplay = window.webapis.avplay;
                var curState = avplay.getState();
                if (curState === 'PLAYING' || curState === 'PAUSED') {
                    avplay.stop();
                }
                if (curState !== 'NONE' && curState !== 'IDLE') {
                    avplay.close();
                }
            } catch (e) {}
        }

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

    showLoader(show, text = 'Carregando stream...') {
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
