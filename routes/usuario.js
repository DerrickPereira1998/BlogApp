const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const { application } = require('express')
const passport = require('passport')

router.get('/registro', (req,res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req,res) => {
    var erros =[]

    if(req.body.nome.lenght <= 0){
        erros.push({texto: 'Nome inválido'})
    }
    if(req.body.email.lenght <= 0){
        erros.push({texto: 'E-mail inválido'})
    }
    if(req.body.senha.lenght <= 0){
        erros.push({texto: 'Senha inválida'})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: 'Senha muito curta'})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'Senha diferentes, tente novamente'})
    }

    if(erros.lenght > 0){
        res.render('usuarios/registro', {erros: erros})
    }
    else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            console.log(erros.length)
            if(usuario){
                req.flash('error_msg', 'Ja existe uma conta com esse email')
                res.redirect('/usuarios/registro')
            }
            else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                console.log(novoUsuario.senha)
                //ENCRIPTANDO A SENHA
                bcrypt.genSalt(10, (erro,salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro,hash) => {
                        if(erro){
                            req.flash('error_msg','Houve um erro durante o salvamento do usuario')
                            res.redirect('/')
                        }
                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash('success_msg','Usuario cadastrado com sucesso!')
                            res.redirect('/')
                        }).catch((erro) => {
                            req.flash('error_msg','Erro ao cadastrar usuario: '+erro)
                            res.redirect('/usuarios/registro')
                        })
                    })
                })
            }
        }).catch((erro) => {
            req.flash('error_msg','Houve um erro interno')
            res.redirect('/')
        })
    }
})

router.get('/login', (req,res) => {
    res.render('usuarios/login')
})

router.post('/login', (req,res,next) => {
//AUTENTICAÇÃO DE LOGIN 
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req,res,next)

})

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err) }
        res.redirect('/')
      })
})

module.exports = router