# Submissão ao Samsung TV Seller Office

Material para preencher o cadastro do aplicativo. Copie os blocos marcados
direto para os campos correspondentes do portal.

---

## Informações de teste para o avaliador

> **Este é o campo mais importante da submissão.** A causa de reprovação mais
> citada pela Samsung é o avaliador não conseguir usar o aplicativo.

Cole no campo de *verification information* / informações de teste:

```
O aplicativo NÃO exige conta, login ou credenciais para ser avaliado.

Na primeira abertura aparece a tela de ativação. Nela existe o botão
"Conhecer o app com a lista de demonstração" (já em foco, basta pressionar OK).
Ele abre o aplicativo completo com uma lista de demonstração embutida.

Todo o conteúdo dessa demonstração é de licença aberta:
- NASA TV, transmissão ao vivo de domínio público do governo dos EUA
- Big Buck Bunny, Sintel, Tears of Steel e Elephants Dream, curtas da
  Blender Foundation sob licença Creative Commons

A partir daí é possível avaliar todas as telas e funções:
- TV Ao Vivo: categorias, lista de canais, reprodução, favoritos (botão vermelho)
- Filmes: trilhas horizontais, destaque, alternância trilhas/grade, busca
- Séries: temporadas e episódios
- Player: play, pause, avanço, retrocesso, barra de progresso
- Configurações: idioma (português, espanhol, inglês) e informações do aparelho

O aplicativo é um REPRODUTOR. Ele não fornece canais, filmes, séries nem
assinatura de conteúdo. Quem usa cadastra a própria lista (Xtream Codes ou M3U),
que obtém de um provedor próprio. Nenhuma lista de terceiros acompanha o
aplicativo além da demonstração de licença aberta descrita acima.

Navegação: somente controle remoto (setas, OK, Voltar, teclas de mídia e botão
vermelho). A tecla Voltar na tela inicial encerra o aplicativo.
```

---

## Descrição do aplicativo

### Português

```
HeisenIPTV é um reprodutor de listas IPTV para sua Samsung Smart TV.

Cadastre a sua lista, no formato Xtream Codes ou M3U, e assista aos seus canais,
filmes e séries com a interface pensada para o controle remoto.

• TV ao vivo organizada por categorias, com favoritos no botão vermelho
• Filmes e séries em trilhas horizontais, com capas, sinopse e busca
• Player nativo da Samsung, com aceleração por hardware
• Reconexão automática quando a sua lista travar um canal
• Português, espanhol e inglês
• Cadastre a lista pelo celular e a TV recebe sozinha

HeisenIPTV não fornece canais, filmes, séries ou assinaturas de conteúdo. É um
reprodutor: o conteúdo vem da lista que você mesmo cadastra, obtida do seu
provedor. Você é responsável pelo conteúdo que acessa.

Teste grátis por 7 dias.
```

### English

```
HeisenIPTV is an IPTV playlist player for your Samsung Smart TV.

Add your own playlist, in Xtream Codes or M3U format, and watch your channels,
movies and series in an interface built for the remote control.

• Live TV organised by category, with favourites on the red button
• Movies and series in horizontal rails, with covers, plot and search
• Samsung native player, hardware accelerated
• Automatic reconnection when your playlist freezes a channel
• Portuguese, Spanish and English
• Add the playlist from your phone and the TV picks it up by itself

HeisenIPTV does not provide any channels, movies, series or content
subscription. It is a player: the content comes from the playlist you add
yourself, obtained from your own provider. You are responsible for the content
you access.

7-day free trial.
```

---

## Campos do cadastro

| Campo | Valor |
|---|---|
| Nome | HeisenIPTV |
| Versão | 1.0.2 |
| Categoria | Vídeo / Entretenimento |
| Política de Privacidade | https://heiseniptv.com/privacidade |
| Termos de Uso | https://heiseniptv.com/termos |
| Site | https://heiseniptv.com |
| Idiomas | Português, Espanhol, Inglês |
| Resolução | 1920×1080 |
| Classificação indicativa | Livre — o aplicativo não traz conteúdo próprio |

### Privilégios declarados

Todos de nível público, nenhum de nível partner:

| Privilégio | Para que |
|---|---|
| `tv.inputdevice` | Teclas do controle remoto |
| `tv.audio` | Áudio da TV |
| `tv.window` | Plano de vídeo |
| `internet` | Acesso à rede |
| `network.public` | Endereço MAC do aparelho |
| `avplay` | Reprodução de vídeo |
| `productinfo` | Saber se o painel é UHD, para liberar 4K só quando faz sentido |

---

## Verificações feitas antes de submeter

| Item | Situação |
|---|---|
| Identificador do manifesto aponta para domínio próprio | feito |
| Privilégios declarados e não usados removidos | feito |
| Aplicativo utilizável sem credenciais (botão de demonstração) | feito |
| Voltar na tela inicial encerra o aplicativo | feito |
| Nenhuma tela sem elemento focável pelo controle | feito |
| Vídeo liberado quando a TV esconde o aplicativo | feito |
| Lista de demonstração só com conteúdo de licença aberta | feito |
| Nenhum logotipo ou marca de terceiro no aplicativo | feito |
| Política de Privacidade e Termos de Uso publicados | páginas prontas, falta subir |
| Interface traduzida nos três idiomas | 168 chaves por idioma |
| Regras do banco restringindo os campos de cobrança | arquivo pronto, falta publicar |

---

## Pendências antes de enviar

1. **Publicar as regras do banco e o site:**

   ```bash
   firebase deploy --only database
   firebase deploy --only hosting
   ```

   Sem o segundo comando, os endereços da Política de Privacidade e dos Termos
   informados no cadastro não existem — e o avaliador confere.

2. **Criar o endereço `contato@heiseniptv.com`.** Ele aparece nos dois
   documentos como canal de contato para dados pessoais. O domínio está na
   Cloudflare, e o Email Routing dela faz esse encaminhamento de graça.

3. **Revisão jurídica** da Política de Privacidade e dos Termos, em especial a
   cláusula de reembolso.

4. **Testar o pacote numa TV de verdade** antes de enviar: abrir um canal SD, um
   FHD e um UHD; sair de um canal no meio do carregamento e abrir outro; pôr a
   TV em espera durante a reprodução e voltar.

5. **Decidir sobre a marca.** O nome e o logotipo remetem a Heisenberg, de
   Breaking Bad. A Samsung verifica propriedade intelectual na submissão, e uma
   notificação de marca não depende dela aprovar ou não.
