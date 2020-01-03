module.exports =
{
    port : process.env.PORT || 3000,
    dbUrl : process.env.MONGO_URI || 'mongodb+srv://admin:admin@elobrother-q5r3f.mongodb.net/test?retryWrites=true&w=majority'
}