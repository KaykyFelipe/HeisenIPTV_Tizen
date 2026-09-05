const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// Configuração do Mercado Pago (Variável de Ambiente)
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// Configuração do Nodemailer (SMTP para envio de e-mails - Ex: Gmail, Hostinger, etc)
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com', 
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ============================================================================
// 1. ENDPOINT: Criar Link de Pagamento
// ============================================================================
exports.createCheckout = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { mac, planType, email } = req.body;
      
      if (!mac || !planType || !email) {
        return res.status(400).json({ error: "MAC, planType e email são obrigatórios" });
      }

      let price = 0;
      let title = "";

      if (planType === 'anual') {
        price = 29.90;
        title = "Licença Anual - HeisenIPTV";
      } else if (planType === 'vitalicio') {
        price = 59.90;
        title = "Licença Vitalícia - HeisenIPTV";
      } else {
        return res.status(400).json({ error: "Plano inválido" });
      }

      // Cria a preferência no Mercado Pago
      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: [
            {
              id: planType,
              title: title,
              quantity: 1,
              unit_price: price,
              currency_id: "BRL"
            }
          ],
          payer: {
            email: email
          },
          external_reference: mac, // Usamos isso para saber de qual MAC foi a compra
          back_urls: {
            success: "https://seusite.com/sucesso.html",
            failure: "https://seusite.com/falha.html",
            pending: "https://seusite.com/pendente.html"
          },
          auto_return: "approved",
          // O URL abaixo é o endpoint do nosso Webhook (Substitua depois do deploy)
          notification_url: "https://webhookmercadopago-gmiujppikq-uc.a.run.app"
        }
      });

      // Retorna a URL de pagamento para o site
      res.status(200).json({ 
        init_point: result.init_point, 
        sandbox_init_point: result.sandbox_init_point 
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar pagamento" });
    }
  });
});

// ============================================================================
// 2. ENDPOINT: Webhook (IPN/Webhook) do Mercado Pago
// ============================================================================
exports.webhookMercadoPago = functions.https.onRequest(async (req, res) => {
  try {
    console.log("=== WEBHOOK RECEBIDO ===");
    console.log("Query:", JSON.stringify(req.query));
    console.log("Body:", JSON.stringify(req.body));
    
    const topic = req.query.topic || req.body.type;
    const paymentId = req.query.id || (req.body.data && req.body.data.id);
    
    // O Mercado Pago manda notificações de "payment"
    if (topic === 'payment' && paymentId) {
      console.log(`Processando pagamento ID: ${paymentId}`);
      // Consultar status real do pagamento na API do MP
      const fetch = require('node-fetch');
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const paymentData = await mpRes.json();
      
      // Se estiver aprovado...
      if (paymentData.status === 'approved') {
        const mac = paymentData.external_reference;
        const payerEmail = paymentData.payer.email;
        const planType = paymentData.additional_info.items[0].id;
        
        // Atualizar o Firebase Database para liberar a TV!
        const safeMac = mac.replace(/:/g, '').toUpperCase();
        const { getDatabase } = require('firebase-admin/database');
        const dbRef = getDatabase().ref(`devices/${safeMac}`);
        
        // Se for plano anual, definir validade de 1 ano. Se vitalício, null.
        let expiration = null;
        if (planType === 'anual') {
          const nextYear = new Date();
          nextYear.setFullYear(nextYear.getFullYear() + 1);
          expiration = nextYear.toISOString();
        }

        await dbRef.update({
          isPaid: true,
          expirationDate: expiration,
          lastPaymentEmail: payerEmail,
          paymentDate: new Date().toISOString()
        });

        // 3. ENVIAR E-MAIL DE CONFIRMAÇÃO
        try {
          await transporter.sendMail({
            from: `"HeisenIPTV" <${process.env.EMAIL_USER}>`,
            to: payerEmail,
            subject: "Sua licença HeisenIPTV foi ativada! 🎉",
            html: `
              <h2>Pagamento Aprovado!</h2>
              <p>Olá,</p>
              <p>O pagamento da sua <strong>${planType === 'anual' ? 'Licença Anual' : 'Licença Vitalícia'}</strong> foi confirmado com sucesso.</p>
              <p>O MAC Address <strong>${mac}</strong> já foi liberado e você pode voltar a assistir imediatamente.</p>
              <p>Basta reiniciar o aplicativo na sua Smart TV.</p>
              <br>
              <p>Obrigado por escolher o HeisenIPTV!</p>
            `
          });
          console.log(`Email enviado com sucesso para ${payerEmail}`);
        } catch(emailErr) {
          console.error("Erro ao enviar email:", emailErr);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook erro:', error);
    res.status(500).send('Internal Server Error');
  }
});
