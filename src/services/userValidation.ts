import { Customer } from "../models/customerModel";
import { Credential } from "../models/credentialsModel";
import { FastifyReply } from "fastify";
import { Op } from "sequelize";
import { sendError } from "../utils/responseHelper";


export const validateCustomerUnique = async (reply: FastifyReply,email: string,contactNumber: string,currentCustomerId?: string
): Promise<boolean> => {
    try {

        //Checking if email or contact number is exists
        const existingData: any = {
            [Op.or]: [
                { email },
                { contactNumber }
            ]
        };
       
        if (currentCustomerId) {
            // Ignore the current customer when updating
            existingData.id = { [Op.ne]: currentCustomerId };
        }
        const existingCustomer = await Customer.findOne({ where: existingData });
        //check the email or contact is already use by other customer
        if (existingCustomer) {
            sendError(reply, "Email or contact is already used!", 400);
            return false;
        }

        return true;

    } catch (err) {
        sendError(reply, err);
        return false;
    }
};

export const isValidGeneratedCode = async (reply:FastifyReply, code: string) => {
    //check the credentials from database
    const credential = await Credential.findOne({where:{generatedCode: code}});
    //validation for credentials if invalid
   if(!credential) return sendError( reply, "Invalid Code",400)
    //checking the verification already 
   if(credential.isVerify) return sendError( reply, "User is already verified",400)

    //then update the details from database
   credential.isVerify = true;
   credential.verificationCode = code;
   credential.generatedCode = null
   await credential.save();

   return reply.send({success:"Success",code: 200,message:"Customer is successfull verified"})
};