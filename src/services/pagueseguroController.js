const pagseguro = require('pagseguro');
const pagseguroConfig = require('../config/pagseguro.js')
const Xml = require('jstoxml');;
const request = require('request-promise');
const parser = require('xml2js')

class PagSeguroController {
    constructor(){
        // const pag = new pagseguro({pagseguroConfig});
        // pag.currency('BRL');
        // pag.reference('12345');

        // pag.setRedirectURL("https://elobrother-app.web.app/payments/success");
        // pag.setNotificationURL("https://elobrother-app.web.app/payments");
    }

    async buy(req, res) {
    
        const { user } = req.body;
        const { product } = req.body;
        
        const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'

        const sender = {
            name: user.name,
            email: user.email,
            phone: {
                areaCode: '51',
                number: '12345678'
              }
        };

    	const item = {
    	    id: product.id,
    	    description: product.name,
    	    amount: product.price,
    	    quantity: 1,
    	    weight: 0
        };

        const obj = {};

        obj.items = [];
        obj.currency = 'BRL';
        obj.items.push({
            item
         });

        obj.redirectURL = "https://elobrother-app.web.app/sucesso-pagseguro"
        obj.notificationURL = "https://elobrother-app.web.app/sucesso-pagseguro"
        obj.sender = sender;

        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/xml; charset=UTF-8'
          }
        };
        
        options.uri = "https://ws.sandbox.pagseguro.uol.com.br/v2/checkout?email=" + pagseguroConfig.email + "&token=" + pagseguroConfig.token;
        options.body = xml + Xml.toXML({
          checkout: obj
        });
        let code = {};
        await request(options) 
                .then((res) => {
                parser.parseString(res, function (err, result) {
                    code.result = result.checkout.code[0];
              })}).catch((err)  => { 
                parser.parseString(err, function (err, result) {
                    code.err = err.message;
              })})
        return code;
    }
}

module.exports = new PagSeguroController();