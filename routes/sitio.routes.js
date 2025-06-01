const { Router } = require('express')
const { validarJWT } = require('../middlewares/validar-jwt')
const { esAdminRole } = require('../middlewares/validar-roles')
const {
    getSitios,
    getSitioById,
    getSitioByName,
    getTopSitiosVisitadosByPais,
    postSitio,
    putSitio,
    deleteSitio
} = require('../controllers/sitio.controller')

const router = Router()

// Ruta para traer los sitios

router.get('/', getSitios)

// Ruta para traer sitio por id

router.get('/:id', getSitioById)

// Ruta para traer sitio por nombre
/* 
{
    nombre: String
}
*/
router.post('/nombre', getSitioByName)


// Top 10 sitios mas visitados por pais
/* 
{
    pais: String
}
*/
router.post('/top10porpais',getTopSitiosVisitadosByPais)

// Ruta para crear sitio | es necesario admin
/* 
{
    nombre: String, (Req)
    tipo:String, (Req)
    descripcion:String,
    direccion:String, (Req)
    ciudad:String, (Req)
    img:String,
    pais_id:String, (Req)
    plato_id: [String] por defaul es []
}
*/

router.post('/crear', [validarJWT, esAdminRole], postSitio)

// Ruta para editar sitio | es necesario admin
/* 
{
    nombre: String, (Req)
    tipo:String, (Req)
    descripcion:String,
    direccion:String, (Req)
    ciudad:String, (Req)
    img:String,
    pais_id:String, (Req)
    plato_id: [String] por default es []
}
*/

router.put('/editar/:id', [validarJWT, esAdminRole], putSitio)

// Ruta para eliminar sitio | es necesario admin

router.delete('/eliminar/:id', [validarJWT, esAdminRole], deleteSitio)

module.exports = router