const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    descricao:{
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        //EXEMPLO DE CRIAÇÃO DE CHAVES ESTRANGEIRAS
        type: Schema.Types.ObjectId,
        ref: "categorias"
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('postagens', Postagem)
