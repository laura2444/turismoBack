const { request, response } = require('express');

const { sitioModel, paisModel, platoModel } = require('../models');

const getSitios = async (req = request, res = response) => {
    try {
        const sitios = await sitioModel.find()

        res.json({
            ok: true,
            data: sitios
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

const getSitioById = async (req = request, res = response) => {
    const { id } = req.params

    try {

        const sitio = await sitioModel.findOne({ _id: id })

        if (!sitio) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro un sitio con ese id"
            })
        }

        res.json({
            ok: true,
            data: sitio
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

const getSitioByName = async (req = request, res = response) => {
    const { nombre } = req.body

    try {

        const sitio = await sitioModel.find({ nombre: nombre })

        if (!sitio) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro ningun sitio con ese nombre"
            })
        }

        res.json({
            ok: true,
            data: sitio
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

const postSitio = async (req = request, res = response) => {
    const nuevoSitio = new sitioModel(req.body)
    try {
        const sitio_existe = await sitioModel.find({ nombre: nuevoSitio.nombre })

        if (sitio_existe) {
            return res.status(418).json({
                ok: false,
                msg: "Ya existe un sitio con este nombre"
            });
        }

        const pais_existe = await paisModel.findOne({ _id: nuevoSitio.pais_id })

        if (!pais_existe) {
            return res.status(406).json({
                ok: false,
                msg: "No existe un pais con este id para vincular a sitio"
            });
        }

        let plato_status = null


        nuevoSitio.plato_id.forEach(async (platoId) => {
            const plato_existe = await platoModel.findOne({ _id: platoId })
            if (!plato_existe) {
                plato_status = res.status(406).json({
                    ok: false,
                    msg: `No existe un plato con id ${platoId} para vincular a sitio`
                });

                return null
            }

            // Accion automatica para vincular sitio a cada plato

            let sitios_plato = plato_existe.sitio_id

            sitios_plato.push(nuevoSitio._id)

            try {
                await platoModel.updateOne({ _id: platoId }, { sitio_id: sitios_plato })
            } catch (e) {
                console.log(e);
                plato_status = res.status(500).json({
                    ok: false,
                    msg: `Error al enlazar sitio ${nuevoSitio.nombre} automaticamente a plato ${plato_existe.nombre}`
                })

                return null
            }
        })

        if (plato_status != null) {
            return plato_status
        }

        await nuevoSitio.save()

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

const putSitio = async (req = request, res = response) => {
    const { id } = req.params
    try {

        const sitio = await sitioModel.findOne({ _id: id })

        if (!sitio) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro un sitio con ese id"
            })
        }

        const pais_existe = await paisModel.findOne({ _id: req.body.pais_id })

        if (!pais_existe) {
            return res.status(406).json({
                ok: false,
                msg: "No existe un pais con este id para vincular a sitio"
            });
        }

        let plato_status = null


        req.body.plato_id.forEach(async (platoID) => {
            const plato_existe = await platoModel.findOne({ _id: platoID })
            if (!plato_existe) {
                plato_status = res.status(406).json({
                    ok: false,
                    msg: `No existe un plato con id ${platoID} para vincular a sitio`
                });

                return null
            }

            // Accion automatica para vincular sitio a cada plato

            let sitios_plato = plato_existe.sitio_id

            const index = platos_sitio.indexOf(sitio._id)

            if (index == -1) {
                sitios_plato.push(sitio._id)

                try {
                    await platoModel.updateOne({ _id: platoID }, { sitio_id: sitios_plato })
                } catch (e) {
                    console.log(e);
                    plato_status = res.status(500).json({
                        ok: false,
                        msg: `Error al enlazar sitio ${sitio.nombre} automaticamente a plato ${plato_existe.nombre}`
                    })

                    return null
                }
            }
        })

        if (plato_status != null) {
            return plato_status
        }

        await sitioModel.updateOne({ _id: id }, req.body)

        res.status(201).json({
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

const deleteSitio = async (req = request, res = response) => {
    const { id } = req.params
    try {
        const sitio = await sitioModel.findOne({ _id: id })

        if (!sitio) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro un sitio con ese id"
            })
        }

        // Accion para cuando se elimina un sitio eliminarse de los platos relacionados

        let plato_status = null

        sitio.plato_id.forEach(async (platoID) => {
            const plato_existe = await platoModel.findOne({ _id: platoID })
            if (!plato_existe) {
                plato_status = res.status(406).json({
                    ok: false,
                    msg: `No existe un plato con id ${platoID} para desvincular a sitio`
                });

                return null
            }

            let sitios_plato = plato_existe.sitio_id

            const index = platos_sitio.indexOf(sitio._id)

            sitios_plato.splice(index, 1) // remover al indice "index" 1 enlemento

            try {
                await platoModel.updateOne({ _id: platoID }, { sitio_id: sitios_plato })
            } catch (e) {
                console.log(e);
                plato_status = res.status(500).json({
                    ok: false,
                    msg: `Error al desenlazar sitio ${sitio.nombre} automaticamente a plato ${plato_existe.nombre}`
                })

                return null
            }
        })

        if (plato_status != null){
            return plato_status
        }

        await sitioModel.deleteOne({ _id: id })

        res.status(201).json({
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
    getSitios,
    getSitioById,
    getSitioByName,
    postSitio,
    putSitio,
    deleteSitio
}