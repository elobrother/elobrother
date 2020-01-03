
const paypal = require('paypal-rest-sdk');
const paypalConfig = require('../config/paypal');
const request = require('request-promise');
const PaymentsController = require('../controllers/paymentsController');
const Order = require('../models/Order');
const Payment = require('../models/payments');
const mongoose = require('mongoose');


class PaypalController {
    constructor(){
        paypal.configure(paypalConfig);
    }

    async pay(req, res) {

        const { order }= req.body;
        const  { tipo, value, description, id } = order;
        //const id = Math.random();
    
        const carrinho = [{
            "name" : tipo,
            "sku" : id,
            "price" : value.toString(),
            "currency" : "BRL",
            "quantity" : 1
        }];
    
        const price = { "currency" : "BRL", "total" : value.toString()};
    
        const create_payment_json = {
            "intent": "sale",
            "payer": { payment_method: "paypal" },
            "redirect_urls": {
                "return_url": "http://localhost:8080/sucesso-paypal",
                "cancel_url": "https://elobrother-app.web.app/payments"
            },
            "transactions": [{
                "item_list": { "items": carrinho },
                "amount": price,
                "description": description
                }]
            }
    
        await paypal.payment.create(create_payment_json,  (error, payment) => {
            if (error) { return res.status(400).send(error.message);}   
            payment.links.forEach((link) => {
                if(link.rel === 'approval_url') 
                { 
                    return res.send(link.href);
                }
            });
            });
      };
    
    async getAuth() {
        let auth = '';
        const options = {
            method: 'POST',
            uri: `https://api.sandbox.paypal.com/v1/oauth2/token`,
            headers : { 
                "Content-Type" : "application/json",
                "Accept-Language": "en_US",
                "content-type": "application/x-www-form-urlencoded"
            },
            auth: {
                user : "AZSF1eKLwJPyfpviv-STLjFj6TI7E-xkGnNmKihHqj8xcTCa4xu7mlY1O1MqEUzZHMQ6VHzZ8r_e6ZgA",
                pass : "EFb3OK3moU9djk-rELq411sGZvl-fXTXHc9OCAc7j3mIv0slNBQaQMFLyfxp2LNENQzLnzcqTzg87LrD"
            },
            form : {
                grant_type : "client_credentials"
            },
            json: true 
        };
        await request(options)
        .then(async (resp) => {
            auth = resp.access_token;
        })
        .catch((err) => 
            auth = err
        )
        return auth;
    }
      
    async success(req, res) {
        try { 
            const access_token = await this.getAuth();
            const payerId = req.body.payerId;
            const paymentId = req.body.paymentId;
            const options = {
                method: 'POST',
                uri: `https://api.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}` 
                },
                body : {
                    payer_id : payerId
                },
                json: true 
            };
            await request(options)
            .then(async (resp) => {
                const payments = await PaymentsController.createPaypalPayment(resp, resp.transactions[0].item_list.items[0].sku);
                if(!payments) { return res.status(400).send({ message : 'Houve um erro na criação do Pagamento meio PAYPAL'}); };
                const order = await Order.findById(resp.transactions[0].item_list.items[0].sku);
                order.paymentsStatus = 'APROVADO';
                await order.save();
                return res.status(200).send({ message : 'Tudo Funcionando'});
            })
            .catch((err) => {
                return res.status(200).send({ message : err.message})
            })
        }catch(err){
            return res.status(400).send(err.message)
        }
    };
      
      async refund(req, res, orderId) {
        try {
            const access_token = await this.getAuth();
            const { orderId } = req.body;
            let payment = await Payment.find({ orderId : mongoose.Types.ObjectId(orderId) });
            if(payment.length) {
                payment = payment.shift();
            }
            const options = {
                method: 'POST',
                uri: ` https://api.sandbox.paypal.com/v1/payments/sale/${payment.payment.transactions[0].related_resources[0].sale.id}/refund`,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}`
                },
                json: true 
            };
            await request(options)
            .then(async (resp) => {
                if (resp.state === "completed") {
                    const order = await Order.findById(orderId);
                    if(!order || !payment) { return res.status(200).send({ message : 'Erro ao atualizar peido ou ordem após refound'})}
                    order.paymentsStatus === 'DEVOLVIDO';
                    payment.status === 'DEVOLVIDO';
                    await payment.save();
                    await order.save();
                    return res.status(200).send({ message : 'Pedido estornado com sucesso'});
                }
            return res.status(200).send({ message : 'Erro ao gerar refound'})
            })
            .catch((err) => {
                return res.status(200).send({ message : err.message})
            })
        }catch(err) {
            return res.status(400).send(err.message);
        }
      }

      async updatePayment(req, res) {
          try {
            if (req.body.action === "payment.updated") {
                const payment = paypal.payment.findById(req.body.data.id);

              }
            return res.status(200).send({ message : 'Ok'})
        }catch(err) {
            console.log(err)
        }
    }
}



module.exports = new PaypalController();
