if(process.env.NODE_ENV == "production"){
    //module.exports
}
else{
    const DB_USER = 'derrickpereira1998'
    const DB_PASSWORD = encodeURIComponent('videogame')
    module.exports = {mongoURI: `mongodb+srv://${DB_USER}:${DB_PASSWORD}@derrick.kuoqczt.mongodb.net/teste?retryWrites=true&w=majority`}
}