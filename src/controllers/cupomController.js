const Cupom = require('../models/Cupom');
const moment = require('moment');

class CupomController {

    async validateCupomDate(cupom) {
        const date = new Date();
        if (moment(cupom.expirationTime).isBefore(date)) {
            return false;
        }
        return true;
    };

    async save(cupom) {
        try {
        cupom.amount--;
        if (cupom.save()){
            return true;
        }
        return false;
        }catch (err) {
            return err
        }
    };

    async validate(req, res) {
        try {
            const { name } = req.params;
            const cupom = await Cupom.find({ 'name' : name});
            if(!cupom){ return res.status(200).send({ message : 'Cupom não Existe!'})};
            if(cupom[0].amount === 0 ) { return res.status(200).send({ message : 'Cupom não disponível'}) };
            if(!await this.validateCupomDate(cupom[0])) { return res.status(200).send({ message : 'Cupom Expirado'}) };
            if(!await this.save(cupom[0])) { return res.status(200).send({ message : 'Houve um erro ao Atualizar o cupom'}) };
            return res.status(200).send({ cupom });
        }catch(err) {
            return res.status(500).send(err.message);
        }
    };
    
    async create(req, res) {
        try {
            const { name, expirationTime, value, amount } = req.body;
            const existCppom = await Cupom.find({ 'name' : name })
            if(existCppom.length) { return res.status(200).send({ message : 'Já existe um Cupom com o mesmo nome'})}
            const cupom = await Cupom.create({
                name,
                expirationTime,
                value,
                amount
            });
            if(!cupom) { return res.status(200).send({ message : 'Houve um erro na criação do Cupom'})};
            return res.status(200).send({ message : 'Cupom criado com sucesso', cupom});
        }catch(err){
            return res.status(500).send(err.message);
        }
    };

    async getAll(req, res) {
        try {
            const cupom = await Cupom.find().lean();
            if (!cupom) { return res.status(200).send({ message : 'Não existe Cupons cadastrados na base'})};
            return res.status(200).send(cupom);
        }catch(err) {
            return res.status(500).send(err.message);
        }
    };

    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id) { return res.status(200).send({ message : 'Não foi passado o Id do cupom'}); }
                const cupom = await Cupom.deleteOne({'_id' : id })
                if(!cupom) { return res.status(200).send({ message : 'Cupom não existe na base'})};
                return res.status(200).send('Cupom excluido com sucesso!');
        }catch(err) {
            return res.status(500).send(err.message);
        }
    };

}

module.exports = new CupomController();