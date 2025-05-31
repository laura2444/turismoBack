const {Schema,model} = require('mongoose')

const paisSchema = Schema({
    nombre:{
        type: String,
        required:[true, 'El nombre es obligatorio'],
        unique: true
    }
})

const paisModel = model('pais', paisSchema)

module.exports=paisModel