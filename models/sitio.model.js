const {Schema,model} = require('mongoose')

const sitioSchema = Schema({
    nombre:{
        type: String,
        require: [true, 'Es obligatorio el nombre']
    },
    tipo:{
        type: String,
        require: [true, 'El tipo es necesario para Sitio']
    },
    descripcion:{
        type: String,
    },
    direccion:{
        type: String,
        require: [true, 'Es obligatorio la direccion']
    },
    ciudad:{
        type: String,
        require: [true, 'Es obligatorio la ciudad']
    },
    img:{
        type: String
    },
    pais_id:{
        type: String,
        require: [true, 'Es necesario un pais para un sitio']
    },
    plato_id:{
        type: [String],
        default: []
    }
})

const sitioModel = model('sitio', sitioSchema)

module.exports=sitioModel