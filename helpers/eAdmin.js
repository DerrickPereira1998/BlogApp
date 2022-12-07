module.exports = {
    eAdmin: function(req,res,next){

        if(req.isAuthenticated() && req.user.admin == 1){
            return next();
        }

        req.flash('error_msg','Voce deve ser um admin para acessar esta pagina')
        res.redirect('/')
    },
    isAuth: function(req,res,next){

        if(req.isAuthenticated()){
            return next();
        }

        req.flash('error_msg','Voce deve estar logado em uma conta para utilizar esta pagina')
        res.redirect('/usuarios/login')
    },
}