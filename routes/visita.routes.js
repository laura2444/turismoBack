const { Router } = require('express')
const { validarJWT } = require('../middlewares/validar-jwt')
const {
    getVisitas,
    getVisitaById,
    getVisitasByUsuarioId,
    getVisitasBySitio,
    postVisita,
    putVisita,
    deleteVisita
} = require('../controllers/visita.controller')

const router = Router()

/*
    Los controllers de visita debido a un escenario especial donde tanto usuarios dueños
    de la visita y administradores pueden interactuar con las visitas no se usa
    validar-rol
*/

// Ruta para traer visitas

router.get('/', getVisitas)

// Ruta para trear visita por id

router.get('/:id', getVisitaById)

// Ruta para traer visitas por usuario id
/* 
{
    usuario_id: String
}
*/

router.post('/usuario',getVisitasByUsuarioId)

// Ruta para traer visitas por nombre sitio
/* 
{
    sitio: String
}
*/

router.post('/sitio',getVisitasBySitio)

// Ruta para crear visita
/* 
{
    usuario_id: String, (Req)
    famoso_id: [String], por default es []
    sitio_id: String,
    fecha: Date, (Req) Toma un valor por defecto no es necesario declararlo creo
    comentario: String, (Req)
    img: String,
    qr_code: String,
    coordenadas: String
}
*/

router.post('/crear', [validarJWT], postVisita)

// Ruta para editar visita | se recomienda NO MODIFICAR USUARIO_ID | necesita el id del usuario que hace el request
/* 
{
    famoso_id: [String], por default es []
    sitio_id: String,
    fecha: Date, (Req) Toma un valor por defecto no es necesario declararlo creo
    comentario: String, (Req)
    img: String,
    qr_code: String,
    coordenadas: String
}
*/

router.put('/editar/:id/:reqUserId', [validarJWT], putVisita)

// Ruta para eliminar visita | necesita el id del usuario que hace el request

router.delete('eliminar/:id/:reqUserId', [validarJWT], deleteVisita)

module.exports = router