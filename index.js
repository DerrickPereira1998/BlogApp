const express = require("express")//pega o express
const app = express()
const handlebars = require('express-handlebars')//pega o handlebars do tipo express
const bodyParser = require('body-parser')
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)

//CONFIGURAÇÕES
    //SESSION
    app.use(session({
        secret: 'cursodenode',
        resave:true,
        saveUninitialized:true
    }))

    //TEM QUE FICAR NESSA ORDEM OU DA PROBLEMA(SESSAO, PASSPORT, FLASH)
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    app.use(flash())
    //MIDDLEWARE
    app.use((req,res,next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null;
        next() //PASSA A REQUISIÇÃO, USE SE NÃO INICIA LOOP INFINITO!
    })


    //TEMPLATE ENGINE HANDLEBARS, SELECIONA O MAIN COMO LAYOUT PRINCIPAL
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

//BODYPARSER
    app.use(bodyParser.urlencoded({extended: false}))
    app.use(bodyParser.json())

//MONGOOSE
    mongoose.Promise = global.Promise;

    const DB_USER = 'derrickpereira1998'
    const DB_PASSWORD = encodeURIComponent('videogame')

    mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@derrick.kuoqczt.mongodb.net/teste?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("MongoDB conectado!");
    })
    .catch((err) => {
        console.log("Erro ao conectar ao Mongo: " + err);
    });

//PUBLIC
    app.use(express.static(path.join(__dirname,'public')))
    //__dirname PEGA O CAMINHO ABSOLUTO DA PASTA PUBLIC

//ROTAS
    app.get('/',(req,res) => {
        Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
            res.render('index', {postagens: postagens})
        }).catch((erro) => {
            req.flash('error_msg','Houve um erro interno: '+erro)
            res.redirect('/404')
        })
    })

    app.get('/postagem/:slug', (req,res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render('postagem/index', {postagem:postagem})  
            }
            else{
                req.flash('error_msg', 'Esta postagem não existe!')
                res.redirect('/')
            }
        }).catch(erro => {
            req.flash('error_msg','Houve um erro interno')
        })
    })

    app.get('/categorias',(req,res) => {
        Categoria.find().lean().then((categorias) =>{
            res.render('categorias/index', {categorias:categorias})
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req,res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render('categorias/postagens', {categoria:categoria,postagens: postagens})
                }).catch((erro) => {
                    req.flash('error_msg','Houve um erro ao listar os posts')
                    res.redirect('/')
                })
            }
            else{
                req.flash('error_msg', 'Esta categoria não existe!')
                res.redirect('/')
            }
        }).catch(erro => {
            req.flash('error_msg','Houve um erro interno')
        })
    })

    app.get('/404', (req,res) => {
        res.send('ERRO 404!')
    })

    app.use('/admin',admin)
    app.use('/usuarios', usuarios)

// PORTA 
const PORT = 8080
app.listen(PORT,function(){
    console.log('Servido rodando!')
})