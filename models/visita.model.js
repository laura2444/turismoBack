const {Schema,model} = require('mongoose')

const visitaSchema = Schema({
    famoso_id:{
        type: [String],
        defaul: []
        //required: [true, 'El famaso es necesario para la visita']
    },
    usuario_id:{
        type: String,
        required: [true, 'El usuario es necesario para la visita']
    },
    sitio_id:{
        type: String,
        //required: [true, 'El sitio es necesario para la visita']
    },
    fecha:{
        type: Date,
        default: Date.now,
        required: [true, 'Es obligatorio la fecha de la visita']
    },
    comentario:{
        type: String,
        required: [true, 'Es obligatorio un comentario']
    },
    img:{
        type: String
    },
    qr_code:{
        tyoe: String
    },
    coordenadas:{ // no puede haber coordenadas sin qr
        type: String
    }
})

const visitaModel = model('visita', visitaSchema)

module.exports=visitaModel