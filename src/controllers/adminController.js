const UserSchema = require('../models/User');
const OrderSchema = require('../models/Order');
const DropoutsSchema = require('../models/Dropouts');
const CupomSchema = require('../models/Cupom');

class AdminController {
    async getAllCount(req, res) {
        try { 
            const userPlayer = await UserSchema.find({ status : 'JOGADOR' }).lean().count();
            const userClient = await UserSchema.find({ status : 'CLIENTE' }).lean().count();
            const order = await OrderSchema.find().lean().count();
            const droputs = await DropoutsSchema.find().lean().count();
            const cupom = await CupomSchema.find().lean().count();
            res.status(200).send({ userPlayer, userClient, order, droputs, cupom})
        }catch(err) {
            return res.status(400).send(err.message);
        }
    }

    async getRanking(req, res) {
        try { 
            const userPlayer = await UserSchema.aggregate([
                { $match : { status  :  'JOGADOR'} },
                { $lookup: { from: 'orders', as: 'pedidos', localField: 'pedidos', foreignField: '_id' }},
                { $project :  {  _id : 0, name : 1, pedidos : 1, email : 1}}
                ]).sort({ pedidos : -1});
            const userPlayerRaking = userPlayer.map((e) => {
                return {
                    name : e.name,
                    email : e.email,
                    pedidos : ( e.pedidos && e.pedidos.filter(p => p.status === 'CONCLUIDO').length) ? e.pedidos.filter(p => p.status === 'CONCLUIDO').length : 0
                }
            })
            res.status(200).send({ userPlayerRaking });
        }catch(err) {
            return res.status(400).send(err.message);
        }
    }
}

module.exports = new AdminController();