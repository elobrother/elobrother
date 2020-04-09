const OrderSchema = require('../models/Order');
const DropoutsSchema = require('../models/Dropouts');
const PaypalController = require('../services/paypalController');
const MercadoPagoController = require('../services/mercadopagoController');
const Payment = require('../models/payments');
const Mail = require('./mailController');
const User = require('../models/User');
const mongoose = require('mongoose');

class OrderController  {
    async getAll(req, res) {
        try {
            //const orders = await OrderSchema.find({ paymentsStatus : 'APROVADO'}).lean();
            const orders = await OrderSchema.find().lean();
            if(orders && Array.isArray(orders)) {
                return res.status(200).send(orders);
            }
        }catch(err){
            return res.status(500).send(err.message);
        }
    };

    async getByCode(req, res) {
        try {
            const { code } = req.params;
            const orders = await OrderSchema.find({'code' : code}).lean();
            if(orders && Array.isArray(orders)) {
                return res.status(200).send(orders);
            }
        }catch(err){
            return res.status(500).send(err.message);
        }
    };


    async getOrdersByUser(req, res) {
        try {
            const { userId } = req.params;
            let orders = {};
            const typeUser = await User.find({'_id' : userId}).lean();
            if(typeUser[0].status === 'CLIENTE') {  orders = await OrderSchema.find({'userClient' : mongoose.Types.ObjectId(userId) }).lean(); }
            if(typeUser[0].status === 'JOGADOR') {  orders = await OrderSchema.find({'userPlayer' : mongoose.Types.ObjectId(userId) }).lean(); }
            if(!orders && !Array.isArray(orders)) { return res.status(200).send({ message : 'Esse Usuário não possui Pedidos'}); }
            return res.status(200).send(orders);
        }catch(err){
            return res.status(500).send(err.message);
        }
    };

    async dropoutsOrder(req, res) {
        try {
            const { id } = req.params;
            const { description, idUser } = req.body;
            const newOrder = {
                userPlayer : null
            }
            const order = await OrderSchema.findByIdAndUpdate({'_id' : id}, newOrder).lean();
            order.userPlayer = null;
            if(!order) { return res.status(200).send({ message : 'Houve um ao atualizar a ordem'}) };
            const user = (await User.find(mongoose.Types.ObjectId(idUser)).lean()).shift();
            user.pedidos = user.pedidos.filter((e) => {
                return !(e == id)
            });
            await user.save();
            const dropouts = await  DropoutsSchema.create({
                user,
                order,
                description
            });
            if(!dropouts){ return res.status(200).send({ message : 'Houve um erro ao criar uma nova Desistencia'}) };
            await Mail.dropOutsMail(order, description, user.name);
            return res.status(200).send('Desistencia gravada com sucesso');
        } catch(err) {
            return res.status(500).send(err.message);
        }
    }
    
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { pedido } = req.body;
            if(!id) {   return res.status(200).send({ message : 'Não foi passado o Id do usuário'}); } 
            const updatedOrder = await OrderSchema.findOneAndUpdate({'_id': id}, pedido).lean();
            if (!updatedOrder) { res.status(200).send({ message : 'Pedido não encontrado na base'})};
            const orders = await OrderSchema.find({ userPlayer : null }).lean();
            req.io.emit('orderUser',{ updateOrder : orders});
            return res.status(200).send(updatedOrder);
        }catch(err){
            return res.status(500).send(err.message);
        }
    };

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { pedido } = req.body;
            if(!id) {   return res.status(200).send({ message : 'Não foi passado o Id do usuário'}); } 
            const updatedOrder = await OrderSchema.findByIdAndUpdate({'_id': id}, pedido).lean();
            if (!updatedOrder) { res.status(200).send({ message : 'Pedido não encontrado na base' })};  
            updatedOrder.status = pedido.status;
            req.io.emit('orderStatus',{ updateOrder : updatedOrder._id.toString(), status : updatedOrder.status});
            if(updatedOrder.status === 'CONCLUIDO') {
                const user = await User.findById(updatedOrder.userClient).lean();
                const player = await User.findById(updatedOrder.userPlayer).lean();
                await Mail.orderFinished(updatedOrder.code, user.email);
                await Mail.sendNotificationToAdm(updatedOrder.code, player.email);
            }
            return res.status(200).send(updatedOrder);
        }catch(err){
            return res.status(500).send(err.message);
        }
    };

    async updatePaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await OrderSchema.findById(id);
            order.paymentsStatus = status;
            await order.save();
            req.io.emit('newOrder', order);
            return res.status(200).send(order);
        }catch(err){
            return res.status(500).send(err.message);
        }
    };

    async delete(req, res) {
        try {
            const { id } = req.params;
            if(!id) {   return res.status(200).send({ message : 'Não foi passado o Id do usuário'}); } 
            if(!await OrderSchema.deleteOne({ '_id' : id })){
                return res.status(200).send({ message : 'Erro ao deletar o pedido'})
            }
            return res.status(200).send('Pedido excluido com sucesso!');
        }catch(err){
            return res.status(500).send(err.message);
        }
    };

    async getAllDropouts(req, res) {
        try {
            const dropouts = await DropoutsSchema.find().lean();
            if(!dropouts) { return res.status(200).send({ message : 'Não existe desistencias'})};
            return res.status(200).send(dropouts);
        }catch(err){
            return res.status(500).send(err.message);
        }
    }

    async create(req, res) {
        try {
            let code = Math.random().toString(36).substring(7);
            const verifyOrder = await OrderSchema.find({ code : code });
            if(verifyOrder.length) { 
                code = Math.random().toString(36).substring(7) 
            }
            const { tipo, status, value, playerName, playerPassword, description, userclientid, aditionals, days, paymentsStatus } = req.body;
            const order  = await OrderSchema.create({
                code,
                tipo,
                status,
                valor : value,
                description,
                playerName,
                playerPassword,
                days,
                hasCupom : req.body.hasCupom ? req.body.hasCupom : false,
                cupomId : req.body.cupomId ? req.body.cupomId : null,
                userClient : userclientid,
                additional : aditionals ? aditionals : null,
                paymentsStatus : paymentsStatus ? paymentsStatus : 'AGUARDANDO'
            });
            if(!order) { return res.status(200).send({ message : 'Houve um erro na criação do Pedido'})};
            req.io.emit('newOrder', order);
            return res.status(200).send({ message : 'Pedido criado com sucesso', order});
        }catch(err){
            return res.status(500).send(err.message);
        }
    };

    async userCancelOrder(req, res) {
        try { 
            const  { email, orderCode, description } = req.body;
            await Mail.sendUserCancelOrderEmail(email, orderCode, description);
            return res.status(200).send({ message : 'Foi enviado um email para o Administrador, entraremos em contato'})
        }catch(err) {
            return res.status(400).send(err.message);
        }
    }

    async refund(req, res) {
        try {
            const { orderId } = req.body;
            let payment = await Payment.findOne({  orderId : mongoose.Types.ObjectId(orderId) });
            if(payment.length < 1) { return res.send({ message : 'Erro ao achar o pagamento desse pedido'})};
            if( payment[0].meio  === 'MERCADOPAGO') { return await MercadoPagoController.refund(req, res, payment.payment.id, orderId, payment); }
            return await PaypalController.refund(req, res, orderId);
        }catch(err) {
            return status(400).send(err.message)
        }
    }

    async getPlayerPassword(req, res) {
        try {
            const { orderId } = req.body;
            const order = await OrderSchema.findById(orderId).select('playerPassword').lean();
            return res.status(200).send({ playerPassword : order.playerPassword });
        }catch(err) {
            return status(400).send(err.message)
        }
    }

}


module.exports =  new OrderController();