module.exports =
{
    "mode": process.env.MODE_PAYPAL || 'sandbox',
    "client_id": process.env.CLIENTE_ID_PAYPAL || null,
    "client_secret": process.env.CLIENTE_SECRET_PLAYPAL || null
}