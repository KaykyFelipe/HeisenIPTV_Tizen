document.addEventListener('DOMContentLoaded', function() {
    var tabs = document.querySelectorAll('.tab-btn');
    var currentType = 'xtream';
    
    // Configuração do Firebase fornecida
    var firebaseDbUrl = 'https://fluxiptv-5c6b5-default-rtdb.firebaseio.com';

    // Tab Switching
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked
            this.classList.add('active');
            var target = this.getAttribute('data-target');
            document.getElementById(target + '-fields').classList.add('active');
            currentType = target;
            
            var btnSubmit = document.getElementById('btn-submit');
            var keyField = document.getElementById('device-key').parentElement;
            
            if (target === 'license') {
                btnSubmit.style.display = 'none';
                keyField.style.opacity = '0.3'; // Não precisa da senha pra consultar
            } else {
                btnSubmit.style.display = 'block';
                keyField.style.opacity = '1';
            }
        });
    });

    // Check License Status
    document.getElementById('btn-check-license').addEventListener('click', function() {
        var mac = document.getElementById('mac-address').value.trim().toUpperCase();
        if(mac.length < 12) {
            showMessage('Erro: MAC Address inválido.', 'error');
            return;
        }

        var safeMac = mac.replace(/:/g, ''); 
        var apiUrl = firebaseDbUrl + '/devices/' + safeMac + '.json';

        var statusBox = document.getElementById('license-status-box');
        var statusTitle = document.getElementById('lic-status-title');
        var statusDesc = document.getElementById('lic-status-desc');
        var paymentOpts = document.getElementById('payment-options');
        
        statusBox.style.display = 'block';
        statusTitle.innerText = 'Buscando...';
        statusDesc.innerText = '';
        paymentOpts.style.display = 'none';

        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                if (!data) {
                    statusTitle.innerText = 'Dispositivo Não Encontrado';
                    statusTitle.style.color = '#ff4d4d';
                    statusDesc.innerText = 'Este MAC nunca abriu o aplicativo na TV. Abra o aplicativo na TV primeiro para iniciar seu período de testes.';
                    return;
                }

                var isPaid = data.isPaid === true;
                var trialStart = new Date(data.trialStartDate || new Date());
                var now = new Date();
                var diffDays = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) diffDays = 0; // Evita datas do futuro

                if (isPaid) {
                    statusTitle.innerText = 'Licença Ativa (Premium)';
                    statusTitle.style.color = '#2ecc71';
                    statusDesc.innerText = 'Este dispositivo possui uma licença paga e está totalmente desbloqueado.';
                } else if (diffDays < 7) {
                    var remaining = 7 - diffDays;
                    statusTitle.innerText = 'Período de Testes (' + remaining + ' dias restantes)';
                    statusTitle.style.color = '#f1c40f';
                    statusDesc.innerText = 'Você ainda está no período de testes gratuitos. Pode adquirir a licença agora se desejar.';
                    paymentOpts.style.display = 'block';
                } else {
                    statusTitle.innerText = 'Licença Expirada';
                    statusTitle.style.color = '#e50914';
                    statusDesc.innerText = 'Seu período de testes de 7 dias acabou. Adquira a licença abaixo para desbloquear o aplicativo na TV.';
                    paymentOpts.style.display = 'block';
                }
            })
            .catch(err => {
                statusTitle.innerText = 'Erro';
                statusDesc.innerText = 'Não foi possível conectar ao banco de dados.';
            });
    });
    
    // Mock Payment Buttons -> Redirect to Cloud Function
    document.querySelectorAll('.btn-pay').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var email = document.getElementById('buyer-email').value.trim();
            if (!email || email.indexOf('@') === -1) {
                showMessage('Por favor, digite um E-mail válido para receber a confirmação.', 'error');
                document.getElementById('buyer-email').focus();
                return;
            }

            var mac = document.getElementById('mac-address').value.trim().toUpperCase();
            var planType = this.getAttribute('data-plan'); // 'anual' ou 'vitalicio'

            // Desabilita os botões durante o carregamento
            var buttons = document.querySelectorAll('.btn-pay');
            buttons.forEach(b => b.disabled = true);
            var originalText = this.innerHTML;
            this.innerHTML = '<div style="font-size: 16px; margin-top: 10px;">Gerando Pagamento...</div>';

            // URL oficial da Cloud Function recém-criada no Firebase (Cloud Run 2nd Gen)
            var checkoutFunctionUrl = 'https://createcheckout-gmiujppikq-uc.a.run.app';

            fetch(checkoutFunctionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mac: mac, planType: planType, email: email })
            })
            .then(res => res.json())
            .then(data => {
                if (data.init_point) {
                    // Redireciona o usuário para o Mercado Pago
                    window.location.href = data.init_point;
                } else {
                    throw new Error('Erro ao gerar link.');
                }
            })
            .catch(err => {
                console.error(err);
                showMessage('Ocorreu um erro ao conectar com o banco. Tente novamente mais tarde.', 'error');
                this.innerHTML = originalText;
                buttons.forEach(b => b.disabled = false);
            });
        });
    });

    // Auto-formatação do MAC Address (Adiciona : a cada 2 caracteres)
    var macInput = document.getElementById('mac-address');
    macInput.addEventListener('input', function(e) {
        var cursor = this.selectionStart;
        var prevLength = this.value.length;
        
        // Remove tudo que não for letra de A-F ou número
        var val = this.value.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
        var formatted = '';
        
        for (var i = 0; i < val.length; i++) {
            if (i > 0 && i % 2 === 0) {
                formatted += ':';
            }
            formatted += val[i];
        }
        
        this.value = formatted;
        
        // Mantém a posição do cursor (mais ou menos)
        var newLength = this.value.length;
        if (newLength > prevLength && cursor % 3 === 0) {
            cursor++;
        }
        try { this.setSelectionRange(cursor, cursor); } catch(ex) {}
    });

    // Form Submission
    document.getElementById('upload-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        var mac = document.getElementById('mac-address').value.trim().toUpperCase();
        var key = document.getElementById('device-key').value.trim();
        var btn = document.getElementById('btn-submit');
        var msgBox = document.getElementById('message-box');
        
        // Basic MAC Validation
        if(mac.length < 12) {
            showMessage('Erro: MAC Address inválido.', 'error');
            return;
        }

        var playlistData = { type: currentType };

        if (currentType === 'xtream') {
            var xUrl = document.getElementById('x-url').value.trim();
            var xUser = document.getElementById('x-user').value.trim();
            var xPass = document.getElementById('x-pass').value.trim();
            
            if(!xUrl || !xUser || !xPass) {
                showMessage('Erro: Preencha todos os dados do Xtream Codes.', 'error');
                return;
            }
            
            // Clean URL (remove trailing slash)
            if(xUrl.endsWith('/')) xUrl = xUrl.slice(0, -1);
            
            playlistData.url = xUrl;
            playlistData.user = xUser;
            playlistData.pass = xPass;
            
        } else {
            var mUrl = document.getElementById('m-url').value.trim();
            if(!mUrl) {
                showMessage('Erro: Preencha a URL da lista M3U.', 'error');
                return;
            }
            playlistData.url = mUrl;
        }

        btn.innerText = 'Ativando...';
        btn.disabled = true;

        var safeMac = mac.replace(/:/g, ''); 
        var apiUrl = firebaseDbUrl + '/devices/' + safeMac + '.json';

        // 1. Validar se o MAC e a KEY batem com o banco de dados
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                if (!data || data.deviceKey !== key) {
                    throw new Error('Erro: Device Key incorreto ou TV não conectada.');
                }
                
                var payload = {
                    status: 'active',
                    updatedAt: new Date().toISOString(),
                    playlist: playlistData
                };

                // Usa PATCH para não apagar o deviceKey existente
                return fetch(apiUrl, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            })
            .then(res => {
                if(!res || !res.ok) {
                    // Check if it's a response object, if not it's the result of json parsing
                    if(res && res.status >= 400) throw new Error('Erro na gravação.');
                }
                showMessage('Dispositivo ativado com sucesso! A TV deve carregar a lista em poucos segundos.', 'success');
                btn.innerText = 'Ativar Dispositivo';
                btn.disabled = false;
            })
            .catch(err => {
                console.error(err);
                showMessage(err.message || 'Erro de conexão com o servidor.', 'error');
                btn.innerText = 'Ativar Dispositivo';
                btn.disabled = false;
            });
    });

    function showMessage(text, type) {
        var msgBox = document.getElementById('message-box');
        msgBox.innerText = text;
        msgBox.className = 'message ' + type;
    }
});
