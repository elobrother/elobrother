const Mail = require('../services/mail');
//const logo = require('../assets/img/logo.png')

class MailController {    
    async sendMail(req, res) {
        const { email, message, name } = req.body;
        const emailTosend = {
            from: email,
            to : 'wogeladerne@gmail.com',
            subject: `Mensagem do ${name}`,
            text: '',
            html: `<h1>${message}</h1>`
        }
        await Mail.sendMail(emailTosend);
        return res.status(200).send({ message : 'Email enviado com sucesso'});
    }

    async dropOutsMail(order, description, userName) {
        const email = {
            from: 'noreply@elobrother.com',
            to : 'wogeladerne@gmail.com',
            subject: 'Desistencia no Pedido',
            text: '',
            html: `<h1>Houve uma desistencia no pedido número : ${order.code}, pelo jogador ${userName} o motivo foi ${description}</h1>`
        }
        await Mail.sendMail(email);
    }

    async orderFinished(code, userEmail) {
        const email = {
            from: 'noreply@elobrother.com',
            to : 'wogeladerne@gmail.com',
            subject: 'Pedido Concluído',
            text: '',
            html: `<h1>O seu pedido com o código ${code} foi concluído :)</h1>`
        }
        await Mail.sendMail(email);
    }

    async sendNotificationToAdm(code, playerEmail) {
        const email = {
            from: 'noreply@elobrother.com',
            to : 'wogeladerne@gmail.com',
            subject: 'Pedido Concluído',
            text: '',
            html: `<h1>O pedido com o código ${code} foi concluído pelo jogador com o email ${playerEmail} </h1>`
        }
        await Mail.sendMail(email);
    }
    
    async sendPasswordEmail(newPassword, userEmail) {
        const email = {
            from: 'noreply@elobrother.com',
            to : 'wogeladerne@gmail.com',//userEmail,
            subject: 'Criação de conta',
            text: '',
            html: `<h1 style="color:red">Sua nova senha ${newPassword}</h1>`
        }
        await Mail.sendMail(email)
    }

    async sendUserCancelOrderEmail(userEmail, orderCode, description) {
        const content = {
            from: userEmail,
            to : 'wogeladerne@gmail.com',
            subject: 'Cliente pedendo desistencia do pedido',
            text: '',
            html: `<h1>O cliente ${userEmail} está pedindo o cancelamento do pedido com o código ${orderCode}, motivo : ${description} </h1>`
        }
        await Mail.sendMail(content)
    }
}

module.exports = new MailController();