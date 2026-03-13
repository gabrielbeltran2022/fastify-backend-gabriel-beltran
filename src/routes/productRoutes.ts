import { FastifyInstance } from "fastify";
import {getProductPagination,createProduct, deleteProduct, updateProduct} from '../controller/productController'
import { purchaseProduct } from "../controller/productController";
import {authorize} from '../middleware/authentication'


const productRoute = async (fastify: FastifyInstance): Promise<void> => {
        //get all product
        fastify.get('/store/product/:storeId',{preHandler:[authorize(1)]}, getProductPagination)
        //create product
        fastify.post('/store/create-product',{preHandler:[authorize(1)]}, createProduct)
        //delete product by Id
        fastify.delete('/store/delete-product/:id',{preHandler:[authorize(1)]}, deleteProduct)
        //update product 
        fastify.patch('/store/udpdate-product/:storeId',{preHandler:[authorize(1)]}, updateProduct)
        //purchase
        fastify.post('/store/purchase/:storeId',{preHandler:[authorize(1)]},purchaseProduct)
}


export default productRoute