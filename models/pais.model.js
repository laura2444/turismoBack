const {Schema,model} = require('mongoose')

const paisSchema = Schema({
    nombre:{
        type: String,
        require:[true, 'El nombre es obligatorio']
    }
})

const paisModel = model('pais', paisSchema)

module.exports=paisModel