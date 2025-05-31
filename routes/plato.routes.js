const { Router } = require('express')
const { validarJWT } = require('../middlewares/validar-jwt')
const { esAdminRole } = require('../middlewares/validar-roles')
const {
    getPlatos,
    getPlatoById,
    getPlatoByName,
    postPlato,
    putPlato,
    deletePlato
} = require('../controllers/plato.controller')

const router = Router()

// Ruta para traer platos

router.get('/', getPlatos)

// Ruta para traer plato por id

router.get('/:id', getPlatoById)

// Ruta para traer plato por nombre
/* 
{
    nombre: String
}
*/

router.get('/nombre', getPlatoByName)

// Ruta para crear plato | es necesario admin
/* 
{
    nombre: String, (Req)
    descripcion: String,
    precio: String,
    pais_id: String, (Req)
    sitio_id: [String], (Req) Por fefault es []
    img: String
}
*/

router.post('/crear', [validarJWT, esAdminRole], postPlato)

// Ruta para editar un plato | es necesario admin
/* 
{
    nombre: String, (Req)
    descripcion: String,
    precio: String,
    pais_id: String, (Req)
    sitio_id: [String], (Req) Por default es []
    img: String
}
*/

router.put('/editar/:id', [validarJWT, esAdminRole], putPlato)

// Ruta para eliminar plato | es necesario admin

router.delete('/eliminar/:id', [validarJWT, esAdminRole], deletePlato)

module.exports = router