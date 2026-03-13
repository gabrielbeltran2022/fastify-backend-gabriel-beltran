import { FastifyInstance } from "fastify";
import { getCustomerPagination,createCustomer, deleteCustomer, updateCustomer, getCustomerById} from "../controller/customerController";
import {authorize} from '../middleware/authentication'


const customerRoute = async (fastify: FastifyInstance): Promise<void> => {
    // //getAllcustomer
    // fastify.get('/customer', getCustomer)
    
    //get customer by Id
    fastify.get('/customer/:id', getCustomerById)
    //get customer by pagination
    fastify.get('/customer', getCustomerPagination)

    //Create customer route
    fastify.post('/create-customer', createCustomer)
    //Delete customer route
    fastify.delete('/delete-customer/:id',{preHandler:[authorize(2)]}, deleteCustomer)
    //Update customer route
    fastify.patch('/update-customer/:id',{preHandler:[authorize(2)]}, updateCustomer);


}


export default customerRoute