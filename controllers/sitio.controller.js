const { request, response } = require('express');

const { sitioModel, paisModel, platoModel, visitaModel } = require('../models');

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

        const sitio = await sitioModel.findOne({ nombre: nombre })

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

const getSitiosByPais = async (req = request, res = response) => {
    const { pais } = req.body

    try {
        const pais_existe = await paisModel.findOne({ nombre: pais })

        if (!pais_existe) {
            return res.status(404).json({
                ok: false,
                msg: `No se encontro ningun pais con el nombre ${pais}`
            })
        }

        const sitios = await sitioModel.find({ pais_id: pais_existe._id.toString() })

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

const getTopSitiosVisitadosByPais = async (req = request, res = response) => {
    const { pais } = req.body

    try {
        const pais_existe = await paisModel.findOne({ nombre: pais })

        if (!pais_existe) {
            return res.status(404).json({
                ok: false,
                msg: `No se encontro ningun pais con el nombre ${pais}`
            })
        }

        const sitios = await sitioModel.find({ pais_id: pais_existe._id.toString() })

        // Debug: verificar si hay sitios
        console.log('Sitios encontrados:', sitios.length);
        
        if (sitios.length === 0) {
            return res.json({
                ok: true,
                data: [],
                msg: `No hay sitios registrados para el país ${pais}`
            });
        }

        const sitiosIds = sitios.map(sitio => sitio._id.toString());
        console.log('IDs de sitios:', sitiosIds);

        // Debug: verificar visitas totales
        const totalVisitas = await visitaModel.countDocuments();
        console.log('Total de visitas en la BD:', totalVisitas);

        // Debug: verificar visitas con sitio_id
        const visitasConSitio = await visitaModel.countDocuments({ 
            sitio_id: { $ne: "" } 
        });
        console.log('Visitas con sitio_id:', visitasConSitio);

        // Agregación mejorada para contar visitas por sitio
        const topSitios = await visitaModel.aggregate([
            {
                $match: {
                    sitio_id: { $in: sitiosIds },
                    sitio_id: { $ne: "" } // Excluir visitas sin sitio
                }
            },
            {
                $group: {
                    _id: '$sitio_id',
                    total_visitas: { $sum: 1 }
                }
            },
            {
                $sort: { total_visitas: -1 }
            },
            {
                $limit: 10
            }
        ]);

        console.log('Resultado de agregación básica:', topSitios);

        // Si no hay resultados, intentar una consulta más simple
        if (topSitios.length === 0) {
            // Verificar si hay visitas para cualquiera de estos sitios
            const visitasParaSitios = await visitaModel.find({ 
                sitio_id: { $in: sitiosIds } 
            });
            
            console.log('Visitas directas encontradas:', visitasParaSitios.length);
            
            return res.json({
                ok: true,
                data: [],
                debug: {
                    paisEncontrado: !!pais_existe,
                    totalSitios: sitios.length,
                    totalVisitas: totalVisitas,
                    visitasConSitio: visitasConSitio,
                    visitasParaEstePais: visitasParaSitios.length,
                    sitiosIds: sitiosIds
                }
            });
        }

        // Si hay resultados, hacer el lookup completo
        const topSitiosCompletos = await visitaModel.aggregate([
            {
                $match: {
                    sitio_id: { $in: sitiosIds },
                    sitio_id: { $ne: "" }
                }
            },
            {
                $group: {
                    _id: '$sitio_id',
                    total_visitas: { $sum: 1 }
                }
            },
            {
                $sort: { total_visitas: -1 }
            },
            {
                $limit: 10
            },
            {
                $addFields: {
                    sitio_object_id: { $toObjectId: '$_id' }
                }
            },
            {
                $lookup: {
                    from: 'sitios', // Asegúrate de que este sea el nombre correcto
                    localField: 'sitio_object_id',
                    foreignField: '_id',
                    as: 'sitio'
                }
            },
            {
                $unwind: {
                    path: '$sitio',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    sitio_id: '$_id',
                    nombre: '$sitio.nombre',
                    tipo: '$sitio.tipo',
                    descripcion: '$sitio.descripcion',
                    direccion: '$sitio.direccion',
                    ciudad: '$sitio.ciudad',
                    img: '$sitio.img',
                    total_visitas: 1
                }
            }
        ]);

        res.json({
            ok: true,
            data: topSitiosCompletos
        });

    } catch (e) {
        console.log('Error en getTopSitiosVisitadosByPais:', e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador",
            error: e.message
        })
    }
}

const postSitio = async (req = request, res = response) => {
    const nuevoSitio = new sitioModel(req.body)
    try {
        const sitio_existe = await sitioModel.findOne({ nombre: nuevoSitio.nombre })

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

        for (const platoID of nuevoSitio.plato_id) {
            const plato_existe = await platoModel.findOne({ _id: platoID })
            if (!plato_existe) {
                return res.status(406).json({
                    ok: false,
                    msg: `No existe un plato con id ${platoID} para vincular a sitio`
                });
            }

            // Accion automatica para vincular sitio a cada plato

            let sitios_plato = [...plato_existe.sitio_id]

            sitios_plato.push(nuevoSitio._id.toString())

            try {
                await platoModel.updateOne({ _id: platoID }, { sitio_id: sitios_plato })
            } catch (e) {
                console.log(e);
                return res.status(500).json({
                    ok: false,
                    msg: `Error al enlazar sitio ${nuevoSitio.nombre} automaticamente a plato ${plato_existe.nombre}`
                })
            }
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

        for (const platoID of req.body.plato_id) {
            const plato_existe = await platoModel.findOne({ _id: platoID })
            if (!plato_existe) {
                return res.status(406).json({
                    ok: false,
                    msg: `No existe un plato con id ${platoID} para vincular a sitio`
                });
            }

            // Accion automatica para vincular sitio a cada plato

            let sitios_plato = [...plato_existe.sitio_id]

            const index = sitios_plato.indexOf(sitio._id.toString())

            if (index == -1) {
                sitios_plato.push(sitio._id.toString())

                try {
                    await platoModel.updateOne({ _id: platoID }, { sitio_id: sitios_plato })
                } catch (e) {
                    console.log(e);
                    return res.status(500).json({
                        ok: false,
                        msg: `Error al enlazar sitio ${sitio.nombre} automaticamente a plato ${plato_existe.nombre}`
                    })
                }
            }
        }

        await sitioModel.updateOne({ _id: id }, req.body)

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

        for (const platoID of sitio.plato_id) {
            const plato_existe = await platoModel.findOne({ _id: platoID })
            if (!plato_existe) {
                return res.status(406).json({
                    ok: false,
                    msg: `No existe un plato con id ${platoID} para desvincular a sitio`
                });
            }

            let sitios_plato = [...plato_existe.sitio_id]

            const index = sitios_plato.indexOf(sitio._id.toString())

            if (index !== -1) sitios_plato.splice(index, 1) // remover al indice "index" 1 enlemento

            try {
                await platoModel.updateOne({ _id: platoID }, { sitio_id: sitios_plato })
            } catch (e) {
                console.log(e);
                return res.status(500).json({
                    ok: false,
                    msg: `Error al desenlazar sitio ${sitio.nombre} automaticamente a plato ${plato_existe.nombre}`
                })
            }
        }

        await sitioModel.deleteOne({ _id: id })

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
    getSitios,
    getSitioById,
    getSitioByName,
    getSitiosByPais,
    getTopSitiosVisitadosByPais,
    postSitio,
    putSitio,
    deleteSitio
}