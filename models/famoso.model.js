const {Schema,model} = require('mongoose')

const famosoSchema = Schema({
    ciudad:{
        type: String,
        require: [true, 'Se necesita una ciudad para el famoso']
    },
    nombre:{
        type: String,
        require:[true, 'El nombre es obligatorio']
    },
    categoria:{
        type: String,
        require: [true, 'Se necsita una categoria para el famoso']
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