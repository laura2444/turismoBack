const { request,response } = require('express');

const {famosoModel, paisModel,visitaModel } = require('../models');

const getFamosos = async (req=request,res=response)=>{
    try{
        const famosos = await famosoModel.find()

        res.json({
            ok:true,
            data:famosos
        })
    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const getFamosoById = async (req=request,res=response)=>{
    const {id} = req.params

    try{

        const famoso = await famosoModel.findOne({_id:id})

        if (!famoso){
            return res.status(404).json({
                ok:false,
                msg: "No se encontro un famoso con ese id"
            })
        }

        res.json({
            ok:true,
            data:famoso
        })
    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const getFamosoByName = async (req=request,res=response)=>{
    const {nombre} = req.body

    try{    

        const famoso = await famosoModel.findOne({nombre:{ $regex: nombre, $options:'i' }})

        if (!famoso){
            return res.status(404).json({
                ok:false,
                msg: "No se encontro ningun famoso con ese nombre"
            })
        }

        res.json({
            ok:true,
            data:famoso
        })
    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const getFamosoByCategoria = async (req=request,res=response)=>{
    const { categoria } = req.body

    try{

        const famosos = await famosoModel.find({categoria:{ $regex: categoria, $options:'i' }})

        res.json({
            ok:true,
            data:famosos
        })

    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const getFamosoByCiudad = async (req=request,res=response)=>{
    const { ciudad } = req.body

    try{

        const famosos = await famosoModel.find({ciudad:{ $regex: ciudad, $options:'i' }})

        res.json({
            ok:true,
            data:famosos
        })

    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const getFamosoByPais = async (req=request,res=response)=>{
    const {pais} = req.body

    try{
        const pais_existe = await paisModel.findOne({nombre:{ $regex: pais, $options:'i' }})

        if(!pais_existe){
            return res.status(404).json({
                ok:false,
                msg: `No se encontro ningun pais con el nombre ${pais}`
            })
        }

        const famosos = await famosoModel.find({pais_id:pais_existe._id.toString()})

        res.json({
            ok:true,
            data:famosos
        })
    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const postFamoso = async (req=request,res=response)=>{
    const nuevoFamoso = new famosoModel(req.body)
    try{
        const famoso_existe = await famosoModel.findOne({nombre:{ $regex: nuevoFamoso.nombre, $options:'i' }})

        if (famoso_existe){
            return res.status(418).json({ok:false,
                msg: "Ya existe un famoso con este nombre"
            });
        }

        const pais_existe = await paisModel.findOne({_id:nuevoFamoso.pais_id})

        if (!pais_existe){
            return res.status(406).json({ok:false,
                msg: "No existe un pais con este id para vincular a famoso"
            });
        }

        await nuevoFamoso.save()

        res.status(201).json({ok:true,
            msg: 'Creado con exito'
        });

    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const putFamoso = async (req=request,res=response)=>{
    const {id} = req.params
    try{    

        const famoso = await famosoModel.findOne({_id:id})

        if(!famoso){
            return res.status(404).json({
                ok:false,
                msg: "No se encontro un famoso con ese id"
            })
        }

        const pais_existe = await paisModel.findOne({_id:req.body.pais_id})

        if (!pais_existe){
            return res.status(406).json({ok:false,
                msg: "No existe un pais con este id para vincular a famoso"
            });
        }
        
        await famosoModel.updateOne({_id:id}, req.body)

        res.status(201).json({ok:true,
            msg: 'Actualizado con exito'
        });

    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const deleteFamoso = async (req=request,res=response)=>{
    const {id} = req.params
    try{
        const famoso = await famosoModel.findOne({_id:id})

        if (!famoso){
            return res.status(404).json({
                ok:false,
                msg: "No se encontro un famoso con ese id"
            })
        }

        await famosoModel.deleteOne({_id:id})

        res.status(201).json({ok:true,
            msg: "Eliminado con exito"
        });

    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const getTop10FamososMasVisitados = async (req = request, res = response) => {
    try {
        // Agregación para contar visitas por famoso
        const topFamosos = await visitaModel.aggregate([
            // Filtrar documentos que tengan famoso_id como array no vacío
            { $match: { famoso_id: { $exists: true, $ne: [], $type: "array" } } },
            
            // Desenrollar el array de famoso_id para procesar cada ID individualmente
            { $unwind: "$famoso_id" },
            
            // Filtrar IDs válidos y no vacíos
            { $match: { famoso_id: { $ne: "", $ne: null, $exists: true } } },
            
            // Agrupar por famoso_id y contar las visitas
            {
                $group: {
                    _id: "$famoso_id",
                    totalVisitas: { $sum: 1 }
                }
            },
            
            // Ordenar por total de visitas de mayor a menor
            { $sort: { totalVisitas: -1 } },
            
            // Limitar a los top 10
            { $limit: 10 }
        ]);

        // Si no hay resultados después del agregado
        if (topFamosos.length === 0) {
            return res.status(200).json({
                ok: true,
                msg: "No se encontraron famosos con visitas registradas",
                data: [],
                total: 0
            });
        }

        // Obtener información completa de cada famoso
        const topFamososConInfo = await Promise.all(
            topFamosos.map(async (item, index) => {
                try {
                    const famoso = await famosoModel.findById(item._id);
                    return {
                        ranking: index + 1,
                        famoso_id: item._id,
                        nombre: famoso?.nombre || "Famoso no encontrado",
                        categoria: famoso?.categoria || "",
                        ciudad: famoso?.ciudad || "",
                        descripcion: famoso?.descripcion || "",
                        img: famoso?.img || "",
                        pais_id: famoso?.pais_id || "",
                        totalVisitas: item.totalVisitas
                    };
                } catch (error) {
                    console.log(`Error al obtener famoso ${item._id}:`, error);
                    return {
                        ranking: index + 1,
                        famoso_id: item._id,
                        nombre: "Error al cargar famoso",
                        categoria: "",
                        ciudad: "",
                        descripcion: "",
                        img: "",
                        pais_id: "",
                        totalVisitas: item.totalVisitas
                    };
                }
            })
        );

        res.json({
            ok: true,
            msg: "Top 10 famosos más visitados obtenido exitosamente",
            data: topFamososConInfo,
            total: topFamososConInfo.length
        });

    } catch (e) {
        console.log("Error en getTop10FamososMasVisitados:", e);
        res.status(500).json({
            ok: false,
            msg: "Error, contacte al administrador"
        });
    }
};

module.exports={
    getFamosos,
    getFamosoById,
    getFamosoByName,
    getFamosoByCategoria,
    getFamosoByCiudad,
    getFamosoByPais,
    postFamoso,
    putFamoso,
    deleteFamoso,
    getTop10FamososMasVisitados
}