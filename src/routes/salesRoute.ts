import { FastifyInstance } from "fastify";
import { getSalesData,getTotalSalesSummary } from "../controller/salesController";
import {authorize} from '../middleware/authentication'

const salesRoute = async (fastify: FastifyInstance): Promise<void> => {
    //get the All sales of store    
    fastify.get('/store/sales/:storeId',{preHandler:[authorize(1)]}, getSalesData)
    //get summary of sales year,monthly and weekly
  fastify.get('/store/sales-total/:storeId',{preHandler:[authorize(1)]}, getTotalSalesSummary)
}


export default salesRoute