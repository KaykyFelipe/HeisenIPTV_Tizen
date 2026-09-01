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

    // 2. Start Live Clock
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

    // 7. Focus Guard Interval
    setInterval(function() {
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
                
                // --- LICENSE GUARD (TRIAL CHECK) ---
                var isPaid = data.isPaid === true;
                var trialStart = new Date(data.trialStartDate || new Date());
                var now = new Date();
                var diffDays = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) diffDays = 0; // Previne datas no futuro gerarem mais de 7 dias
                
                if (!isPaid && diffDays >= 7) {
                    // LICENÇA EXPIRADA
                    clearInterval(macAuthTimer); // Para o polling rápido
                    
                    var expTitle = document.querySelector('#view-activation .brand-title');
                    var expMsg = document.querySelector('#view-activation p');
                    if (expTitle) {
                        expTitle.innerText = 'Licença Expirada';
                        expTitle.style.color = '#e50914';
                    }
                    if (expMsg) {
                        expMsg.innerHTML = 'Seu período de teste de 7 dias acabou.<br><br>Acesse nosso portal no celular ou computador para adquirir a licença (Anual ou Vitalícia) e liberar seu acesso:';
                    }
                    
                    switchView('view-activation');
                    
                    // Começa a fazer polling mais lento (a cada 15 segs) esperando o pagamento
                    macAuthTimer = setInterval(pollFirebaseAuth, 15000);
                    return; // Bloqueia o carregamento
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
                    showToast('Você está no período de testes. Restam ' + diasRestantes + ' dias.');
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

function startClock() {
    var update = function() {
        var now = new Date();
        var timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        var dateStr = now.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit', year: 'numeric' });
        
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
    catMap['⭐ Favoritos'] = state.favorites.length;
    for (var j = 0; j < live.length; j++) {
        var g = live[j].groupTitle || 'Geral';
        catMap[g] = (catMap[g] || 0) + 1;
    }

    state.categories = Object.keys(catMap).map(function(name) {
        return { name: name, count: catMap[name] };
    });

    renderLiveCategories();
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
    
    try {
        el.focus();
    } catch (e) {}

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
        var data = el.dataset.item ? JSON.parse(el.dataset.item) : null;
        if (data) updateHeroSection(data);
    }
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

    for (var i = 0; i < state.categories.length; i++) {
        var cat = state.categories[i];
        var card = document.createElement('div');
        card.className = 'category-card focusable';
        card.tabIndex = 0;
        card.dataset.index = i;
        card.innerHTML = 
            '<span class="category-folder-icon">' + (cat.name === '⭐ Favoritos' ? '⭐' : '📁') + '</span>' +
            '<div class="category-card-meta">' +
                '<div class="category-card-name">' + cat.name + '</div>' +
                '<div class="category-card-count">' + cat.count + ' canais</div>' +
            '</div>';
        
        (function(cName) {
            card.addEventListener('click', function() {
                openCategoryChannels(cName);
            });
        })(cat.name);

        grid.appendChild(card);
    }
}

function openCategoryChannels(categoryName) {
    state.selectedCategory = categoryName;
    document.getElementById('selected-category-title').innerText = categoryName;

    var filtered = [];
    if (categoryName === '⭐ Favoritos') {
        filtered = state.favorites;
    } else {
        for (var i = 0; i < state.channels.length; i++) {
            var s = state.channels[i];
            if ((s.streamType === 'live' || !s.streamType) && (s.groupTitle || 'Geral') === categoryName) {
                filtered.push(s);
            }
        }
    }
    state.categoryChannels = filtered;
    document.getElementById('selected-category-count').innerText = filtered.length + ' itens';

    var grid = document.getElementById('category-channels-grid');
    grid.innerHTML = '';

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
                '<div class="channel-card-sub">' + (ch.epgNow || ch.groupTitle || 'Ao Vivo') + '</div>' +
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

function openNetflixView(type) {
    state.vodType = type;
    var railsContainer = document.getElementById('netflix-rails');
    railsContainer.innerHTML = '';

    var filteredStreams = [];
    for (var i = 0; i < state.streams.length; i++) {
        if (state.streams[i].streamType === type) {
            filteredStreams.push(state.streams[i]);
        }
    }

    var groups = {};
    for (var j = 0; j < filteredStreams.length; j++) {
        var s = filteredStreams[j];
        var g = s.groupTitle || (type === 'movie' ? 'Filmes em Destaque' : 'Séries Populares');
        if (!groups[g]) groups[g] = [];
        groups[g].push(s);
    }

    state.vodCategories = groups;
    state.vodCatNames = Object.keys(groups);
    state.renderedRails = 0;
    state.renderedCardsPerRow = [];

    // Initial render: 5 rows
    var maxInitialCats = Math.min(state.vodCatNames.length, 5);
    for (var r = 0; r < maxInitialCats; r++) {
        appendVodRow();
    }

    if (filteredStreams.length > 0) {
        updateHeroSection(filteredStreams[0]);
    }

    switchView('view-netflix');
    state.netflixRailIndex = 0;
    state.netflixCardIndex = 0;
    
    setTimeout(function() {
        var firstCard = document.querySelector('.movie-poster-card');
        if (firstCard) setElementFocus(firstCard);
    }, 50);
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
        card.innerHTML = '<div class="movie-poster-title">' + item.name + '</div>';
        
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
    document.getElementById('hero-plot').innerText = item.plot || 'Buscando informações do filme...';
    document.getElementById('hero-year').innerText = item.year || '';
    document.getElementById('hero-duration').innerText = item.duration || (item.streamType === 'series' ? 'Série' : '');
    document.getElementById('hero-cast').innerText = 'Elenco: ' + (item.cast || '...');
    document.getElementById('hero-genre').innerText = 'Gênero: ' + (item.genre || item.groupTitle || 'Geral');
    
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
                    item.plot = data.info.plot || 'Nenhuma descrição disponível para este título.';
                    item.year = data.info.releasedate ? data.info.releasedate.split('-')[0] : (data.info.year || '');
                    item.durationSecs = data.info.duration_secs ? parseInt(data.info.duration_secs, 10) : 0;
                    item.duration = item.durationSecs ? Math.floor(item.durationSecs/60) + 'm' : (data.info.duration || '');
                    item.cast = data.info.cast || 'Desconhecido.';
                    item.genre = data.info.genre || item.groupTitle;

                    // Update Hero UI if still focused
                    if (state.focusedVodItem && state.focusedVodItem.streamId === item.streamId) {
                        document.getElementById('hero-plot').innerText = item.plot;
                        document.getElementById('hero-year').innerText = item.year;
                        document.getElementById('hero-duration').innerText = item.duration;
                        document.getElementById('hero-cast').innerText = 'Elenco: ' + item.cast;
                        document.getElementById('hero-genre').innerText = 'Gênero: ' + item.genre;
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
    container.innerHTML = '';
    
    var titleEl = document.querySelector('#view-vod-categories .sub-title');
    if (titleEl) {
        titleEl.innerText = state.vodType === 'series' ? 'Pastas de Séries' : 'Pastas de Filmes';
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
                '<div class="category-card-count">' + count + ' itens</div>' +
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

function openVodCategory(categoryName) {
    document.getElementById('selected-vod-category-title').innerText = categoryName;
    state.gridItems = state.vodCategories[categoryName] || [];
    state.gridRenderedCount = 0;
    document.getElementById('selected-vod-category-count').innerText = state.gridItems.length + ' itens';

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
        card.innerHTML = '<div class="vod-grid-title">' + item.name + '</div>';

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
    document.getElementById('series-hero-plot').innerText = seriesItem.plot || 'Acompanhe todos os episódios no HeisenIPTV.';
    document.getElementById('series-hero-cast').innerText = 'Elenco: ' + (seriesItem.cast || 'Elenco Principal');
    document.getElementById('series-hero-genre').innerText = 'Gênero: ' + (seriesItem.genre || seriesItem.groupTitle || 'Série');
    
    var coverImg = document.getElementById('series-cover-img');
    if (seriesItem.tvgLogo) {
        coverImg.src = seriesItem.tvgLogo;
        coverImg.style.display = 'block';
    } else {
        coverImg.style.display = 'none';
    }

    var tabsRow = document.getElementById('season-tabs-row');
    var grid = document.getElementById('episodes-grid');
    tabsRow.innerHTML = '<span style="color:white; font-size:18px;">Carregando temporadas...</span>';
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
                            var sName = 'Temporada ' + sNum;
                            epsData[sName] = [];
                            var epsArray = data.episodes[sNum];
                            if (Array.isArray(epsArray)) {
                                for (var e = 0; e < epsArray.length; e++) {
                                    var epObj = epsArray[e];
                                    epsData[sName].push({
                                        title: epObj.title || 'Episódio ' + (e + 1),
                                        url: parsed.domain + '/series/' + parsed.user + '/' + parsed.pass + '/' + epObj.id + '.' + epObj.container_extension
                                    });
                                }
                            }
                        }
                        
                        if (data.info) {
                            if (data.info.plot) document.getElementById('series-hero-plot').innerText = data.info.plot;
                            if (data.info.cast) document.getElementById('series-hero-cast').innerText = 'Elenco: ' + data.info.cast;
                        }
                        
                        state.seriesEpisodes = epsData;
                        buildSeasonTabs(epsData);
                    }
                })
                .catch(function(e) {
                    tabsRow.innerHTML = '<span style="color:red; font-size:18px;">Erro ao carregar episódios.</span>';
                });
            return;
        }
    }

    // Fallback for M3U series or missing Xtream API
    var episodesData = seriesItem.episodes || {
        "Temporada 1": [
            { title: "Episódio 1: Piloto", url: seriesItem.url || '' }
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
            '<span class="episode-name">' + (ep.title || 'Episódio ' + (i + 1)) + '</span>';
        
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
    document.getElementById('player-epg-now').innerText = channel.epgNow || channel.plot || 'Transmissão Ao Vivo';
    
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
    player.play(channel.url, true);
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
    if (state.currentView === 'player-view' && state.selectedCategory) {
        switchView('view-category-channels');
        focusChannelItem(state.channelIndex);
    } else if (state.currentView === 'player-view' && state.vodType) {
        switchView('view-netflix');
        var card = document.querySelector('.movie-poster-card');
        if (card) setElementFocus(card);
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
        showKeyFeedback('VOLTAR');
        handleBackKey();
        return;
    }

    // Enter / OK Keys (13)
    if (code === 13 || key === 'Enter' || key === 'Select') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback('OK');
        if (state.currentView === 'player-view') {
            if (state.currentChannel && (state.currentChannel.streamType === 'movie' || state.currentChannel.streamType === 'series')) {
                toggleVodPlayPause();
            }
            showPlayerOSD();
        } else if (state.focusedElement) {
            state.focusedElement.click();
        }
        return;
    }

    // Media Control Keys (Samsung AVPlay)
    if (code === 415 || code === 10252) { // MediaPlay / MediaPlayPause
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback('PLAY');
        if (state.currentView === 'player-view') {
            player.resume();
            document.getElementById('vod-play-icon').innerText = '▶';
            showPlayerOSD();
        }
        return;
    } else if (code === 19) { // MediaPause
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback('PAUSE');
        if (state.currentView === 'player-view') {
            player.pause();
            document.getElementById('vod-play-icon').innerText = '⏸';
            showPlayerOSD();
        }
        return;
    } else if (code === 417 || code === 10233) { // MediaFastForward
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback('AVANÇAR');
        if (state.currentView === 'player-view' && state.currentChannel && (state.currentChannel.streamType === 'movie' || state.currentChannel.streamType === 'series')) {
            handleNavigate('right');
        }
        return;
    } else if (code === 412 || code === 10232) { // MediaRewind
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback('VOLTAR');
        if (state.currentView === 'player-view' && state.currentChannel && (state.currentChannel.streamType === 'movie' || state.currentChannel.streamType === 'series')) {
            handleNavigate('left');
        }
        return;
    }

    // Directional Arrows (37: Left, 38: Up, 39: Right, 40: Down)
    if (code === 37 || key === 'ArrowLeft' || key === 'Left') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback('◄ ESQUERDA');
        handleNavigate('left');
    } else if (code === 38 || key === 'ArrowUp' || key === 'Up') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback('▲ CIMA');
        handleNavigate('up');
    } else if (code === 39 || key === 'ArrowRight' || key === 'Right') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback('► DIREITA');
        handleNavigate('right');
    } else if (code === 40 || key === 'ArrowDown' || key === 'Down') {
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback('▼ BAIXO');
        handleNavigate('down');
    } else if (code === 403) { // Red Color Key
        e.preventDefault();
        e.stopPropagation();
        showKeyFeedback('● FAVORITO');
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
    // 3: PLAYLISTS  | 4: CONFIGURAÇÕES
    var cur = state.dashIndex;

    if (dir === 'right') {
        if (cur === 0) focusDashboardItem(1);
        else if (cur === 1) focusDashboardItem(2);
        else if (cur === 3) focusDashboardItem(4);
    } else if (dir === 'left') {
        if (cur === 2) focusDashboardItem(1);
        else if (cur === 1) focusDashboardItem(0);
        else if (cur === 4) focusDashboardItem(3);
    } else if (dir === 'down') {
        if (cur === 0 || cur === 1) focusDashboardItem(3);
        else if (cur === 2) focusDashboardItem(4);
    } else if (dir === 'up') {
        if (cur === 3) focusDashboardItem(0);
        else if (cur === 4) focusDashboardItem(2);
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
    var filterBtn = document.getElementById('btn-vod-filter');
    var heroBtn = document.getElementById('btn-hero-play');
    var rows = document.querySelectorAll('.rail-row');

    if (state.focusedElement === backBtn) {
        if (dir === 'right') setElementFocus(searchInput);
        else if (dir === 'down') setElementFocus(heroBtn);
        return;
    }

    if (state.focusedElement === searchInput) {
        if (dir === 'left') setElementFocus(backBtn);
        else if (dir === 'right') setElementFocus(filterBtn);
        else if (dir === 'down') setElementFocus(heroBtn);
        return;
    }

    if (state.focusedElement === filterBtn) {
        if (dir === 'left') setElementFocus(searchInput);
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
    var cards = document.querySelectorAll('#view-vod-categories .category-card');
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
    if (state.focusedElement === backBtn) {
        return;
    }
    if (dir === 'up') {
        setElementFocus(backBtn);
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
        var first = document.querySelector('#btn-vod-filter');
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

    // VOD Filter
    var vodFilterBtn = document.getElementById('btn-vod-filter');
    if (vodFilterBtn) {
        vodFilterBtn.addEventListener('click', function() {
            renderVodCategories();
        });
    }

    // Demo Playlist
    var demoBtn = document.getElementById('btn-load-demo-playlist');
    if (demoBtn) {
        demoBtn.addEventListener('click', function() {
            loadStreams(DEMO_CHANNELS);
            showToast('Lista Demo Brasil carregada com sucesso!');
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
            showToast('Playlist desconectada com sucesso.');
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
                showToast('Preencha Servidor, Usuário e Senha.');
            }
        });
    }
}

function loadM3U(url) {
    showToast('Carregando lista M3U...');
    fetch(url)
        .then(function(r) { return r.text(); })
        .then(function(data) {
            var parsed = parseM3U(data);
            if (parsed.length > 0) {
                localStorage.setItem('flux_m3u_url', url);
                loadStreams(parsed);
                showToast(parsed.length + ' canais carregados!');
                switchView('view-dashboard');
                focusDashboardItem(0);
            } else {
                showToast('Nenhum canal encontrado.');
            }
        })
        .catch(function(err) {
            console.error(err);
            showToast('Erro ao baixar lista.');
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
            cur.groupTitle = group ? group[1] : 'Geral';
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
    showToast('Conectando ao servidor Xtream Codes...');
    if (domain.indexOf('http://') !== 0 && domain.indexOf('https://') !== 0) {
        domain = 'http://' + domain;
    }

    var authUrl = domain + '/player_api.php?username=' + user + '&password=' + pass;
    fetch(authUrl)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data && data.user_info && data.user_info.auth === 1) {
                localStorage.setItem('flux_credentials', JSON.stringify({ domain: domain, user: user, pass: pass }));
                showToast('Login Xtream realizado com sucesso!');
                
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
                        showToast(parsed.length + ' canais e filmes carregados!');
                    }
                    switchView('view-dashboard');
                    focusDashboardItem(0);
                });
            } else {
                showToast('Usuário ou senha inválidos.');
            }
        })
        .catch(function(err) {
            console.error(err);
            showToast('Erro ao autenticar no servidor.');
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
        showToast('Removido dos favoritos: ' + channel.name);
    } else {
        state.favorites.push(channel);
        showToast('Adicionado aos favoritos: ' + channel.name);
    }
    localStorage.setItem('flux_favorites', JSON.stringify(state.favorites));
    if (state.currentView === 'view-category-channels' && state.selectedCategory === '⭐ Favoritos') {
        openCategoryChannels('⭐ Favoritos');
    }
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
