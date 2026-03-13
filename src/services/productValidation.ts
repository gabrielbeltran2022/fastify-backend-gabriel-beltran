import { Product } from "../models/productModels";
import { FastifyReply } from "fastify";
import { Op } from "sequelize";
import { sendError } from "../utils/responseHelper";



export const validateProductUnique = async (reply: FastifyReply,sku:string,currentProductId?: string):Promise<boolean> =>{
    try{    
        //checking for existing data that equal stock keeping unit
        const existingData: any = {sku}

        //then if exist the current product is ignore when updating
        if (currentProductId) {
            existingData.id = { [Op.ne]: currentProductId };
        }

        //getting the product Id
        const existingProduct = await Product.findOne({where: existingData})

        //if existing return false
        if(existingProduct){
            sendError(reply, "Stock keeping unit must be unique",400)
            return false
        }

        return true

    }catch(err){
         sendError(reply,'Product Stock Keeping Unit must be Unique!',404)
        return false
    }
}