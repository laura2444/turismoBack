const { request, response } = require('express');

const { platoModel, paisModel, sitioModel } = require('../models');

const getPlatos = async (req = request, res = response) => {
    try {
        const platos = await platoModel.find()

        res.json({
            ok: true,
            data: platos
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

const getPlatoById = async (req = request, res = response) => {
    const { id } = req.params

    try {

        const plato = await platoModel.findOne({ _id: id })

        if (!plato) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro un plato con ese id"
            })
        }

        res.json({
            ok: true,
            data: plato
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

const getPlatoByName = async (req = request, res = response) => {
    const { nombre } = req.body

    try {

        const plato = await platoModel.findOne({ nombre: nombre })

        if (!plato) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro ningun plato con ese nombre"
            })
        }

        res.json({
            ok: true,
            data: plato
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        })
    }
}

const postPlato = async (req = request, res = response) => {
    const nuevoPlato = new platoModel(req.body)
    try {
        const plato_existe = await platoModel.findOne({ nombre: nuevoPlato.nombre })

        if (plato_existe) {
            return res.status(418).json({
                ok: false,
                msg: "Ya existe un plato con este nombre"
            });
        }

        const pais_existe = await paisModel.findOne({ _id: nuevoPlato.pais_id })

        if (!pais_existe) {
            return res.status(406).json({
                ok: false,
                msg: "No existe un pais con este id para vincular a plato"
            });
        }

        for (const sitioID of nuevoPlato.sitio_id) {
            const sitio_existe = await sitioModel.findOne({ _id: sitioID })
            if (!sitio_existe) {
                return res.status(406).json({
                    ok: false,
                    msg: `No existe un sitio con id ${sitioID} para vincular a plato`
                });
            }

            // accion para vincular a sitio automaticamente

            let platos_sitio = [...sitio_existe.plato_id]

            platos_sitio.push(nuevoPlato._id.toString())

            try {
                await sitioModel.updateOne({ _id: sitioID }, { plato_id: platos_sitio })
            } catch (e) {
                console.log(e);
                return res.status(500).json({
                    ok: false,
                    msg: `Error al enlazar plato ${nuevoPlato.nombre} automaticamente a sitio ${sitio_existe.nombre}`
                })
            }

        }

        await nuevoPlato.save()

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

const putPlato = async (req = request, res = response) => {
    const { id } = req.params
    try {

        const plato = await platoModel.findOne({ _id: id })

        if (!plato) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro un plato con ese id"
            })
        }

        const pais_existe = await paisModel.findOne({ _id: req.body.pais_id })

        if (!pais_existe) {
            return res.status(406).json({
                ok: false,
                msg: "No existe un pais con este id para vincular a sitio"
            });
        }

        for (const sitioID of req.body.sitio_id) {
            const sitio_existe = await sitioModel.findOne({ _id: sitioID })
            if (!sitio_existe) {
                return res.status(406).json({
                    ok: false,
                    msg: `No existe un sitio con id ${sitioID} para vincular a plato`
                });
            }

            // accion para vincular a sitio automaticamente

            let platos_sitio = [...sitio_existe.plato_id]

            const index = platos_sitio.indexOf(plato._id.toString())

            if (index == -1) {
                platos_sitio.push(plato._id.toString())
                try {
                    await sitioModel.updateOne({ _id: sitioID }, { plato_id: platos_sitio })
                } catch (e) {
                    console.log(e);
                    return res.status(500).json({
                        ok: false,
                        msg: `Error al enlazar plato ${plato.nombre} automaticamente a sitio ${sitio_existe.nombre}`
                    })
                }
            }
        }

        await platoModel.updateOne({ _id: id }, req.body)

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

const deletePlato = async (req = request, res = response) => {
    const { id } = req.params
    try {
        const plato = await platoModel.findOne({ _id: id })

        if (!plato) {
            return res.status(404).json({
                ok: false,
                msg: "No se encontro un plato con ese id"
            })
        }

        // Accion automatica para desvincular plato a sitio

        for (const sitioID of plato.sitio_id) {
            const sitio_existe = await sitioModel.findOne({ _id: sitioID })
            if (!sitio_existe) {
                return res.status(406).json({
                    ok: false,
                    msg: `No existe un sitio con id ${sitioID} para desvincular a plato`
                });
            }

            let platos_sitio = [...sitio_existe.plato_id]

            const index = platos_sitio.indexOf(plato._id.toString().toString())

            if (index !== -1) platos_sitio.splice(index, 1) // remover al indice "index" 1 enlemento

            try {
                await sitioModel.updateOne({ _id: sitioID }, { plato_id: platos_sitio })
            } catch (e) {
                console.log(e);
                return res.status(500).json({
                    ok: false,
                    msg: `Error al eliminar plato ${plato.nombre} automaticamente de sitio ${sitio_existe.nombre}`
                })
            }
        }

        await platoModel.deleteOne({ _id: id })

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
    getPlatos,
    getPlatoById,
    getPlatoByName,
    postPlato,
    putPlato,
    deletePlato
}