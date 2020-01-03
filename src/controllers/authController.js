const jwt = require('jsonwebtoken');
const secret = require('../config/auth.js').secret;
const User = require('../models/User');

async function verifyToken(req, res, next){
    let auth =  req.headers.authorization;
    if (!auth) {
        return res.status(401).send({ auth: false, message: 'Token não encontrado' });
    }
    jwt.verify(auth, secret, async (err, data) =>{
        if(err){
        return res.status(401).send({ message : 'Autenticação    não é valida'});
        }
        next();
    });
 }

 async function verifyAdmin(req, res, next) {
    const user = await User.find(req.body.userId);
    if(!user.status === 'ADMIN') { return res.status(401).send({ message : 'Apenas Administradores podem chamar essas rotas'})}
    next();
 }
 module.exports = { verifyToken, verifyAdmin }