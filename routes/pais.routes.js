const { Router } = require('express')
const { validarJWT } = require('../middlewares/validar-jwt')
const { esAdminRole } = require('../middlewares/validar-roles')
const {
    getPaises,
    getPaisById,
    getPaisByName,
    postPais,
    putPais,
    deletePais
} = require('../controllers/pais.controller')

const router = Router()

// Ruta para consultar todos los paises

router.get('/', getPaises)

// Ruta para consultar pais por id

router.get('/:id', getPaisById)

// Ruta para consultar pais por nombre
/* 
{
    nombre: String
}
*/

router.get('/nombre', getPaisByName)

// Ruta para crear pais | es necesario admin
/* 
{
    nombre: String (Req)
}
*/

router.post('/crear', [validarJWT, esAdminRole], postPais)

// Ruta para editar pais | es necesario admin
/* 
{
    nombre: String (Req)
}
*/

router.put('/editar/:id', [validarJWT, esAdminRole], putPais)

// Ruta para eliminar pais | es necesario admin

router.delete('/eliminar/:id', [validarJWT, esAdminRole], deletePais)

module.exports = router