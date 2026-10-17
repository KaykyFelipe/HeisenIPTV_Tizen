# HeisenIPTV

Player de IPTV para **Samsung Smart TV (Tizen)** com portal web de ativação e assinatura.

O aplicativo roda direto na TV, usa o decodificador nativo da Samsung e é operado inteiramente pelo controle remoto. O cliente cadastra a lista dele (Xtream Codes ou M3U), e o portal web cuida da ativação do aparelho, dos planos e dos pagamentos.

---

## Índice

- [Recursos](#recursos)
- [Telas do aplicativo](#telas-do-aplicativo)
- [Controle remoto](#controle-remoto)
- [O player](#o-player)
- [Idiomas](#idiomas)
- [Ativação, teste grátis e assinatura](#ativação-teste-grátis-e-assinatura)
- [Portal web](#portal-web)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Compilar e instalar](#compilar-e-instalar)
- [Configuração de back-end](#configuração-de-back-end)
- [Limitações conhecidas](#limitações-conhecidas)

---

## Recursos

### TV ao vivo
- Navegação por categorias do provedor
- Lista de canais com foco por controle remoto
- Favoritos: botão **vermelho** marca e desmarca, tanto na lista quanto durante a exibição
- OSD com nome do canal, logo e indicador **AO VIVO**
- Reconexão automática quando a lista trava o canal (veja [O player](#o-player))

### Filmes e Séries
- Layout em trilhas horizontais no estilo Netflix, com destaque (*hero*) no topo mostrando capa, título e sinopse
- Alternância entre **trilhas** e **grade**, com o seletor centralizado no topo
- Capas em proporção retrato (2:3), que é o formato que os provedores Xtream entregam
- Séries com tela de detalhes, temporadas e episódios
- Busca com resultado aparecendo **enquanto você digita**, sem precisar fechar o teclado da TV
- Controles de reprodução: play/pause, avanço e retrocesso, barra de progresso e tempo

### Listas
- **Xtream Codes**: servidor, usuário e senha
- **M3U**: URL da lista
- Lista de demonstração embutida, para testar o aplicativo sem provedor
- Várias listas cadastradas, com troca entre elas
- Vínculo da lista ao **MAC da TV**, o que permite cadastrar pelo portal web e a TV receber sozinha

### Informações da lista
O aplicativo mostra, sem bloquear nada, a situação da assinatura do cliente **com o provedor dele**:

| Campo | Origem |
|---|---|
| Situação | `user_info.status` da API Xtream |
| Validade | `user_info.exp_date` |
| Servidor | host configurado |
| Usuário | login da lista |
| Conexões | ativas / máximo permitido |

Quando a lista vence, o aplicativo avisa que é preciso renovar **com o provedor** — ele não tenta validar nem bloquear nada por conta própria. É o mesmo comportamento de IBO Player e IPTV Smarters.

### Configurações
- Idioma (português, espanhol, inglês)
- Formato de hora
- Motor de vídeo e buffer
- Proporção de tela
- Informações da lista
- Informações do dispositivo: modelo, sistema, MAC, chave e versão
- Desconectar a lista e limpar os dados locais

---

## Telas do aplicativo

| Tela | Descrição |
|---|---|
| Ativação | Mostra o MAC e a chave do aparelho e espera a liberação |
| Início | Blocos de TV ao Vivo, Filmes, Séries e Configurações |
| Categorias ao vivo | Pastas de canais do provedor |
| Canais | Lista da categoria escolhida |
| Filmes | Trilhas horizontais com destaque no topo |
| Pastas de VOD | Categorias de filmes e séries |
| Grade de VOD | Capas em grade, com busca |
| Detalhes da série | Sinopse, temporadas e episódios |
| Player | Vídeo em tela cheia com OSD |
| Listas | Cadastro e troca de listas |
| Configurações | Preferências e informações |

---

## Controle remoto

O aplicativo não usa o foco do navegador: ele mantém o próprio foco lógico, porque o comportamento padrão do Chromium da TV não acompanha bem a navegação por setas.

| Tecla | Código | Ação |
|---|---|---|
| Setas | 37 / 38 / 39 / 40 | Navegar |
| OK | 13 | Selecionar; em campo de texto, abre o teclado da TV |
| Voltar | 10009 / 27 | Voltar uma tela |
| Play | 415 / 10252 | Retomar |
| Pause | 19 | Pausar |
| Avançar | 417 / 10233 | Pular adiante |
| Retroceder | 412 / 10232 | Voltar |
| **Vermelho** | 403 | Favoritar canal |

Há um *debounce* de 110 ms para absorver o repique do controle remoto.

Um detalhe de usabilidade: **selecionar** um campo de busca não abre o teclado da TV, só **confirmar com OK** abre. Isso evita que o teclado cubra a tela só por você passar o foco por cima.

---

## O player

O motor principal é o **AVPlay**, API nativa da Samsung com decodificação por hardware. Em navegador de PC (para desenvolvimento) o aplicativo usa `<video>` com hls.js.

### Abertura do canal

Canais de bitrate alto exigem cuidados específicos no Tizen:

- **Buffer de partida de 4 segundos** (`setBufferingParam`). O padrão da Samsung é *"32 MB ou 10 segundos de vídeo"* — num canal UHD de 25 Mbps, esses 10 segundos são cerca de 31 MB, o que faz o canal demorar muito para aparecer.
- **Modo 4K condicional** (`SET_MODE_4K`). Só é pedido quando a TV tem painel UHD **e** o canal se identifica como UHD/4K. Reservar recursos de 4K em todo canal deixa o motor instável à toa.
- **Tempo de espera do buffer em segundos**, não em milissegundos — a API recebe segundos, e passar milissegundos aqui desliga na prática o mecanismo de escape.
- **Troca automática de formato**: se o canal não abre em `.m3u8`, o aplicativo tenta o mesmo canal em `.ts` antes de desistir. No painel Xtream o mesmo canal existe nos dois formatos.
- **Liberação correta do motor**: o AVPlay só aceita `open()` no estado `NONE`. O aplicativo sempre devolve o motor a esse estado antes de abrir o canal seguinte.

### Vigia de travamento

Em lista de IPTV é comum o servidor parar de alimentar o stream e o player ficar preso para sempre. O vigia observa três sinais e reinicia o canal sozinho, sem o usuário precisar sair e entrar de novo:

| Sinal | Limite | Observação |
|---|---|---|
| Buffer parado | 15 s | Sem nenhum progresso |
| Buffer que não completa | 40 s | Mesmo relatando progresso |
| Vídeo sem avançar | 8 s | Só depois que o relógio do motor prova que funciona |
| Erro ou fim do stream | imediato | Canal ao vivo não termina sozinho |

A reconexão usa espera crescente (1 s, 2 s, 4 s, 8 s) e para depois de **5 tentativas seguidas**, avisando o usuário. O contador zera quando o canal volta a rodar bem.

O vigia **não atua em filmes e séries**, onde pausar é legítimo.

> O relógio do AVPlay às vezes fica travado em valores fixos mesmo com o vídeo rodando. Por isso a detecção por tempo só entra em ação depois que o relógio prova, naquele aparelho e naquele canal, que de fato avança — caso contrário um canal perfeito seria reiniciado a cada 8 segundos.

---

## Idiomas

Português, espanhol e inglês — **165 chaves traduzidas em cada idioma**, cobrindo toda a interface.

A tradução é aplicada por atributos no HTML:

```html
<span class="tile-title" data-i18n="dash.filmes">FILMES</span>
<input id="vod-search-input" placeholder="Pesquisar títulos..." data-i18n-ph="vod.pesquisar">
```

Em JavaScript, pela função global `t()`, com interpolação:

```js
t('player.reconectando', { n: 2 });
// "O canal travou. Reconectando... (tentativa 2)"
```

Chave sem tradução cai para o português e, se nem isso existir, mostra a própria chave — assim uma falta aparece em vez de sumir.

Nada que venha da lista do provedor é traduzido: nome de canal, de filme e de categoria são dados, não interface.

---

## Ativação, teste grátis e assinatura

1. Ao abrir pela primeira vez, a TV mostra seu **MAC** e uma **chave**
2. O cliente entra no portal web e cadastra esse MAC
3. O aplicativo faz consultas periódicas ao banco e libera sozinho quando a ativação aparece
4. Começa um **teste grátis de 7 dias**, contados a partir do primeiro acesso
5. Terminado o teste, a tela de ativação volta até que um pagamento seja confirmado

Assinaturas pagas têm data de validade; vencida a data, o aplicativo volta à tela de ativação e passa a consultar o banco a cada 15 segundos, liberando assim que o pagamento entra.

> Essa assinatura é a do **aplicativo**. Ela não se confunde com a assinatura que o cliente tem com o provedor de IPTV dele, mostrada em *Informações da Lista*.

---

## Portal web

Disponível em **[heiseniptv.com](https://heiseniptv.com)**, hospedado no Firebase Hosting.

- **Acessar meu dispositivo** — entrada pelo MAC da TV
- **Minhas listas** — cadastrar, editar, remover e escolher a lista ativa; a TV recebe a mudança sozinha
- **Assinatura** — situação, dias restantes e planos
- **Pagamento** — checkout pelo Mercado Pago
- **Vitrine** — carrossel com telas reais do aplicativo e os diferenciais do produto

---

## Arquitetura

```
┌──────────────────┐         ┌─────────────────────┐
│  Samsung Tizen   │         │   Portal web        │
│  (aplicativo)    │         │   heiseniptv.com    │
└────────┬─────────┘         └──────────┬──────────┘
         │                              │
         │   REST (sem SDK)             │
         └──────────┬───────────────────┘
                    ▼
         ┌─────────────────────┐
         │  Firebase Realtime  │   devices/<MAC>
         │      Database       │   ├─ playlists
         └──────────┬──────────┘   ├─ isPaid / expirationDate
                    │              └─ listInfo
                    ▼
         ┌─────────────────────┐
         │  Cloud Functions    │   createCheckout
         │  (Node 22)          │   webhookMercadoPago
         └──────────┬──────────┘
                    ▼
            Mercado Pago · SMTP
```

O aplicativo da TV fala com o Firebase por **REST puro**, sem o SDK: o Chromium da Tizen é antigo e o SDK moderno não roda bem nele.

Os campos de cobrança (`isPaid`, `expirationDate`, `paymentDate`, `trialStartDate`) só podem ser escritos pelas Cloud Functions, com o Admin SDK. As regras do banco bloqueiam escrita desses campos pelo cliente.

---

## Estrutura do repositório

```
HeisenIPTVApp/          aplicativo Tizen
├── index.html          todas as telas
├── app.js              navegação, foco, estado, API Xtream, Firebase
├── player.js           motor de vídeo (AVPlay + HTML5) e vigia de travamento
├── i18n.js             traduções pt / es / en
├── style.css           interface
├── config.xml          manifesto e privilégios Tizen
├── icon.png            ícone do aplicativo
├── images/             logos
└── web-portal/         portal web (Firebase Hosting)

FluxIPTV_Functions/     Cloud Functions (checkout e webhook)
```

As pastas `FluxIPTV*` restantes e `.metadata` são do histórico e do workspace do Tizen Studio; não fazem parte do produto atual.

---

## Compilar e instalar

### Pré-requisitos

- **Tizen Studio** com a extensão de TV
- Um **perfil de assinatura** criado no Certificate Manager
- TV Samsung com **modo desenvolvedor** ligado

### Ligar o modo desenvolvedor na TV

1. Na tela de Apps, digite **12345** no controle
2. **Developer mode: ON**
3. Informe o IP do computador
4. Reinicie a TV

### Gerar o pacote

```bash
tizen build-web -e web-portal -e .firebase -e node_modules -e "*.wgt" -- HeisenIPTVApp
tizen package -t wgt -s SEU_PERFIL -- HeisenIPTVApp/.buildResult
```

O `.wgt` assinado sai em `HeisenIPTVApp/.buildResult/`.

> A pasta `web-portal` é excluída de propósito: ela é do site, não tem função dentro do pacote da TV.

### Instalar

```bash
sdb connect IP_DA_TV
tizen install -n HeisenIPTVApp.wgt -- HeisenIPTVApp/.buildResult
```

Pelo Tizen Studio: botão direito no projeto → **Run As → Tizen Web Application**. Essa rota abre junto o inspetor do Chrome, útil para acompanhar os registros.

### Diagnóstico

Toda abertura de canal imprime linhas cronometradas, visíveis no inspetor ou por `sdb dlog`:

```
[Diag +0ms]    abrindo AO VIVO: http://.../12345.m3u8
[Diag +3ms]    buffer de partida ajustado para 4s
[Diag +4ms]    timeout de buffer: 10s
[Diag +5ms]    chamando prepareAsync
[Diag +1840ms] motor PRONTO (prepare concluido)
[Diag +2310ms] buffer COMPLETO -- video deve aparecer agora
```

Dá para ver de imediato se o tempo foi gasto no `prepare` ou no buffer, e quais ajustes o firmware aceitou.

---

## Configuração de back-end

### Cloud Functions

Variáveis de ambiente necessárias:

| Variável | Uso |
|---|---|
| `MP_ACCESS_TOKEN` | Token do Mercado Pago |
| `EMAIL_USER` | Conta SMTP de envio |
| `EMAIL_PASS` | Senha dessa conta |

```bash
cd FluxIPTV_Functions
npm install
firebase deploy --only functions
```

### Hosting

```bash
firebase deploy --only hosting
```

### Regras do banco

Ficam em [`HeisenIPTVApp/database.rules.json`](HeisenIPTVApp/database.rules.json) e sobem com:

```bash
firebase deploy --only database
```

Duas decisões importantes estão registradas nelas:

**Permissão cascateia e não pode ser revogada.** No Realtime Database, um `.write` concedido num nó vale para tudo abaixo, e nenhum filho consegue negar o que o pai liberou. Por isso `devices/$mac` **não** concede escrita: cada campo gravável concede a sua, individualmente. O que não está listado — `expirationDate` e `paymentDate` — só o Admin SDK escreve. `isPaid` e `trialStartDate` podem ser criados uma vez e nunca alterados, o que impede se autoliberar como pago ou reiniciar o teste grátis.

**O identificador é o MAC, e MAC não é senha.** O aplicativo e o portal leem o próprio registro sem autenticar, usando o endereço MAC da TV como chave. Isso mantém a experiência simples — o cliente digita o MAC no site e a TV recebe a lista sozinha — mas significa que quem souber o MAC de uma TV consegue ler as credenciais daquele cliente. As regras impedem **listar** a base inteira, o que elimina a varredura em massa, porém não resolvem o problema de fundo.

A solução correta é autenticação com token (Firebase Anonymous Auth ou um proxy em Cloud Function). Até que isso exista, a limitação está declarada na [Política de Privacidade](https://heiseniptv.com/privacidade) em vez de ficar escondida.

### Documentos legais

[Política de Privacidade](https://heiseniptv.com/privacidade) e [Termos de Uso](https://heiseniptv.com/termos) são páginas do portal (`web-portal/privacidade.html` e `web-portal/termos.html`), referenciadas nas Configurações do aplicativo.

---

## Limitações conhecidas

- **Chromium 56.** A TV roda um motor antigo: `scrollIntoView({block:'nearest'})` é ignorado, `-webkit-line-clamp` é descartado silenciosamente em itens flex, e `transparent` em gradiente aparece como preto transparente. O código contorna cada um desses casos, e vale conferir antes de adotar CSS mais novo.
- **Banda do canal.** Os ajustes de buffer fazem o canal UHD *começar* mais rápido, mas se o stream tem mais bitrate do que a conexão entrega, ele vai travar de novo. Cabo resolve boa parte dos casos de UHD.
- **Codec.** Nem todo modelo decodifica HEVC em 4K. Nesse caso o registro mostra `prepare FALHOU: NotSupportedError`, e nenhum ajuste de buffer resolve.

---

<p align="center">
  <strong>HeisenIPTV</strong> · <a href="https://heiseniptv.com">heiseniptv.com</a>
</p>
