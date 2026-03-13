import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/responseHelper';
import { Customer } from '../models/customerModel'
import {validateCustomerUnique } from '../services/userValidation'
import { sanitizeCustomerData } from '../utils/santinizeHelper';


// //GET ALL CUSTOMER
// export const getCustomer = async (request: FastifyRequest, reply: FastifyReply) => {
//     try {
//         //get all customer
//         const customer = await Customer.findAll();
//         //if customer is null return error
//         if (customer.length === 0) return sendError(reply, "Customer not found in records", 404);
        
//         return { status: 'success',code: 200, data: customer };

//     } catch (err) {
//         return sendError(reply, err);
//     }
// };


//GET CUSTOMER BY ID 
export const getCustomerById = async (request: FastifyRequest, reply: FastifyReply) => {
    try{    
        //get the request from params
        const {id} = request.params as {id: string}
        //check the customer if exists
        const existingCustomer = await Customer.findOne({where: {id}})

        //if the user is not exists throw error
        if(!existingCustomer) return sendError(reply,"Customer is not exists!",404)
        
        return reply.send({status: "Success", code: 200, data: existingCustomer})

    }catch(err){
        return sendError(reply,err)
    }
}
//Get Customer Pagination
export const getCustomerPagination = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        //get the request from query parameter ?page=2&limit=10
        const { page = 1, limit = 10 } = request.query as { page?: number, limit?: number };

        //?? ensures that if page or limit is undefined, we use default values.
        const pageNumber = Number(page ?? 1)
        const limitNumber = Number(limit ?? 10)

        //offset tells the database how many records to skip
        const offset = (pageNumber - 1) * limitNumber;

        const { count, rows } = await Customer.findAndCountAll({
            limit: limitNumber,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const totalPages = Math.ceil(count / limitNumber);

        //throw an error message if page is not exists to total pages 
         if (pageNumber > totalPages && totalPages > 0) {
            return sendError(reply, `Page ${pageNumber} does not exist`, 404);
        }
        
        //I return all the data if frontend side dont struggle in getting in data 
        return reply.code(200).send({
            status: "success",
            totalItems: count,
            totalPages: Math.ceil(count / limitNumber),
            currentPage: pageNumber,
            pageSize: limitNumber,
            data: rows
        });

    } catch (err) {
        return sendError(reply, err);
    }
};


//CREATE CUSTOMER
export const createCustomer = async (request: FastifyRequest, reply: FastifyReply) =>{

    try{
        //Creating of references from body request
        const {...customer} = request.body as any

        //Cleaning and fixing the the all data input before the saving in database
        const cleanCustomer = sanitizeCustomerData(customer)
        
        //validation of customer if email or contact number is already used
        const isValid = await validateCustomerUnique(reply,cleanCustomer.email,cleanCustomer.contactNumber);
       if (!isValid) return; 
        
        //saving of customer if all valid
        const createCusomter = await Customer.create(cleanCustomer)

        return reply.send({status: "success",code: 200, data: createCusomter, message: "User is successfully created!"})

    }catch(err){
          return sendError(reply, err);
    }
}
//DELETE CUSTOMER BY ID
export const deleteCustomer = async (request: FastifyRequest, reply: FastifyReply) =>{
    try{
        //find the specific customer delete in params
        const {id} = request.params as {id: string}

        //get the customer id 
        const existsCustomer = await Customer.findOne({where: {id}})

        //checking if customer is already exists
        if (!existsCustomer) return sendError(reply, "Customer is not found!", 404);

        //deletion of customer 
        await existsCustomer.destroy();

        return reply.send({status: "success",code: 200,message: `Customer ${existsCustomer.email} deleted successfully!`})

    }catch(err){
         return sendError(reply, err);
    }
}
//UPDATE CUSTOMER BY ID
export const updateCustomer = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string };

        const {...customerData} = request.body as any; 

        //accessing the Customer Id
        const existingCustomer = await Customer.findOne({ where: { id } });
        
        //validation of error customer if not exists
        if (!existingCustomer) return sendError(reply, "Customer not found!", 404);

        // Clean input before insert to data
        const cleanData = sanitizeCustomerData(customerData);

        // Validate uniqueness (ignore this customer's own email/contact)
        const isValid = await validateCustomerUnique(
            reply,
            cleanData.email || existingCustomer.email,
            (cleanData.contactNumber || existingCustomer.contactNumber).toString(),
            existingCustomer.id
        );
        if (!isValid) return;


        // Update record
        await existingCustomer.update(cleanData);
        await existingCustomer.reload(); // fetch latest data

        return reply.code(200).send({
            status: "success",
            code: 200,
            data: existingCustomer,
            message: `Customer ${existingCustomer.fullname} updated successfully!`
        });

    } catch (err: any) {
        return sendError(reply, err.message || "Internal Server Error", 500);
    }
};