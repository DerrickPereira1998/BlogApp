const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria.js')
const Categoria = mongoose.model('categorias')
require('../models/Postagem.js')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin.js') //COLOQUE eAdmin apos uma rota para requerir ser admin

router.get('/',(req,res) => {
    res.render('admin/index')
})

//CATEGORIAS
router.get('/categorias', (req, res) => {
    Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})
    }).catch((erro) => {
        req.flash('erro_msg', 'houve um erro ao listar as categorias')
        res.redirect('/admin')
    })
})

router.get('/add',(req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova',(req,res) => {
    //VALIDAÇÃO DE ERROS
    var erros = []

    if(req.body.nome.length == 0 || typeof req.body.nome.length == undefined){
        erros.push({texto: 'Nome invalido'})
    }

    if(req.body.slug.length == 0 || typeof req.body.slug == undefined){
        erros.push({texto: 'Slug invalido'})
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }
    else{
        //CODIGO USADO PARA CRIAR NOVA INSTANCIA
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg','Categoria criada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao criar categoria')
            res.redirect('/admin')
            console.log('Erro ao cadastrar categoria: '+erro)
        })}
})

//LINK PARA A PAGINA DE EDIÇÃO DE CATEGORIAS
router.get('/categorias/edit/:id', (req,res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategorias', {categoria:categoria})
    }).catch((erro) => {
        req.flash('error_msg','Esta categoria não existe')
        res.redirect('/admin/categorias')
    })
})

//AÇÃO DE EDITAR CATEGORIAS
router.post("/categorias/edit", (req,res) => {
    Categoria.findOne({_id:req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com successo')
            res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro interno ao salvar a ediçao categoria')
            res.redirect('/admin/categorias')
        })
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria')
        res.redirect('/admin/categorias')
    })
})

//AÇÃO DE DELETAR CATEGORIAS
router.post('/categorias/deletar', (req,res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', "Categoria deletada com sucesso!")
        res.redirect('/admin/categorias')
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao deletar categoria')
        res.redirect('/admin/categorias')
    })
})

//PAGINA DE POSTAGENS
router.get('/postagens', (req,res) => {

    Postagem.find().lean().populate('categoria').sort({data:'desc'}).then((postagens) =>{
        res.render('admin/postagens', {postagens: postagens})
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens: '+erro)
        res.redirect('/admin')
    })
})

router.get('/postagens/add', (req,res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((erro) => {
        req.flash('error_msg','Houve um erro ao recarregar o formulario')
        res.redirect("/admin")
    })
})

//Nova postagem
router.post('/postagens/nova', (req,res) => {

    var erros = []
    if(req.body.categoria == '0'){
        erros.push({texto: 'Categoria invalida, registre um categoria'})
    }

    if(erros.length > 0){
        res.render('admin/addpostagem', {erros:erros})
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
            res.redirect("/admin/postagens")
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro durante o salvamento da postagem: '+erro)
            res.redirect("/admin/postagens")
        })
    }
})

//ROTA PARA PAGINA DE EDIÇÃO DE POSTAGENS QUE PEGA AMBAS AS POSTAGENS E AS CATEGORIAS
router.get('/postagens/edit/:id', (req,res) =>{
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias,postagem: postagem})
        }).catch((erro) => {
            req.flash('error_msg','Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })

    }).catch((erro) => {
        req.flash('error_msg','Houve um erro ao carregar o formulario de edição de postagens')
        res.redirect('/admin/postagens')
    })
})

//ROTA PARA USADA PARA A AÇÃO DE EDITAR POSTAGENS NO BOTÃO DA PAGINA
router.post("/postagem/edit", (req,res) => {

    Postagem.findOne({_id:req.body.id}).then((postagem) => {
        
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        
        postagem.save().then(() => {
            res.flash('success_msg','Postagem editada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((erro) => {
            req.flash('error_msg','erro interno ao editar postagem: '+erro)
            res.redirect('/admin/postagens')
        })
    
    }).catch((erro) => {
        req.flash('error_msg','Houvee um erro ao salvar a edição')
        res.redirect('/admin/postagens')
    })
})

/*
//ROTA PARA DELEÇÃO DE POSTAGENS USANDO ROTA GET
router.get("/postagens/deletar/:id"), (req,res) => {
    Postagem.deleteOne({_id: req.params.id}).then(() => {
        res.redirect('/admin/postagens')
    })
}
*/

//AÇÃO DE DELETAR POSTAGENS
router.post('/postagens/deletar', (req,res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', "Postagem deletada com sucesso!")
        res.redirect('/admin/postagens')
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao deletar postagem')
        res.redirect('/admin/postagens')
    })
})

module.exports = router