//LIVRARIAS IMPORTADAS
const express = require("express")//pega o express
const app = express()
const handlebars = require('express-handlebars')//pega o handlebars do tipo express
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')//UTILIZADO PARA AUTENTICAÇÃO DE USUARIOS
require('./config/auth')(passport)
//MODELS DE BASE DE DADOS
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
//ROTAS IMPORTADAS
const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')
//OUTROS
const path = require('path')
const {isAuth} = require('./helpers/eAdmin.js') //COLOQUE eAdmin apos uma rota para requerir ser admin
//const db = require("./config/db") //CONFIGURAÇÕES DE BASE DE DADOS

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
    if(process.env.NODE_ENV == "production"){ // PARA OUTROS AMBIENTES
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
    }
    else{ //PARA SERVIDOR LOCAL
        const DB_USER = 'derrickpereira1998'
        const DB_PASSWORD = encodeURIComponent('videogame')
        mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@derrick.kuoqczt.mongodb.net/teste?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("MongoDB conectado!");
        })
        .catch((erro) => {
            console.log("Erro ao conectar ao Mongo: " + erro);
        });
    }
    

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

    app.get('/addpostagem', (req,res) => {
        Categoria.find().lean().then((categorias) => {
            res.render('postagem/addpostagem', {categorias: categorias})
        }).catch((erro) => {
            req.flash('error_msg','Houve um erro ao recarregar o formulario')
            res.redirect("/")
        })
    })

    //Nova postagem
    app.post('/novapostagem', (req,res) => {

        var erros = []
        if(req.body.categoria == '0'){
            erros.push({texto: 'Categoria invalida, registre um categoria'})
        }

        if(erros.length > 0){
            res.render('postagem/addpostagem', {erros:erros})
        }
        else{
            const novaPostagem = {
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
                slug: req.body.slug
            }

            new Postagem(novaPostagem).save().then(() => {
                req.flash('success_msg', 'Postagem criada com sucesso')
                res.redirect("/")
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro durante o salvamento da postagem: '+erro)
                res.redirect("/")
            })
        }
    })

    app.get('/postagem/:titulo', (req,res) => {
        Postagem.findOne({titulo: req.params.titulo}).lean().then((postagem) => {
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

    app.get('/categorias', isAuth, (req,res) => {
        Categoria.find().lean().then((categorias) =>{
            res.render('categorias/index', {categorias:categorias})
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
            res.redirect('/')
        })
    })

    app.get('/addcategorias',(req, res) => {
        res.render('categorias/addcategorias')
    })

    app.post('/novacategorias',(req,res) => {
        //VALIDAÇÃO DE ERROS
        var erros = []
    
        if(req.body.nome.length == 0 || typeof req.body.nome.length == undefined){
            erros.push({texto: 'Nome invalido'})
        }
    
        if(req.body.slug.length == 0 || typeof req.body.slug == undefined){
            erros.push({texto: 'Slug invalido'})
        }
    
        if(erros.length > 0){
            res.render('addcategorias', {erros: erros})
        }
        else{
            //CODIGO USADO PARA CRIAR NOVA INSTANCIA
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
    
            new Categoria(novaCategoria).save().then(() => {
                req.flash('success_msg','Categoria criada com sucesso!')
                res.redirect('/categorias')
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao criar categoria')
                res.redirect('/')
                console.log('Erro ao cadastrar categoria: '+erro)
            })}
    })

    app.get('/categorias/:nome', (req,res) => {
        Categoria.findOne({nome: req.params.nome}).lean().then((categoria) => {
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

    //VIEWS
    app.use('/admin',admin)
    app.use('/usuarios', usuarios)

// PORTA 
const PORT = process.env.PORT || 8000
app.listen(PORT,'0.0.0.0',function(){
    console.log('Servido rodando!')
})