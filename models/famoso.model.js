const {Schema,model} = require('mongoose')

const famosoSchema = Schema({
    ciudad:{
        type: String,
        required: [true, 'Se necesita una ciudad para el famoso']
    },
    nombre:{
        type: String,
        required:[true, 'El nombre es obligatorio'],
        unique: true
    },
    categoria:{
        type: String,
        required: [true, 'Se necsita una categoria para el famoso']
    },
    descripcion:{
        type: String
    },
    pais_id:{
        type: String, // Pais ID
        require: [true, 'Es necesario un pais para famoso']
    },
    img:{
        type: String
    }
})

const famosoModel = model('famoso', famosoSchema)

module.exports=famosoModel