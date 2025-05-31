const {Schema,model} = require('mongoose')

const sitioSchema = Schema({
    nombre:{
        type: String,
        required: [true, 'Es obligatorio el nombre'],
        unique: true
    },
    tipo:{
        type: String,
        required: [true, 'El tipo es necesario para Sitio']
    },
    descripcion:{
        type: String,
    },
    direccion:{
        type: String,
        required: [true, 'Es obligatorio la direccion']
    },
    ciudad:{
        type: String,
        required: [true, 'Es obligatorio la ciudad']
    },
    img:{
        type: String
    },
    pais_id:{
        type: String,
        required: [true, 'Es necesario un pais para un sitio']
    },
    plato_id:{
        type: [String],
        default: []
    }
})

const sitioModel = model('sitio', sitioSchema)

module.exports=sitioModel