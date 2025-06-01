const { request,response } = require('express');

const {paisModel} = require('../models');

const getPaises = async (req=request,res=response)=>{
    try{
        const paises = await paisModel.find()

        res.json({
            ok:true,
            data:paises
        })
    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const getPaisById = async (req=request,res=response)=>{
    const {id} = req.params

    try{

        const pais = await paisModel.findOne({_id:id})

        if (!pais){
            return res.status(404).json({
                ok:false,
                msg: "No se encontro un pais con ese id"
            })
        }

        res.json({
            ok:true,
            data:pais
        })
    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const getPaisByName = async (req=request,res=response)=>{
    const {nombre} = req.body

    try{    

        const pais = await paisModel.findOne({nombre:{ $regex: nombre, $options:'i' }})

        if (!pais){
            return res.status(404).json({
                ok:false,
                msg: "No se encontro ningun pais con ese nombre"
            })
        }

        res.json({
            ok:true,
            data:pais
        })
    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,
            msg:"Error, contacte al administrador"
        })
    }
}

const postPais = async (req=request,res=response)=>{
    const nuevoPais = new paisModel(req.body)
    try{
        const pais_existe = await paisModel.findOne({nombre:{ $regex: nuevoPais.nombre, $options:'i' }})

        if (pais_existe){
            return res.status(418).json({ok:false,
                msg: "Ya existe un pais con este nombre"
            });
        }

        await nuevoPais.save()

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

const putPais = async (req=request,res=response)=>{
    const {id} = req.params
    try{    

        const pais = await paisModel.findOne({_id:id})

        if(!pais){
            return res.status(404).json({
                ok:false,
                msg: "No se encontro un pais con ese id"
            })
        }
        
        await paisModel.updateOne({_id:id}, req.body)

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

const deletePais = async (req=request,res=response)=>{
    const {id} = req.params
    try{
        const pais = await paisModel.findOne({_id:id})

        if (!pais){
            return res.status(404).json({
                ok:false,
                msg: "No se encontro un pais con ese id"
            })
        }

        await paisModel.deleteOne({_id:id})

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
    getPaises,
    getPaisById,
    getPaisByName,
    postPais,
    putPais,
    deletePais
}