import { FastifyInstance } from "fastify";
import { createStore, deleteStore, getStore, updateStore } from "../controller/storeController";
import { authorize } from "../middleware/authentication";


const storeRoute = async (fastify: FastifyInstance): Promise<void> => {
        //Store
        fastify.get('/store', getStore)
        //create store
        fastify.post('/create-store',{preHandler:[authorize(1)]}, createStore)
        //update store
        fastify.patch('/update-store',{preHandler: [authorize(1)]},updateStore)
        //delete store
        fastify.delete('/delete-store/:storeId',{preHandler: [authorize(1)]},deleteStore)

    
}   

export default storeRoute