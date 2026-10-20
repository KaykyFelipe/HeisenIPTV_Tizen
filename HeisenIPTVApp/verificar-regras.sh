#!/usr/bin/env bash
# Verifica, contra o banco em PRODUÇÃO, se as regras publicadas estão valendo.
# Rode DEPOIS de: firebase deploy --only database
#
# Usa um MAC de teste que não pertence a ninguém. Ao final ele avisa como
# remover esse registro, porque as próprias regras impedem o cliente de apagar
# um aparelho inteiro (só o Admin SDK faz isso).

DB="https://fluxiptv-5c6b5-default-rtdb.firebaseio.com"
MAC="ZZTESTEREGRAS"
ok=0; falhas=0

negado() { echo "$1" | grep -qi "permission denied\|error"; }

esperado_ok() {   # nome, resposta
  if negado "$2"; then echo "FALHA| $1 -> foi NEGADO e devia ser permitido"; falhas=$((falhas+1));
  else echo "OK   | $1"; ok=$((ok+1)); fi
}
esperado_negado() {
  if negado "$2"; then echo "OK   | $1"; ok=$((ok+1));
  else echo "FALHA| $1 -> foi PERMITIDO e devia ser negado  ($2)"; falhas=$((falhas+1)); fi
}

echo "--- leitura ---"
esperado_negado "listar /devices continua bloqueado" \
  "$(curl -s --max-time 20 "$DB/devices.json?shallow=true")"
esperado_ok "ler o proprio registro pelo MAC" \
  "$(curl -s --max-time 20 "$DB/devices/$MAC.json")"

echo "--- escrita permitida (o app precisa disso) ---"
esperado_ok "gravar status" \
  "$(curl -s --max-time 20 -X PATCH -d '{"status":"pending"}' "$DB/devices/$MAC.json")"
esperado_ok "gravar mac e deviceKey" \
  "$(curl -s --max-time 20 -X PATCH -d '{"mac":"ZZ:TESTE","deviceKey":"000000"}' "$DB/devices/$MAC.json")"
esperado_ok "gravar listInfo" \
  "$(curl -s --max-time 20 -X PATCH -d '{"listInfo":{"state":"ok","status":"Active"}}' "$DB/devices/$MAC.json")"
esperado_ok "gravar uma playlist" \
  "$(curl -s --max-time 20 -X PUT -d '{"name":"Teste","type":"m3u"}' "$DB/devices/$MAC/playlists/pl_teste.json")"
esperado_ok "gravar activePlaylistId" \
  "$(curl -s --max-time 20 -X PATCH -d '{"activePlaylistId":"pl_teste"}' "$DB/devices/$MAC.json")"

echo "--- escrita que PRECISA ser negada ---"
esperado_negado "expirationDate (so o Admin SDK)" \
  "$(curl -s --max-time 20 -X PATCH -d '{"expirationDate":"2099-01-01"}' "$DB/devices/$MAC.json")"
esperado_negado "paymentDate (so o Admin SDK)" \
  "$(curl -s --max-time 20 -X PATCH -d '{"paymentDate":"2099-01-01"}' "$DB/devices/$MAC.json")"
esperado_negado "isPaid=true direto (auto-liberacao)" \
  "$(curl -s --max-time 20 -X PATCH -d '{"isPaid":true}' "$DB/devices/$MAC.json")"

echo "--- campos que podem ser criados uma vez e nunca mais ---"
esperado_ok "criar isPaid=false na primeira execucao" \
  "$(curl -s --max-time 20 -X PATCH -d '{"isPaid":false}' "$DB/devices/$MAC.json")"
esperado_negado "alterar isPaid depois de criado" \
  "$(curl -s --max-time 20 -X PATCH -d '{"isPaid":true}' "$DB/devices/$MAC.json")"
esperado_ok "criar trialStartDate" \
  "$(curl -s --max-time 20 -X PATCH -d '{"trialStartDate":"2026-10-20T00:00:00.000Z"}' "$DB/devices/$MAC.json")"
esperado_negado "reiniciar o teste gratis" \
  "$(curl -s --max-time 20 -X PATCH -d '{"trialStartDate":"2030-01-01T00:00:00.000Z"}' "$DB/devices/$MAC.json")"

echo
echo "$ok passaram, $falhas falharam"
echo
echo "Limpeza: o registro de teste /devices/$MAC ficou no banco."
echo "Remova com o comando abaixo (roda autenticado como dono, ignora as regras):"
echo "  firebase database:remove /devices/$MAC --project fluxiptv-5c6b5"
echo
if [ "$falhas" -ne 0 ]; then
  echo "ATENCAO: houve falha. Para voltar atras:"
  echo "  firebase deploy --only database   (com o rollback.rules.json no lugar)"
  exit 1
fi
