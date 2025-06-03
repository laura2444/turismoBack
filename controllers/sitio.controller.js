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

        const sitio = await sitioModel.findOne({ nombre: { $regex: nombre, $options:'i' } })

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
        const pais_existe = await paisModel.findOne({ nombre: { $regex: pais, $options:'i' } })

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
        // PASO 1: Validar que existe el país
        const pais_existe = await paisModel.findOne({ 
            nombre: { $regex: pais, $options:'i' } 
        });

        if (!pais_existe) {
            return res.status(404).json({
                ok: false,
                msg: `No se encontró ningún país con el nombre ${pais}`
            });
        }

        console.log('País seleccionado:', pais_existe.nombre);
        console.log('ID del país:', pais_existe._id);

        // PASO 2: Obtener SOLO los sitios que pertenecen a este país
        const sitiosDelPais = await sitioModel.find({ 
            pais_id: pais_existe._id.toString() 
        });
        
        if (sitiosDelPais.length === 0) {
            return res.json({
                ok: true,
                data: [],
                msg: `No hay sitios registrados para el país ${pais}`
            });
        }

        console.log(`Sitios encontrados para ${pais}:`, sitiosDelPais.length);
        
        // PASO 3: Crear array de IDs de sitios del país
        const sitiosIds = sitiosDelPais.map(sitio => sitio._id.toString());
        console.log('IDs de sitios del país:', sitiosIds);

        // PASO 4: Usar método simple y confiable para evitar errores de agregación
        const visitasDelPais = await visitaModel.find({ 
            sitio_id: { $in: sitiosIds },
            sitio_id: { $ne: "" },
            sitio_id: { $ne: null }
        });

        console.log('Total de visitas encontradas:', visitasDelPais.length);

        if (visitasDelPais.length === 0) {
            return res.json({
                ok: true,
                data: [],
                msg: `No se encontraron visitas para sitios del país ${pais}`
            });
        }

        // PASO 5: Contar visitas manualmente para mayor control
        const conteoVisitas = {};
        visitasDelPais.forEach(visita => {
            const sitioId = visita.sitio_id;
            conteoVisitas[sitioId] = (conteoVisitas[sitioId] || 0) + 1;
        });

        console.log('Conteo de visitas por sitio:', conteoVisitas);

        // PASO 6: Crear mapa de sitios para acceso rápido
        const sitiosMap = {};
        sitiosDelPais.forEach(sitio => {
            sitiosMap[sitio._id.toString()] = sitio;
        });

        // PASO 7: Generar resultado final
        const resultados = Object.entries(conteoVisitas)
            .map(([sitioId, totalVisitas]) => {
                const sitio = sitiosMap[sitioId];
                
                // Verificación adicional para asegurar que el sitio pertenece al país
                if (!sitio || sitio.pais_id !== pais_existe._id.toString()) {
                    console.warn(`Sitio ${sitioId} no pertenece al país ${pais}`);
                    return null;
                }
                
                return {
                    sitio_id: sitioId,
                    nombre: sitio.nombre,
                    tipo: sitio.tipo,
                    descripcion: sitio.descripcion,
                    direccion: sitio.direccion,
                    ciudad: sitio.ciudad,
                    img: sitio.img,
                    coordenadas: sitio.coordenadas,
                    pais_id: sitio.pais_id, // Para debug
                    total_visitas: totalVisitas
                };
            })
            .filter(resultado => resultado !== null) // Filtrar nulls
            .sort((a, b) => b.total_visitas - a.total_visitas)
            .slice(0, 10);

        console.log('Resultados finales:', resultados.length);

        res.json({
            ok: true,
            data: resultados,
            total_sitios_con_visitas: resultados.length,
            pais_consultado: pais_existe.nombre
        });

    } catch (e) {
        console.log('Error en getTopSitiosVisitadosByPais:', e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador",
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

// VERSIÓN ALTERNATIVA CON AGREGACIÓN MEJORADA
const getTopSitiosVisitadosByPaisAgregacion = async (req = request, res = response) => {
    const { pais } = req.body;

    try {
        // Buscar el país
        const pais_existe = await paisModel.findOne({ 
            nombre: { $regex: pais, $options:'i' } 
        });

        if (!pais_existe) {
            return res.status(404).json({
                ok: false,
                msg: `No se encontró ningún país con el nombre ${pais}`
            });
        }

        // Agregación directa desde sitios para asegurar que todo pertenece al país
        const topSitios = await sitioModel.aggregate([
            // 1. Filtrar sitios del país específico
            {
                $match: {
                    pais_id: pais_existe._id.toString()
                }
            },
            // 2. Hacer lookup con visitas
            {
                $lookup: {
                    from: "visitas", // Nombre de tu colección de visitas
                    let: { sitio_id_str: { $toString: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$sitio_id", "$$sitio_id_str"] },
                                        { $ne: ["$sitio_id", ""] },
                                        { $ne: ["$sitio_id", null] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "visitas"
                }
            },
            // 3. Solo incluir sitios que tienen visitas
            {
                $match: {
                    "visitas.0": { $exists: true }
                }
            },
            // 4. Agregar conteo de visitas
            {
                $addFields: {
                    total_visitas: { $size: "$visitas" }
                }
            },
            // 5. Proyectar campos necesarios
            {
                $project: {
                    sitio_id: { $toString: "$_id" },
                    nombre: 1,
                    tipo: 1,
                    descripcion: 1,
                    direccion: 1,
                    ciudad: 1,
                    img: 1,
                    coordenadas: 1,
                    total_visitas: 1,
                    _id: 0
                }
            },
            // 6. Ordenar por visitas
            {
                $sort: { total_visitas: -1 }
            },
            // 7. Limitar a top 10
            {
                $limit: 10
            }
        ]);

        res.json({
            ok: true,
            data: topSitios,
            total_sitios_con_visitas: topSitios.length,
            pais_consultado: pais_existe.nombre
        });

    } catch (e) {
        console.log('Error en getTopSitiosVisitadosByPaisAgregacion:', e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador",
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

const getSitioByCiudad = async (req = request, res = response)=>{
    const {ciudad} = req.body
    try {
        const sitios = await sitioModel.find({ciudad:{ $regex: ciudad, $options:'i' }})

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

const postSitio = async (req = request, res = response) => {
    const nuevoSitio = new sitioModel(req.body)
    try {
        const sitio_existe = await sitioModel.findOne({ nombre: { $regex: nuevoSitio.nombre, $options:'i' } })

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
    getSitioByCiudad,
    postSitio,
    putSitio,
    deleteSitio
}