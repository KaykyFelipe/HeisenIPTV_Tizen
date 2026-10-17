/**
 * HEISENIPTV - TRADUÇÕES (pt / es / en)
 *
 * Como usar:
 *   - HTML estático: <span data-i18n="chave">texto</span>
 *                    <input data-i18n-ph="chave">  (placeholder)
 *   - JavaScript   : t('chave')  ou  t('chave', { n: 10 })
 *
 * O que NÃO é traduzido: nomes de canais, títulos de filmes, sinopses e
 * categorias. Isso vem da lista do provedor, não do app.
 */

var I18N = {
    lang: 'pt',

    dict: {

        /* ================================ PORTUGUÊS =========================== */
        pt: {
            'idioma.nome': 'Português',

            /* --- player --- */
            'player.carregando': 'Carregando stream...',
            'player.conectando': 'Conectando ao canal...',
            'player.buffer': 'Carregando buffer...',
            'player.buffer_pct': 'Buffer {n}%...',
            'player.erro_titulo': 'Erro de Reprodução',
            'player.erro_msg': 'Não foi possível carregar o fluxo de vídeo.',
            'player.sinal_off': 'Sinal temporariamente indisponível.',
            'player.sinal_off_cod': 'Sinal temporariamente indisponível ({cod}).',
            'player.reconectando': 'O canal travou. Reconectando... (tentativa {n})',
            'player.sem_sinal': 'Não foi possível manter este canal no ar. Tente outro canal ou fale com o seu provedor.',
            'player.canal_ao_vivo': 'Canal Ao Vivo',
            'player.ao_vivo': 'AO VIVO',
            'player.agora': 'AGORA:',
            'player.transmissao': 'Transmissão Ao Vivo',
            'player.trocar_canal': 'Trocar Canal',
            'player.fechar': 'Fechar Player',
            'player.favorito': 'Favorito',
            'player.play_pause': 'Play/Pause',
            'player.voltar_avancar': 'Voltar / Avançar',

            /* --- teclas do controle --- */
            'tecla.ok': 'OK',
            'tecla.voltar': 'VOLTAR',
            'tecla.play': 'PLAY',
            'tecla.pause': 'PAUSE',
            'tecla.avancar': 'AVANÇAR',
            'tecla.esquerda': '◄ ESQUERDA',
            'tecla.cima': '▲ CIMA',
            'tecla.direita': '► DIREITA',
            'tecla.baixo': '▼ BAIXO',
            'tecla.favorito': '● FAVORITO',

            /* --- ativação --- */
            'ativacao.titulo': 'Ative seu dispositivo',
            'ativacao.instrucao': 'Seu dispositivo não possui uma lista ativa. Para continuar, acesse nosso portal no celular ou computador e vincule sua conta usando os dados abaixo:',
            'ativacao.site': 'Site:',
            'ativacao.mac': 'Device MAC:',
            'ativacao.key': 'Device Key:',
            'ativacao.aguardando': 'Aguardando ativação... a tela atualizará automaticamente.',
            'ativacao.expirada': 'Licença Expirada',
            'ativacao.expirada_msg': 'Seu período de teste de 7 dias acabou.<br><br>Acesse nosso portal no celular ou computador para adquirir a licença (Anual ou Vitalícia) e liberar seu acesso:',
            'ativacao.desconectado': 'Desconectado',
            'ativacao.desconectado_msg': 'Acesse o portal e ative este dispositivo novamente.',
            'ativacao.carregando': 'CARREGANDO...',

            /* --- tela inicial --- */
            'dash.tv': 'TV AO VIVO',
            'dash.filmes': 'FILMES',
            'dash.series': 'SÉRIES',
            'dash.config': 'CONFIGURAÇÕES',
            'dash.usuario': 'Usuário logado',
            'dash.exp_ilimitado': 'Expiração: Ilimitado',
            'dash.exp_data': 'Expiração: {d}',
            'dash.exp_vitalicia': 'Expiração: Vitalícia',
            'dash.exp_teste': 'Expiração: {n} dias (Teste)',

            /* --- navegação --- */
            'nav.inicio': '← Início',
            'nav.categorias': '← Categorias',
            'nav.filmes_series': '← Filmes/Séries',
            'nav.pastas': '← Pastas',
            'nav.series': '← Séries',

            /* --- TV ao vivo --- */
            'live.titulo': 'TV Ao Vivo',
            'live.pesquisar': 'Pesquisar canais...',
            'live.canais': 'Canais',
            'live.itens': '{n} itens',
            'live.n_canais': '{n} canais',
            'live.favoritos': '⭐ Favoritos',
            'live.geral': 'Geral',

            /* --- filmes e séries --- */
            'vod.pesquisar': 'Pesquisar títulos...',
            'vod.destaques': 'Destaques',
            'vod.destaques_ic': '▦ Destaques',
            'vod.por_categoria_ic': '🗂 Por Categoria',
            'vod.por_categoria': 'Por Categoria',
            'vod.original': 'HeisenIPTV ORIGINAL',
            'vod.relevante': '98% Relevante',
            'vod.assistir': '▶ Assistir Agora',
            'vod.pastas_filmes': 'Pastas de Filmes',
            'vod.pastas_series': 'Pastas de Séries',
            'vod.elenco': 'Elenco: {v}',
            'vod.genero': 'Gênero: {v}',
            'vod.buscando_info': 'Buscando informações do filme...',
            'vod.sem_descricao': 'Nenhuma descrição disponível para este título.',
            'vod.desconhecido': 'Desconhecido.',
            'vod.filmes_destaque': 'Filmes em Destaque',
            'vod.series_populares': 'Séries Populares',
            'vod.resultado': '{n} resultado para "{q}"',
            'vod.resultados': '{n} resultados para "{q}"',
            'vod.primeiros': ' (mostrando os primeiros)',
            'vod.nada_encontrado': 'Nenhum título encontrado para "{q}"',

            /* --- séries --- */
            'serie.carregando_temporadas': 'Carregando temporadas...',
            'serie.erro_episodios': 'Erro ao carregar episódios.',
            'serie.temporada': 'Temporada {n}',
            'serie.episodio': 'Episódio {n}',
            'serie.piloto': 'Episódio 1: Piloto',
            'serie.acompanhe': 'Acompanhe todos os episódios no HeisenIPTV.',
            'serie.elenco_principal': 'Elenco Principal',
            'serie.rotulo': 'Série',

            /* --- listas --- */
            'listas.titulo': 'Gerenciar Listas IPTV',
            'listas.status_conexao': 'Status da Conexão',
            'listas.ativa': 'Playlist Ativa:',
            'listas.mac_tv': 'Endereço MAC da TV:',
            'listas.desconectar': '❌ Desconectar / Limpar Lista',
            'listas.add_m3u': 'Adicionar Lista M3U',
            'listas.nome': 'Nome da Lista:',
            'listas.url_m3u': 'URL M3U / M3U8:',
            'listas.ph_nome': 'Ex: Minha Lista',
            'listas.btn_m3u': '📥 Carregar Lista M3U',
            'listas.btn_demo': '✨ Carregar Lista Demo (Brasil)',
            'listas.xtream': 'Conectar via Xtream Codes',
            'listas.url_servidor': 'URL do Servidor (com porta):',
            'listas.usuario': 'Usuário:',
            'listas.senha': 'Senha:',
            'listas.ph_usuario': 'usuario',
            'listas.btn_xtream': '🔐 Conectar Servidor Xtream',

            /* --- configurações --- */
            'config.titulo': 'Configurações',
            'config.idioma': 'Idioma',
            'config.geral': 'Geral & Player',
            'config.formato_hora': 'Formato de Horário',
            'config.formato_hora_v': '24 Horas (24h)',
            'config.engine': 'Engine de Vídeo',
            'config.engine_v': 'Samsung AVPlay Hardware (Nativo)',
            'config.buffer': 'Buffer de Inicialização',
            'config.buffer_v': 'Baixa Latência (Ultra-Fast)',
            'config.proporcao': 'Proporção de Tela',
            'config.proporcao_v': '16:9 Automático',
            'config.info_lista': 'Informações da Lista',
            'config.situacao': 'Situação no provedor:',
            'config.validade': 'Validade da lista:',
            'config.servidor': 'Servidor:',
            'config.usuario': 'Usuário:',
            'config.conexoes': 'Conexões em uso:',
            'config.info_disp': 'Informações do Dispositivo',
            'config.dispositivo': 'Dispositivo:',
            'config.so': 'Sistema Operacional:',
            'config.mac': 'MAC Address:',
            'config.key': 'Device Key (Chave):',
            'config.versao': 'Versão do HeisenIPTV:',
            'config.privacidade': 'Política de Privacidade e Termos:',
            'config.gerenciamento': 'Gerenciamento',
            'config.desconectar': 'Desconectar Lista Atual',
            'config.desconectar_desc': 'Apaga os dados atuais e volta para a tela de ativação.',
            'config.btn_limpar': '🛑 Limpar Dados e Desconectar',

            /* --- situação da lista no provedor --- */
            'lista.ok': 'Ativa',
            'lista.expired': 'Vencida',
            'lista.blocked': 'Bloqueada',
            'lista.auth': 'Acesso recusado',
            'lista.empty': 'Sem conteúdo',
            'lista.none': 'Nenhuma lista',
            'lista.nao_informada': 'Não informada',
            'lista.nao_informada_m3u': 'Não informada (lista M3U)',
            'lista.msg_expired': 'Sua lista venceu em {d}. Renove com o seu provedor para voltar a assistir.',
            'lista.msg_expired_sd': 'Sua lista venceu. Renove com o seu provedor para voltar a assistir.',
            'lista.msg_blocked': 'Sua lista está bloqueada pelo provedor ({s}). Fale com quem vendeu a lista para você.',
            'lista.msg_auth': 'O provedor não aceitou o usuário e a senha da sua lista. Confira os dados no portal ou fale com o seu provedor.',
            'lista.msg_empty': 'O provedor aceitou o seu acesso, mas não enviou nenhum canal. Fale com o seu provedor.',
            'lista.msg_none': 'Nenhuma lista foi carregada neste aparelho.',
            'lista.vazio_inativa': 'Sua lista não está ativa',
            'lista.vazio_nada': 'Nada para mostrar aqui',

            /* --- avisos --- */
            'toast.demo_ok': 'Lista Demo Brasil carregada com sucesso!',
            'toast.desconectada': 'Playlist desconectada com sucesso.',
            'toast.preencha_xtream': 'Preencha Servidor, Usuário e Senha.',
            'toast.dados_apagados': 'Dados locais apagados.',
            'toast.carregando_m3u': 'Carregando lista M3U...',
            'toast.canais_ok': '{n} canais carregados!',
            'toast.erro_baixar': 'Não foi possível baixar a lista. Verifique o link com o seu provedor.',
            'toast.conectando_xtream': 'Conectando ao servidor Xtream Codes...',
            'toast.login_ok': 'Login Xtream realizado com sucesso!',
            'toast.tudo_ok': '{n} canais e filmes carregados!',
            'toast.erro_auth': 'Erro ao autenticar no servidor.',
            'toast.fav_add': 'Adicionado aos favoritos: {v}',
            'toast.fav_rem': 'Removido dos favoritos: {v}',
            'toast.trial': 'Você está no período de testes. Restam {n} dias.'
        },

        /* ================================= ESPAÑOL ============================ */
        es: {
            'idioma.nome': 'Español',

            'player.carregando': 'Cargando transmisión...',
            'player.conectando': 'Conectando al canal...',
            'player.buffer': 'Cargando búfer...',
            'player.buffer_pct': 'Búfer {n}%...',
            'player.erro_titulo': 'Error de Reproducción',
            'player.erro_msg': 'No se pudo cargar el flujo de video.',
            'player.sinal_off': 'Señal temporalmente no disponible.',
            'player.sinal_off_cod': 'Señal temporalmente no disponible ({cod}).',
            'player.reconectando': 'El canal se congeló. Reconectando... (intento {n})',
            'player.sem_sinal': 'No se pudo mantener este canal en el aire. Prueba otro canal o habla con tu proveedor.',
            'player.canal_ao_vivo': 'Canal en Vivo',
            'player.ao_vivo': 'EN VIVO',
            'player.agora': 'AHORA:',
            'player.transmissao': 'Transmisión en Vivo',
            'player.trocar_canal': 'Cambiar Canal',
            'player.fechar': 'Cerrar Reproductor',
            'player.favorito': 'Favorito',
            'player.play_pause': 'Reproducir/Pausar',
            'player.voltar_avancar': 'Retroceder / Avanzar',

            'tecla.ok': 'OK',
            'tecla.voltar': 'ATRÁS',
            'tecla.play': 'REPRODUCIR',
            'tecla.pause': 'PAUSA',
            'tecla.avancar': 'AVANZAR',
            'tecla.esquerda': '◄ IZQUIERDA',
            'tecla.cima': '▲ ARRIBA',
            'tecla.direita': '► DERECHA',
            'tecla.baixo': '▼ ABAJO',
            'tecla.favorito': '● FAVORITO',

            'ativacao.titulo': 'Activa tu dispositivo',
            'ativacao.instrucao': 'Tu dispositivo no tiene una lista activa. Para continuar, entra en nuestro portal desde el móvil o el ordenador y vincula tu cuenta con los datos de abajo:',
            'ativacao.site': 'Sitio:',
            'ativacao.mac': 'MAC del Dispositivo:',
            'ativacao.key': 'Clave del Dispositivo:',
            'ativacao.aguardando': 'Esperando activación... la pantalla se actualizará automáticamente.',
            'ativacao.expirada': 'Licencia Vencida',
            'ativacao.expirada_msg': 'Tu período de prueba de 7 días terminó.<br><br>Entra en nuestro portal desde el móvil o el ordenador para adquirir la licencia (Anual o De por vida) y liberar tu acceso:',
            'ativacao.desconectado': 'Desconectado',
            'ativacao.desconectado_msg': 'Entra en el portal y activa este dispositivo de nuevo.',
            'ativacao.carregando': 'CARGANDO...',

            'dash.tv': 'TV EN VIVO',
            'dash.filmes': 'PELÍCULAS',
            'dash.series': 'SERIES',
            'dash.config': 'AJUSTES',
            'dash.usuario': 'Usuario conectado',
            'dash.exp_ilimitado': 'Vencimiento: Ilimitado',
            'dash.exp_data': 'Vencimiento: {d}',
            'dash.exp_vitalicia': 'Vencimiento: De por vida',
            'dash.exp_teste': 'Vencimiento: {n} días (Prueba)',

            'nav.inicio': '← Inicio',
            'nav.categorias': '← Categorías',
            'nav.filmes_series': '← Películas/Series',
            'nav.pastas': '← Carpetas',
            'nav.series': '← Series',

            'live.titulo': 'TV en Vivo',
            'live.pesquisar': 'Buscar canales...',
            'live.canais': 'Canales',
            'live.itens': '{n} elementos',
            'live.n_canais': '{n} canales',
            'live.favoritos': '⭐ Favoritos',
            'live.geral': 'General',

            'vod.pesquisar': 'Buscar títulos...',
            'vod.destaques': 'Destacados',
            'vod.destaques_ic': '▦ Destacados',
            'vod.por_categoria_ic': '🗂 Por Categoría',
            'vod.por_categoria': 'Por Categoría',
            'vod.original': 'HeisenIPTV ORIGINAL',
            'vod.relevante': '98% Relevante',
            'vod.assistir': '▶ Ver Ahora',
            'vod.pastas_filmes': 'Carpetas de Películas',
            'vod.pastas_series': 'Carpetas de Series',
            'vod.elenco': 'Reparto: {v}',
            'vod.genero': 'Género: {v}',
            'vod.buscando_info': 'Buscando información de la película...',
            'vod.sem_descricao': 'No hay descripción disponible para este título.',
            'vod.desconhecido': 'Desconocido.',
            'vod.filmes_destaque': 'Películas Destacadas',
            'vod.series_populares': 'Series Populares',
            'vod.resultado': '{n} resultado para "{q}"',
            'vod.resultados': '{n} resultados para "{q}"',
            'vod.primeiros': ' (mostrando los primeros)',
            'vod.nada_encontrado': 'No se encontró ningún título para "{q}"',

            'serie.carregando_temporadas': 'Cargando temporadas...',
            'serie.erro_episodios': 'Error al cargar los episodios.',
            'serie.temporada': 'Temporada {n}',
            'serie.episodio': 'Episodio {n}',
            'serie.piloto': 'Episodio 1: Piloto',
            'serie.acompanhe': 'Mira todos los episodios en HeisenIPTV.',
            'serie.elenco_principal': 'Reparto Principal',
            'serie.rotulo': 'Serie',

            'listas.titulo': 'Gestionar Listas IPTV',
            'listas.status_conexao': 'Estado de la Conexión',
            'listas.ativa': 'Lista Activa:',
            'listas.mac_tv': 'Dirección MAC del TV:',
            'listas.desconectar': '❌ Desconectar / Borrar Lista',
            'listas.add_m3u': 'Añadir Lista M3U',
            'listas.nome': 'Nombre de la Lista:',
            'listas.url_m3u': 'URL M3U / M3U8:',
            'listas.ph_nome': 'Ej: Mi Lista',
            'listas.btn_m3u': '📥 Cargar Lista M3U',
            'listas.btn_demo': '✨ Cargar Lista Demo (Brasil)',
            'listas.xtream': 'Conectar con Xtream Codes',
            'listas.url_servidor': 'URL del Servidor (con puerto):',
            'listas.usuario': 'Usuario:',
            'listas.senha': 'Contraseña:',
            'listas.ph_usuario': 'usuario',
            'listas.btn_xtream': '🔐 Conectar Servidor Xtream',

            'config.titulo': 'Ajustes',
            'config.idioma': 'Idioma',
            'config.geral': 'General y Reproductor',
            'config.formato_hora': 'Formato de Hora',
            'config.formato_hora_v': '24 Horas (24h)',
            'config.engine': 'Motor de Video',
            'config.engine_v': 'Samsung AVPlay Hardware (Nativo)',
            'config.buffer': 'Búfer de Inicio',
            'config.buffer_v': 'Baja Latencia (Ultra-Fast)',
            'config.proporcao': 'Proporción de Pantalla',
            'config.proporcao_v': '16:9 Automático',
            'config.info_lista': 'Información de la Lista',
            'config.situacao': 'Estado en el proveedor:',
            'config.validade': 'Vigencia de la lista:',
            'config.servidor': 'Servidor:',
            'config.usuario': 'Usuario:',
            'config.conexoes': 'Conexiones en uso:',
            'config.info_disp': 'Información del Dispositivo',
            'config.dispositivo': 'Dispositivo:',
            'config.so': 'Sistema Operativo:',
            'config.mac': 'Dirección MAC:',
            'config.key': 'Clave del Dispositivo:',
            'config.versao': 'Versión de HeisenIPTV:',
            'config.privacidade': 'Política de Privacidad y Términos:',
            'config.gerenciamento': 'Administración',
            'config.desconectar': 'Desconectar Lista Actual',
            'config.desconectar_desc': 'Borra los datos actuales y vuelve a la pantalla de activación.',
            'config.btn_limpar': '🛑 Borrar Datos y Desconectar',

            'lista.ok': 'Activa',
            'lista.expired': 'Vencida',
            'lista.blocked': 'Bloqueada',
            'lista.auth': 'Acceso rechazado',
            'lista.empty': 'Sin contenido',
            'lista.none': 'Ninguna lista',
            'lista.nao_informada': 'No informada',
            'lista.nao_informada_m3u': 'No informada (lista M3U)',
            'lista.msg_expired': 'Tu lista venció el {d}. Renuévala con tu proveedor para volver a ver.',
            'lista.msg_expired_sd': 'Tu lista venció. Renuévala con tu proveedor para volver a ver.',
            'lista.msg_blocked': 'Tu lista está bloqueada por el proveedor ({s}). Habla con quien te vendió la lista.',
            'lista.msg_auth': 'El proveedor no aceptó el usuario y la contraseña de tu lista. Revisa los datos en el portal o habla con tu proveedor.',
            'lista.msg_empty': 'El proveedor aceptó tu acceso, pero no envió ningún canal. Habla con tu proveedor.',
            'lista.msg_none': 'No se cargó ninguna lista en este aparato.',
            'lista.vazio_inativa': 'Tu lista no está activa',
            'lista.vazio_nada': 'Nada que mostrar aquí',

            'toast.demo_ok': '¡Lista Demo Brasil cargada con éxito!',
            'toast.desconectada': 'Lista desconectada con éxito.',
            'toast.preencha_xtream': 'Completa Servidor, Usuario y Contraseña.',
            'toast.dados_apagados': 'Datos locales borrados.',
            'toast.carregando_m3u': 'Cargando lista M3U...',
            'toast.canais_ok': '¡{n} canales cargados!',
            'toast.erro_baixar': 'No se pudo descargar la lista. Revisa el enlace con tu proveedor.',
            'toast.conectando_xtream': 'Conectando al servidor Xtream Codes...',
            'toast.login_ok': '¡Sesión Xtream iniciada con éxito!',
            'toast.tudo_ok': '¡{n} canales y películas cargados!',
            'toast.erro_auth': 'Error al autenticar en el servidor.',
            'toast.fav_add': 'Añadido a favoritos: {v}',
            'toast.fav_rem': 'Quitado de favoritos: {v}',
            'toast.trial': 'Estás en el período de prueba. Quedan {n} días.'
        },

        /* ================================= ENGLISH ============================ */
        en: {
            'idioma.nome': 'English',

            'player.carregando': 'Loading stream...',
            'player.conectando': 'Connecting to channel...',
            'player.buffer': 'Buffering...',
            'player.buffer_pct': 'Buffer {n}%...',
            'player.erro_titulo': 'Playback Error',
            'player.erro_msg': 'The video stream could not be loaded.',
            'player.sinal_off': 'Signal temporarily unavailable.',
            'player.sinal_off_cod': 'Signal temporarily unavailable ({cod}).',
            'player.reconectando': 'The channel froze. Reconnecting... (attempt {n})',
            'player.sem_sinal': 'This channel could not be kept running. Try another channel or contact your provider.',
            'player.canal_ao_vivo': 'Live Channel',
            'player.ao_vivo': 'LIVE',
            'player.agora': 'NOW:',
            'player.transmissao': 'Live Broadcast',
            'player.trocar_canal': 'Change Channel',
            'player.fechar': 'Close Player',
            'player.favorito': 'Favorite',
            'player.play_pause': 'Play/Pause',
            'player.voltar_avancar': 'Rewind / Forward',

            'tecla.ok': 'OK',
            'tecla.voltar': 'BACK',
            'tecla.play': 'PLAY',
            'tecla.pause': 'PAUSE',
            'tecla.avancar': 'FORWARD',
            'tecla.esquerda': '◄ LEFT',
            'tecla.cima': '▲ UP',
            'tecla.direita': '► RIGHT',
            'tecla.baixo': '▼ DOWN',
            'tecla.favorito': '● FAVORITE',

            'ativacao.titulo': 'Activate your device',
            'ativacao.instrucao': 'Your device has no active playlist. To continue, open our portal on your phone or computer and link your account using the details below:',
            'ativacao.site': 'Website:',
            'ativacao.mac': 'Device MAC:',
            'ativacao.key': 'Device Key:',
            'ativacao.aguardando': 'Waiting for activation... the screen will refresh automatically.',
            'ativacao.expirada': 'License Expired',
            'ativacao.expirada_msg': 'Your 7-day trial has ended.<br><br>Open our portal on your phone or computer to buy a license (Yearly or Lifetime) and unlock your access:',
            'ativacao.desconectado': 'Disconnected',
            'ativacao.desconectado_msg': 'Open the portal and activate this device again.',
            'ativacao.carregando': 'LOADING...',

            'dash.tv': 'LIVE TV',
            'dash.filmes': 'MOVIES',
            'dash.series': 'SERIES',
            'dash.config': 'SETTINGS',
            'dash.usuario': 'Signed in',
            'dash.exp_ilimitado': 'Expires: Never',
            'dash.exp_data': 'Expires: {d}',
            'dash.exp_vitalicia': 'Expires: Lifetime',
            'dash.exp_teste': 'Expires: {n} days (Trial)',

            'nav.inicio': '← Home',
            'nav.categorias': '← Categories',
            'nav.filmes_series': '← Movies/Series',
            'nav.pastas': '← Folders',
            'nav.series': '← Series',

            'live.titulo': 'Live TV',
            'live.pesquisar': 'Search channels...',
            'live.canais': 'Channels',
            'live.itens': '{n} items',
            'live.n_canais': '{n} channels',
            'live.favoritos': '⭐ Favorites',
            'live.geral': 'General',

            'vod.pesquisar': 'Search titles...',
            'vod.destaques': 'Featured',
            'vod.destaques_ic': '▦ Featured',
            'vod.por_categoria_ic': '🗂 By Category',
            'vod.por_categoria': 'By Category',
            'vod.original': 'HeisenIPTV ORIGINAL',
            'vod.relevante': '98% Match',
            'vod.assistir': '▶ Watch Now',
            'vod.pastas_filmes': 'Movie Folders',
            'vod.pastas_series': 'Series Folders',
            'vod.elenco': 'Cast: {v}',
            'vod.genero': 'Genre: {v}',
            'vod.buscando_info': 'Fetching movie details...',
            'vod.sem_descricao': 'No description available for this title.',
            'vod.desconhecido': 'Unknown.',
            'vod.filmes_destaque': 'Featured Movies',
            'vod.series_populares': 'Popular Series',
            'vod.resultado': '{n} result for "{q}"',
            'vod.resultados': '{n} results for "{q}"',
            'vod.primeiros': ' (showing the first ones)',
            'vod.nada_encontrado': 'No titles found for "{q}"',

            'serie.carregando_temporadas': 'Loading seasons...',
            'serie.erro_episodios': 'Could not load the episodes.',
            'serie.temporada': 'Season {n}',
            'serie.episodio': 'Episode {n}',
            'serie.piloto': 'Episode 1: Pilot',
            'serie.acompanhe': 'Watch every episode on HeisenIPTV.',
            'serie.elenco_principal': 'Main Cast',
            'serie.rotulo': 'Series',

            'listas.titulo': 'Manage IPTV Playlists',
            'listas.status_conexao': 'Connection Status',
            'listas.ativa': 'Active Playlist:',
            'listas.mac_tv': 'TV MAC Address:',
            'listas.desconectar': '❌ Disconnect / Clear Playlist',
            'listas.add_m3u': 'Add M3U Playlist',
            'listas.nome': 'Playlist Name:',
            'listas.url_m3u': 'M3U / M3U8 URL:',
            'listas.ph_nome': 'e.g. My Playlist',
            'listas.btn_m3u': '📥 Load M3U Playlist',
            'listas.btn_demo': '✨ Load Demo Playlist (Brazil)',
            'listas.xtream': 'Connect via Xtream Codes',
            'listas.url_servidor': 'Server URL (with port):',
            'listas.usuario': 'Username:',
            'listas.senha': 'Password:',
            'listas.ph_usuario': 'username',
            'listas.btn_xtream': '🔐 Connect Xtream Server',

            'config.titulo': 'Settings',
            'config.idioma': 'Language',
            'config.geral': 'General & Player',
            'config.formato_hora': 'Time Format',
            'config.formato_hora_v': '24 Hours (24h)',
            'config.engine': 'Video Engine',
            'config.engine_v': 'Samsung AVPlay Hardware (Native)',
            'config.buffer': 'Startup Buffer',
            'config.buffer_v': 'Low Latency (Ultra-Fast)',
            'config.proporcao': 'Aspect Ratio',
            'config.proporcao_v': '16:9 Automatic',
            'config.info_lista': 'Playlist Information',
            'config.situacao': 'Provider status:',
            'config.validade': 'Playlist expiry:',
            'config.servidor': 'Server:',
            'config.usuario': 'Username:',
            'config.conexoes': 'Connections in use:',
            'config.info_disp': 'Device Information',
            'config.dispositivo': 'Device:',
            'config.so': 'Operating System:',
            'config.mac': 'MAC Address:',
            'config.key': 'Device Key:',
            'config.versao': 'HeisenIPTV Version:',
            'config.privacidade': 'Privacy Policy and Terms:',
            'config.gerenciamento': 'Management',
            'config.desconectar': 'Disconnect Current Playlist',
            'config.desconectar_desc': 'Erases the current data and returns to the activation screen.',
            'config.btn_limpar': '🛑 Clear Data and Disconnect',

            'lista.ok': 'Active',
            'lista.expired': 'Expired',
            'lista.blocked': 'Blocked',
            'lista.auth': 'Access denied',
            'lista.empty': 'No content',
            'lista.none': 'No playlist',
            'lista.nao_informada': 'Not provided',
            'lista.nao_informada_m3u': 'Not provided (M3U playlist)',
            'lista.msg_expired': 'Your playlist expired on {d}. Renew it with your provider to watch again.',
            'lista.msg_expired_sd': 'Your playlist expired. Renew it with your provider to watch again.',
            'lista.msg_blocked': 'Your playlist is blocked by the provider ({s}). Contact whoever sold it to you.',
            'lista.msg_auth': 'The provider rejected your playlist username and password. Check the details in the portal or contact your provider.',
            'lista.msg_empty': 'The provider accepted your access but sent no channels. Contact your provider.',
            'lista.msg_none': 'No playlist has been loaded on this device.',
            'lista.vazio_inativa': 'Your playlist is not active',
            'lista.vazio_nada': 'Nothing to show here',

            'toast.demo_ok': 'Demo playlist (Brazil) loaded successfully!',
            'toast.desconectada': 'Playlist disconnected successfully.',
            'toast.preencha_xtream': 'Fill in Server, Username and Password.',
            'toast.dados_apagados': 'Local data erased.',
            'toast.carregando_m3u': 'Loading M3U playlist...',
            'toast.canais_ok': '{n} channels loaded!',
            'toast.erro_baixar': 'Could not download the playlist. Check the link with your provider.',
            'toast.conectando_xtream': 'Connecting to the Xtream Codes server...',
            'toast.login_ok': 'Xtream login successful!',
            'toast.tudo_ok': '{n} channels and movies loaded!',
            'toast.erro_auth': 'Could not authenticate with the server.',
            'toast.fav_add': 'Added to favorites: {v}',
            'toast.fav_rem': 'Removed from favorites: {v}',
            'toast.trial': 'You are on the trial period. {n} days left.'
        }
    },

    /** Idiomas oferecidos na tela de Configurações, nesta ordem. */
    disponiveis: ['pt', 'es', 'en'],

    /** Busca a frase e troca os {marcadores}. Chave perdida cai no português. */
    t: function (chave, vars) {
        var tabela = this.dict[this.lang] || this.dict.pt;
        var texto = tabela[chave];
        if (texto === undefined) texto = this.dict.pt[chave];
        if (texto === undefined) return chave;   // deixa a chave à mostra: erro visível
        if (vars) {
            for (var k in vars) {
                if (vars.hasOwnProperty(k)) {
                    texto = texto.split('{' + k + '}').join(vars[k]);
                }
            }
        }
        return texto;
    },

    /** Aplica as traduções em tudo que estiver marcado no HTML. */
    apply: function () {
        var els = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
            els[i].innerText = this.t(els[i].getAttribute('data-i18n'));
        }
        var phs = document.querySelectorAll('[data-i18n-ph]');
        for (var p = 0; p < phs.length; p++) {
            phs[p].setAttribute('placeholder', this.t(phs[p].getAttribute('data-i18n-ph')));
        }
        document.documentElement.setAttribute('lang', this.lang);
    },

    /** Troca o idioma e salva a escolha no aparelho. */
    set: function (lang) {
        if (this.disponiveis.indexOf(lang) === -1) lang = 'pt';
        this.lang = lang;
        try { localStorage.setItem('flux_lang', lang); } catch (e) {}
        this.apply();
    },

    /** Lê a escolha salva na abertura do app. */
    init: function () {
        var salvo = null;
        try { salvo = localStorage.getItem('flux_lang'); } catch (e) {}
        this.lang = (salvo && this.disponiveis.indexOf(salvo) !== -1) ? salvo : 'pt';
    }
};

/** Atalho global. */
function t(chave, vars) {
    return I18N.t(chave, vars);
}

I18N.init();
