import { FastifyReply,FastifyRequest } from "fastify";
import { sendError } from "../utils/responseHelper";
import { Credential } from "../models/credentialsModel";
import { Store } from "../models/storeModel";
import { Op } from "sequelize";

export const getStore = async (request: FastifyRequest, reply: FastifyReply) =>{
    try{
        //await request from jwt to get token
        await request.jwtVerify();
        //assigning variable user of payload
        const user = request.user as {id: string}
        //finding the store using user payload
        const existingStore = await Store.findAll({where:{fk_customer: user.id}})

        if(!existingStore) return sendError(reply,"Store is not exist!",404)

        return reply.send({success: "Success",code: 200,data: existingStore})
    }catch(err){
        return sendError(reply,err)
    }
}


export const createStore = async (request: FastifyRequest, reply: FastifyReply) => {
    try{
        //await the user credentials
        await request.jwtVerify()
        //assign the payload from cookie
        const user = request.user as { id: string }
        const {...storeInfo} = request.body as any
        //validation for user if not verified isVerified = 0
        if (!user) return sendError(reply,"User is not verified!",400)
        //find the user credentials fk_customer
        const existingUser = await Credential.findOne({where: {fk_customer: user.id}})
        //validation of user if exist!
        if(!existingUser) return sendError(reply,"User is not existis!",404)
        //creating of store
        const newStore = await Store.create({
            storeName: storeInfo.storeName,
            address: storeInfo.address,
            location: storeInfo.location,
            type: storeInfo.type,
            fk_customer: existingUser!.fk_customer
        });


        return reply.send({status: "Success",code: 200,data: newStore})

    }catch(err){
        return sendError(reply,err)
    }
}

export const updateStore = async (request: FastifyRequest, reply: FastifyReply) => {
    try{
        await request.jwtVerify();
        const user = request.user as {id: string};
        const {storeId,...updateData} = request.body as any

        if(!storeId || !Array.isArray(storeId) || storeId.length === 0)
        return sendError(reply,"No store selected update",400) 

        const filterUpdateStore = Object.fromEntries(
            Object.entries(updateData).filter(([key,value]) => value !== undefined)
        )

        if(Object.keys(filterUpdateStore).length === 0) 
        return sendError(reply,"No valid fields provided update!",400)

        const existsStore = await Store.findOne({where: {fk_customer: user.id}})
        if(!existsStore) return sendError(reply,"Store is not exists!")
        
        const [affectCount] = await Store.update(filterUpdateStore,{
            where: {
                id: {[Op.in]: storeId},
                fk_customer: user.id
            },
            individualHooks: true
        })
        if(affectCount === 0)
        return sendError(reply,"Store is not found!", 404)
        
        return reply.send({success: "Success",code: 200,data: affectCount,message:"Store is successfully update!"})


    }catch(err){
        return sendError(reply,err)
    }
}

export const deleteStore = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
        const user = request.user as { id: string }; 
        const { storeId } = request.params as { storeId: string };

        const deletedCount = await Store.destroy({
            where: {
                id: storeId,            // UI-provided param
                fk_customer: user.id    // Security anchor (Owner verification)
            }
        });
        
        if (deletedCount === 0) 
        return sendError(reply, "Store not found or unauthorized!", 404);
        

        return reply.send({
            status: "Success",
            code: 200,
            message: "Store successfully deleted!"
        });

    } catch (err) {
        return sendError(reply, err);
    }
};