---
description: Regras e conhecimento consolidado sobre a arquitetura e limitações do Flux IPTV na plataforma Samsung Tizen 4.0.
trigger: always_on
---

# Flux IPTV (Samsung Tizen Expert Knowledge)

Este documento contém o conhecimento fundamental adquirido durante o desenvolvimento do aplicativo Flux IPTV para TVs Samsung (Tizen 4.0 - Chromium 56). Leia-o sempre que for fazer manutenções, melhorias ou corrigir bugs.

## 1. Arquitetura e Stack Tecnológica
- **Linguagens:** HTML5, CSS3 e JavaScript Vanilla (ECMAScript 5/6 básico).
- **Sem Frameworks:** Não usamos React, Vue ou Angular para manter o aplicativo extremamente leve e compatível com hardwares antigos (séries NU7100, RU7100, etc).
- **Gerenciamento de Estado:** Variável global `state` dentro de `app.js` controla a View atual, o canal, a categoria e a navegação (Spatial Navigation).

## 2. Limitações de CSS no Tizen 4.0 (MUITO IMPORTANTE)
- **❌ NÃO USE `display: grid`:** O Chromium 56 da Samsung possui bugs severos no CSS Grid. Ele colapsa a altura do container e empilha os itens verticalmente, causando overflow (itens vazando por cima de outros).
- **✅ USE `display: flex` + `flex-wrap`:** Sempre substitua grids por flexbox. Calcule as colunas usando `width: calc(33.333% - 16px)`.
- **❌ NÃO USE `gap` de forma isolada:** O `gap` no flexbox falha em TVs mais antigas. 
- **✅ USE Margens:** Compense espaços usando margens negativas no container (`margin: -8px`) e margens positivas nos itens (`margin: 8px`).

## 3. Player de Vídeo (AVPlay)
- O motor principal de vídeo é o **Samsung AVPlay** (`webapis.avplay`), embutido via `<object id="avplayer" type="application/avplayer">`. A tag `<video>` é apenas um fallback de áudio/interface.
- **Bug de Tempo em VOD (00:00:00):** O AVPlay falha gravemente ao reportar o tempo atual e duração de filmes/séries IPTV (ele trava em 0 e NaN). 
- **Solução do Tempo:** Usamos um "Smart Clock" (Virtual Time) no `player.js`. Ele incrementa matematicamente o tempo da UI a cada segundo, ignorando os status quebrados do AVPlay.
- **Fast Seek (Avançar/Voltar):** Implementado no `app.js`. Há um sistema de "Combo" (Segurar botão) que acumula tempo numa variável (`fastSeekAccumulator`) e só envia o comando real de `player.seek()` 600ms após o cliente soltar o botão. **Nunca** envie comandos simultâneos para o AVPlay ou a TV sofrerá um "Black Screen" crash.

## 4. Autenticação e Rede (Firebase)
- Privilégios necessários no `config.xml`: `network.public`, `avplay`, `tv.inputdevice`.
- **MAC Address:** Obtido via `webapis.network.getMac()`. Se falhar (emulador do PC), ele gera um MAC virtual com `localStorage`.
- **Backend:** O app não envia senhas brutas. Ele entra em uma tela de Ativação (`view-activation`) e faz *polling* via `fetch()` a cada 5 segundos para o Firebase Realtime Database. Assim que o painel Web cadastra o MAC, o app detecta e carrega o Dashboard.

## 5. Teclado e Navegação Espacial
- As teclas são capturadas pelo evento global `window.addEventListener('keydown', handleRemoteKey)`.
- Há um Debounce de 110ms no topo do `handleRemoteKey` para evitar duplo clique acidental do controle remoto.
- Cada view possui sua própria função de navegação espacial manual (ex: `navigateDashboard`, `navigateSeriesDetails`). Elas calculam o próximo elemento focável baseado nas direções `up, down, left, right`.

## 6. Lembrete Operacional
Sempre que o usuário pedir para consertar um layout vazando ou botoes sobrepostos, **verifique primeiro se algum grid foi utilizado**. Sempre que o vídeo ficar tela preta ao avançar, **verifique a lógica do virtualTime e debounce do AVPlay**.
