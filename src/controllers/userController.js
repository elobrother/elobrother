const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const secret = require('../config/auth.js').secret;
const Mail = require('./mailController');

class UserController {

    async verifyUser(email, password) {
        const user = await User.findOne({email : email});
        if (!user) { return false };
        if ( await bcrypt.compareSync(password, user.password) ) {
            return user;
        }
        return false;
    };

    async verifyAdmin(email, password) {
        const admin = await User.findOne({email : email});
        if(admin.status != 'ADMIN') { return { admin : false} }
        if (!admin) { return { empty : true} };
        if ( await bcrypt.compareSync(password, admin.password) ) {
            return admin;
        }
        return false;
    };

    async forgotPassword(req, res) {
        const { email } = req.body;
        const newPassword = Math.floor(Math.random() * (9999 - 1111 + 1) + 111111);
        const newUser = {
            password : newPassword,
            hasForgottenPassowrd : true
        }
        const user = await User.updateOne({ 'email' : email }, newUser);
        if (!user ) { res.status(200).send('Ocorreu um erro ao salvar nova senha')};
        await Mail.sendPasswordEmail(newPassword, user[0].email);
        res.status(200).send('Enviamos uma nova senha para o email cadastrado.');
    }

    async sign(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.verifyUser(email, password);
            if(!user) { return res.status(200).send({ message : 'Senha ou Email estão errados', user : false})};
            const token = jwt.sign({ id : user._id }, secret, {
                expiresIn : 86400000,
            });
            return res.status(200).send({ user, token });
        }catch(err) {
            return res.status(500).send(err.message);
        }
    };

    async adminSign(req, res) {
        try {  
            const { email, password } = req.body;
            const user = await this.verifyAdmin(email, password);
            if(user.admin === false) { return res.status(200).send({ message : 'Apenas Administradores podem acessar o painel', userAdmin : false })};
            if(user.empty) { return res.status(200).send({ message : 'Senha ou Email estão errados', user : false})};
            const token = jwt.sign({ id : user._id }, secret, {
                expiresIn : 86400000,
            });
            return res.status(200).send({ user, token });
        }catch(err) {
            return res.status(500).send(err.message);
        }
    };

    async getUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.find(mongoose.Types.ObjectId(id));
            if(!user){ return res.status(200).send('Usuário não Existe!')};
            return res.status(200).send({user});
        }catch(err) {
            return res.status(500).send(err.message);
        }
    };

    async create(req, res) {
        try {
            let { name, password, email, status } = req.body;
            const verifyUser = await User.find({ email : email});
            if (verifyUser.length) { return res.status(200).send({message : 'Email já cadastrado no sistema' , user : false})};
            if(!password) {
                const newPassword = Math.floor(Math.random() * (9999 - 1111 + 1) + 111111);
                await Mail.sendPasswordEmail(newPassword, email);
                password = newPassword;
            }
            const user = await User.create({
                    name,
                    password,
                    email,
                    status
            });
            if(user) { 
                const token = jwt.sign({ id : user._id }, secret, {
                    expiresIn : 86400000,
                });
                user.password = null;
                return res.status(200).send({ user  , token  }) 
            };
        }catch(err) {
            return res.status(500).send(err.message);
        }
    };

    async update(req, res) {
        try {
            const { id } = req.params;
            const { user }  = req.body;
            if (!id) { return res.status(200).send('Não foi passado o Id do usuário'); }
            const userUpdated = await User.findOneAndUpdate({ "_id" : mongoose.Types.ObjectId(id)} , user);
            if(!userUpdated) { return res.status(200).send('Usuário não encontrado')};
            return res.status(200).send('Usuário atualizado com sucesso!');
        }catch(err) {
            return res.status(500).send(err.message);
        }
    };

    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id) { return res.status(200).send('Não foi passado o Id do usuário'); };
                const user = await User.deleteOne({ '_id' : id });
                if(!user) { return res.status(200).send('Usuário não encontrado')};
                return res.status(200).send('Usuário excluido com sucesso!');
        }catch(err) {
            return res.status(500).send(err.message);
        }
    };

    async getAll(req, res) {
        try {
            const users = await User.find().lean();
            if (!users) { return res.status(200).send('Não existe Usuários cadastrados na base')};
            return res.status(200).send(users);
        }catch(err) {
            return res.status(500).send(err.message);
        }
    }
}

module.exports =  new UserController();