const {Schema,model} = require('mongoose')

const visitaSchema = Schema({
    famoso_id:{
        type: [String],
        //require: [true, 'El famaso es necesario para la visita']
    },
    usuario_id:{
        type: String,
        require: [true, 'El usuario es necesario para la visita']
    },
    sitio_id:{
        type: String,
        //require: [true, 'El sitio es necesario para la visita']
    },
    fecha:{
        type: Date,
        default: Date.now,
        require: [true, 'Es obligatorio la fecha de la visita']
    },
    comentario:{
        type: String,
        require: [true, 'Es obligatorio un comentario']
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