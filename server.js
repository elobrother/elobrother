const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const hemlet = require('helmet');
const { port, dbUrl} = require('./src/config/config')

const router = express.Router();

const server = express();
const app = require('http').Server(server);
const io = require('socket.io')(app);
const connectedUsers = {}


io.on('connection', (socket) => {
    const { user } = socket.handshake.query
    connectedUsers[user] = socket.id;
})

server.use((req,res,next)=> {
    req.io = io;
    req.io.connectedUsers = connectedUsers;
    next();
});

mongoose.connect(dbUrl,{ useNewUrlParser: true })
.then(() =>   app.listen(port, () => {
    console.log('Server running on port 3000');
}))
.catch((err) => {
    console.error(err)
    process.exit(1);
})

const userRouter =  require('./src/routes/userRouter.js');
const orderRouter =  require('./src/routes/orderRouter.js');
const cupomRouter =  require('./src/routes/cupomRouter.js');
const paypalRouter = require('./src/routes/paypalRouter.js');
const mercadoPago = require('./src/routes/mercadopagoRouter.js');
const sendMail = require('./src/routes/sendMailRouter.js');
const eloRouter = require('./src/routes/elosRouter.js');
const adminRouter = require('./src/routes/adminRouter.js');

server.use(cors());
server.use(bodyParser.json());
server.use(hemlet());

server.use('/api', router);

router.use('/user', userRouter);
router.use('/order', orderRouter);
router.use('/cupom', cupomRouter);
router.use('/paypal', paypalRouter);
router.use('/mercadopago', mercadoPago);
router.use('/sendMail', sendMail);
router.use('/elos', eloRouter);
router.use('/admin', adminRouter);
