const { Router } = require('express')
const { validarJWT } = require('../middlewares/validar-jwt')
const { esAdminRole } = require('../middlewares/validar-roles')
const {
    getFamosos,
    getFamosoById,
    getFamosoByName,
    postFamoso,
    putFamoso,
    deleteFamoso
} = require('../controllers/famoso.controller')

const router = Router()

// Ruta para traer todos los famosos
router.get('/', getFamosos)

// Ruta para consultar famoso por id
router.get('/:id', getFamosoById)

// Ruta para consultar famoso por nombre
/* 
{
    nombre: String
}
*/

router.get('/nombre', getFamosoByName)

// Ruta para crear famoso | es necesario admin
/* 
{
    nombre: String, (Req)
    ciudad: String, (Req)
    categoria: String, (Req)
    descripcion: String,
    pais_id: String, (Req)
    img: String
} 
*/

router.post('/crear', [validarJWT, esAdminRole], postFamoso)

// Ruta para editar famoso | es necesario admin
/* 
{
    nombre: String, (Req)
    ciudad: String, (Req)
    categoria: String, (Req)
    descripcion: String,
    pais_id: String, (Req)
    img: String
}
*/

router.put('/editar/:id', [validarJWT, esAdminRole], putFamoso)

// Ruta para eliminar famoso | es necesario admin

router.delete('/eliminar/:id', [validarJWT, esAdminRole], deleteFamoso)

module.exports = router