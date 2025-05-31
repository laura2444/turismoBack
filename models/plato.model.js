const {Schema,model} = require('mongoose')

const platoSchema = Schema({
    nombre:{
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    descripcion:{
        type: String
    },
    precio:{
        type: Double
    },
    pais_id:{
        type: String,
        required: [true, 'Es necesario un pais para plato']
    },
    sitio_id:{
        type: [String],
        default: [],
        required: [true, 'Es necesario un sitio para plato']
    },
    img:{
        type: String
    }
})

const platoModel = model('plato', platoSchema)

module.exports=platoModel