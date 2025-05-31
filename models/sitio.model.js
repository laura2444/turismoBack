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
    }
})

const sitioModel = model('sitio', sitioSchema)

module.exports=sitioModel