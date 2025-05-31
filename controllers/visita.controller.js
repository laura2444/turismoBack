const { request, response } = require('express');

const { visitaModel, famosoModel, sitioModel, Usuario } = require('../models');

const getVisitas = async (req = request, res = response) => {
    try {
        const visitas = await visitaModel.find()

        res.json({
            ok: true,
            data: visitas
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

const getVisitaById = async (req = request, res = response) => {
    const { id } = req.params

    try {

        const visita = await visitaModel.findOne({ _id: id })

        if (!visita) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro un visita con ese id"
            })
        }

        res.json({
            ok: true,
            data: visita
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

const postVisita = async (req = request, res = response) => {
    const nuevoVisita = new visitaModel(req.body)
    try {

        //const { usuario_id, famoso_id, sitio_id } = req.body

        const usuario_existe = await Usuario.findOne({ _id: nuevoVisita.usuario_id })

        if (!usuario_existe) {
            return res.status(406).json({
                ok: false,
                msg: "No existe un usuario con este id para vincular a visita"
            });
        }

        for (const famosoID of nuevoVisita.famoso_id){
            const famoso_existe = await famosoModel.findOne({ _id: famosoID })
            if (!famoso_existe) {
                return res.status(406).json({
                    ok: false,
                    msg: `No existe un famoso con id ${famosoID} para vincular a visita`
                });
            }
        }

        if (nuevoVisita.sitio_id != "") {
            const sitio_existe = await sitioModel.findOne({ _id: sitio_id })
            if (!sitio_existe) {
                return res.status(406).json({
                    ok: false,
                    msg: "No existe un sitio con este id para vincular a visita"
                });
            }
        }

        await nuevoVisita.save()

        res.status(201).json({
            ok: true,
            msg: 'Creado con exito'
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

const putVisita = async (req = request, res = response) => {
    const { id, reqUserId } = req.params
    try {

        const visita = await visitaModel.findOne({ _id: id })

        if (!visita) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro un visita con ese id"
            })
        }

        const { famoso_id, sitio_id } = req.body

        const usuario_existe = await Usuario.findOne({ _id: reqUserId }) // usuario que hace la peticion

        if (!usuario_existe) {
            return res.status(406).json({
                ok: false,
                msg: "No existe un usuario con este id para editar la visita"
            });
        }

        if (!(visita.usuario_id === reqUserId)){
            return res.status(403).json({
                ok:false,
                msg: "No tienes los derechos para editar esta visita"
            })
        }

        for (const famosoID of famoso_id){
            const famoso_existe = await famosoModel.findOne({ _id: famosoID })
            if (!famoso_existe) {
                return res.status(406).json({
                    ok: false,
                    msg: `No existe un famoso con id ${famosoID} para vincular a visita`
                });
            }
        }

        if (sitio_id != "") {
            const sitio_existe = await sitioModel.findOne({ _id: sitio_id })
            if (!sitio_existe) {
                return res.status(406).json({
                    ok: false,
                    msg: "No existe un sitio con este id para vincular a visita"
                });
            }
        }

        req.body.usuario_id = visita.usuario_id // Por si acaso se modifica por accidente usuario id del req

        await visitaModel.updateOne({ _id: id }, req.body)

        res.status(200).json({
            ok: true,
            msg: 'Actualizado con exito'
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

const deleteVisita = async (req = request, res = response) => {
    const { id, reqUserId } = req.params
    try {
        const visita = await visitaModel.findOne({ _id: id })

        if (!visita) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro un visita con ese id"
            })
        }

        const usuario_existe = await Usuario.findOne({ _id: reqUserId }) // usuario que hace la peticion

        if (!usuario_existe) {
            return res.status(406).json({
                ok: false,
                msg: "No existe un usuario con este id para eliminar la visita"
            });
        }

        if (!(visita.usuario_id === reqUserId) && !usuario_existe.admin){
            return res.status(403).json({
                ok:false,
                msg: "No tienes los derechos para eliminar esta visita"
            })
        }

        await visitaModel.deleteOne({ _id: id })

        res.status(200).json({
            ok: true,
            msg: "Eliminado con exito"
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

module.exports = {
    getVisitas,
    getVisitaById,
    postVisita,
    putVisita,
    deleteVisita
}