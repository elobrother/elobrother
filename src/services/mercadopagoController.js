const MercadoPago = require('mercadopago');
const mercadopagoConfig = require('../config/mercadopago.js');
const PaymentsController = require('../controllers/paymentsController');
const Order = require('../models/Order');
const Payment = require('../models/payments');

const MercadoStatus = {
  pending : async (id) =>  {
    const order = await Order.findById(id);
    order.paymentsStatus = 'AGUARDANDO';
    await order.save();
    return 'Pagamento via Mercado Pago retornado com sucesso'
  },
  approved : async (id) => {
    const order = await Order.findById(id);
    order.paymentsStatus = 'APROVADO';
    await order.save();
    return 'Pagamento via Mercado Pago retornado com sucesso'
  },
  authorized : async (id) => {
    const order = await Order.findById(id);
    order.paymentsStatus = 'APROVADO';
    await order.save();
    return 'Pagamento via Mercado Pago retornado com sucesso'
  },
  rejected :  async (id) => {
    const order = await Order.findById(id);
    order.paymentsStatus = 'REJEITADO';
    await order.save();
    return 'Pagamento via Mercado Pago retornado com sucesso' 
  },
  refunded : async (id) => {
    const order = await Order.findById(id);
    order.paymentsStatus = 'DEVOLVIDO';
    await order.save();
    return 'Pagamento via Mercado Pago retornado com sucesso'
  },
}


class MercadoPagoController {
    constructor () {
      MercadoPago.configure(mercadopagoConfig);
    }
        
    async buy(req, res) {
        const { order } = req.body;
        const item = {
          id: order.id,
          title: order.tipo,
          description : order.description,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: parseFloat(order.value) 
        }
        const purchaseOrder = {
            items: [ item ],
            payer : {
              email : order.userEmail,
              first_name : order.userName
            },
            auto_return : "all",
            external_reference : "23132322",
            back_urls : {
              success : "https://elobrother.com.br/sucesso-mercadopago",
              pending : "https://elobrother.com.br/sucesso-mercadopago",
              failure : "https://elobrother.com.br/payments",
            }
          }

        try {
            const preference = await MercadoPago.preferences.create(purchaseOrder);
            return res.send(preference.body.init_point);
        } catch(err) {
            return res.status(500).send(err.message);
        }
    }

    async success(req, res) {
      try {
        const { collection_id, OrderId } = req.body.data;
        const payment = await MercadoPago.payment.findById(collection_id);
        if ( !payment ) {  return res.status(200).send({ message : 'Erro na na busca do pagamento via mercado pago'})}
        const paymentSchema = await PaymentsController.createMercadopagoPayment(payment.response, OrderId );
        if(!paymentSchema) { return res.status(400).send({ message : 'Houve um erro na criação do Pagamento meio Mercado Pago'}); };
        const message = await MercadoStatus[payment.response.status](OrderId);
        return res.status(200).send({ message });
      }catch(err) {
        return res.status(400).send(err.message)
      }
    }

    async refund(req, res, paymentId,orderId) {
      try { 
        const refound = await MercadoPago.payment.refund(paymentId);
        if ( !refound ) { return res.status(200).send({ message : 'Houve um erro na devolução'})};
        const message = await MercadoStatus[refound.response.status](orderId);
        return res.status(200).send({ message })
      }catch(err) {
        return res.status(400).send(err.message)
      }
   
    }

    async updatePayment(req, res) {
      try {
        const paymentId = req.query['data.id'];
        const action = req.body.action;
        if ( action === 'payment.updated') {
          const payment = await MercadoPago.payment.findById(paymentId);
          const paymentSchema = await (await Payment.find({ 'payment.id' : parseInt(paymentId) })).shift();
          await MercadoStatus[payment.response.status](paymentSchema.orderId)
        }
        return res.status(200).send({ message : 'Ok'});
      } catch(err) {
        return res.status(400).send(err.message);
      }
    }

}

module.exports = new MercadoPagoController();