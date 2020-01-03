const nodemailer = require('nodemailer');
const { SENDGRID_API_USER, SENDGRID_API_PASSWORD } = require('../config/mailConfig');

class Mail  {
    constructor() {
        const options = {
            service: 'SendGrid',
            auth: {
                user: SENDGRID_API_USER,
                pass: SENDGRID_API_PASSWORD
            }
        }
        this.client = nodemailer.createTransport(options);

    }

    async sendMail(email) {
        await this.client.sendMail(email, (err, info) => {
            if(err) {
                console.error(err);
                return;
            }
            console.log(`Resposta do sendMail : ${info.response}`);
        })
    }

}

module.exports = new Mail();
