const { request,response } = require('express');

const {famosoModel, paisModel} = require('../models');

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

        const famoso = await famosoModel.findOne({nombre:nombre})

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

const postFamoso = async (req=request,res=response)=>{
    const nuevoFamoso = new famosoModel(req.body)
    try{
        const famoso_existe = await famosoModel.findOne({nombre:nuevoFamoso.nombre})

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

module.exports={
    getFamosos,
    getFamosoById,
    getFamosoByName,
    postFamoso,
    putFamoso,
    deleteFamoso
}