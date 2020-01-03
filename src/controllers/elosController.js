const Elos = require('../models/Elos');

class ElosController {
    // async create(req, res) {
    //     try {
    //         const { elo } = req.body;
    //         const Elo= await Elos.create(elo)
    //         if(!Elo) { return res.status(200).send({ message : 'Elo não foi criado'})}
    //         return res.send(Elo)
    //     }catch(err) {
    //         res.status(500).send(err.message)
    //     }
    // }

    async updateElo(req, res) {
        try {
            const { name, value } = req.body 
            const elos = await Elos.find({ 'name' : new RegExp(name.toUpperCase()) });
            if(!elos.length) { return res.status(200).send({ message : 'Não foi achado um elo com esse nome'})};
            if(elos.length === 1 && elos[0].name.substr(-5) === 'COACH'){
                elos[0].value = value
                await elos[0].save();
                return res.status(200).send({ message : 'Valor do Elo Coach Atualizado com sucesso'})
            }
            for(let elo of elos) {
                if(elo.name.substr(-5) === 'COACH') {continue;}
                if(elo.name.substr(-2) === 'IV') {continue;}
                if(elo.name.substr(-4) === 'MD10') {continue;}
                elo.value = value;
                await elo.save();
            }
            return res.status(200).send({ message : 'Valor do elo Atualizado com sucesso'})
        }catch(err) {
            res.status(500).send(err.message)
        }
    }

    async orderValue(req, res) {
        try {
            const { currentElo, requiredElo } = req.body;
            const elos = await Elos.find().lean().sort({ position : 1});
            const elo1 = elos.find(e => e.name === currentElo.toUpperCase());
            const elo2 = elos.find(e => e.name === requiredElo.toUpperCase());
            const elosRange = elos.slice(elo1.position, elo2.position + 1);
            const days = elosRange.reduce((acc, crr) => { return acc + parseInt(crr.day)},0);
            let value = elosRange.slice(1).reduce((acc, crr) => { return acc + crr.value},0);
            if(value === 0) { value = elosRange.reduce((acc, crr) => { return acc + crr.value},0)}
            return res.status(200).send({value, days});
        }catch(err) {
            res.status(500).send(err.message)
        }
    }

    async getAll(req, res) {
        try {
            const elos = await Elos.find().lean();
            return res.status(200).send(elos);
        }catch(err) {
            res.status(500).send(err.message)
        }
    }

    async md10GetValue(req, res) {
        try {
            const { eloName, match } = req.body;
            const elo = (await Elos.find({ "name" : eloName.toUpperCase()})).shift();
            if(!elo) { return res.status(200).send({ message : 'Elo não achado na base de Dados'})}
            const days = match >= 8 ? 2 : 1
            return res.status(200).send({ value : elo.value * match, days });
        }catch(err) {
            return res.status(400).send(err.message)
        }
    }
}

module.exports = new ElosController();