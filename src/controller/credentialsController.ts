import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/responseHelper';
import { Customer } from '../models/customerModel'
import { Credential } from '../models/credentialsModel';
import {isValidGeneratedCode} from '../services/userValidation'
import { sanitizeAuthData,sanitizeStoreAccessData } from '../utils/santinizeHelper';
import {generateRandomCode} from '../utils/generateVerificationCode'
import {sendGeneratedCodeEmail} from '../utils/emailSender';
import { generateTokensAndSetCookies } from '../auth/tokenService';
import bcrypt from 'bcrypt';
import 'dotenv/config'


export const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try{
        //find all user have all access
        const existsCredentails = await Credential.findAll();
        //validation of user if exists!
        if(existsCredentails.length === 0) return sendError(reply,"No User is found!",404);

        return reply.send({success:"Success",code:200,data: existsCredentails})

    }catch(err){
        return sendError(reply,err)
    }
}


export const customerVerification = async (request: FastifyRequest, reply: FastifyReply) => {
    try{  
       
        const userCredentials = request.body as ({
            email: string,
            password: string,
        })

        const cleanData = sanitizeAuthData(userCredentials)

        const existingCustomer = await Customer.findOne({ where: {email: cleanData.email } });
       
        //validation for existing Customer
        if(!existingCustomer) return sendError(reply,"Customer is not exists!",400)
       
        //Validation for Credentails if user is already exists
        const existsCredentails = await Credential.findOne({where: {fk_customer: existingCustomer.id}})
       
       if (existsCredentails?.isVerify) return sendError(reply, "Customer is already verified and has an active account", 400);
   
        //hashing password for security from database
        const newPassword = await bcrypt.hash(cleanData.password,12);
        const code = generateRandomCode();
        
        //creation of account
        await Credential.create({
            fk_customer: existingCustomer.id,
            password: newPassword,
            verificationCode: null,
            generatedCode: code,
            isVerify: false,
            accessLevel: 0
        })
        //sending verification Code
        await sendGeneratedCodeEmail(existingCustomer.email, code);

    return reply.send({status: 'success',code: 200,
    message: `code sent to your email ${existingCustomer.email}`});

    }catch(err){
        return sendError(reply,err)
    }
}

export const validateVerificationCode = async (request: FastifyRequest,reply: FastifyReply) => {
    try{
        const {code} = request.body as {code: string}
        
        //Validate the code if match to record
         const isValid = await isValidGeneratedCode(reply,code);
        //return a error if invalid 
         if(!isValid) return sendError(reply,"Invalid code check your email!",400)
        
        return reply.send({success: "Success", code: 200, message:"Customer is already verified"})

    }catch(err){
        return sendError(reply,err)
    }
}

export const loginCustomer = async (request: FastifyRequest, reply: FastifyReply) => {
    try{
        // const user = request.user as JwtPayload
        // if (user.access !== 2) return sendError(reply, "Forbidden: admin only");

        const {email,password} = request.body as {email: string,password: string}

        /*This is a TypeScript intersection type: 
        - & combines two types.
        - { credential?: ... } adds a new property credential to the Customer type.
        - Credential & { password: string } says: the credential object is a Credential 
          instance, and it definitely has a password property of type string*/
          
          const existingCustomer = await Customer.findOne({
                where: {email},
                include: [{model: Credential, as: "credential"}]
            }) as Customer & { credential?: Credential & { password: string,access: string } }

            //checking the existing user
            if(!existingCustomer) return sendError(reply,"Customer is not found",400)
            //accessing the password to other table 
            const exstingPassword = existingCustomer?.credential?.password;
            //use bcrypt for verification of password if authenticated
            const isValid = await bcrypt.compare(password,exstingPassword as string)

            if(!isValid) return sendError(reply,"Invalid password", 400)
           
           //generate a token from jwt using request.server.jwt
            const tokens = generateTokensAndSetCookies(request, reply, {
                id: existingCustomer.id,
                email: existingCustomer.email,
                access: existingCustomer.credential?.accessLevel
                });
        
        return reply.send({status: "Success", code: 200,message: "Login Sucessfully",token: tokens})

    }catch(err){
        return sendError(reply,err)
    }
}

export const logOutCustomer = async (request: FastifyRequest, reply: FastifyReply ) =>{
    try{
    const { accessToken, refreshToken } = request.cookies as {accessToken?: string;refreshToken?: string;};

    // Check if cookies exist
    if (!accessToken && !refreshToken) {
      return sendError(reply, "No active session found", 401);
    }
        
        reply
      .clearCookie("accessToken")
      .clearCookie("refreshToken");

        return reply.send({status:"Success",code: 200,message:"Successfully Logout!"})
    }catch(err){
        return sendError(reply,err)
    }
}

export const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const signInToken = request.cookies.refreshToken;
    //token validation
    if (!signInToken) return sendError(reply, "No refresh token provided", 401);
    
    //make the jwt token sign = false
    const { value: refreshToken, valid } = request.unsignCookie(signInToken);
    if(!valid) return sendError(reply,"Invalid Refresh Token",404)

    //getting the token from cookie and verify using jwt.verfiy if payload is correct
    const payload = request.server.jwt.verify(refreshToken) as { id: string };
    
    //getting the user id using payload by using payload id
    const user = await Customer.findByPk(payload.id, {
      include: [{ model: Credential, as: "credential" }]
    }) as Customer & { credential?: Credential };

    //error handling fif user is not bound from customer.id = credentials.fk_employee
    if (!user) return sendError(reply, "User not found", 401);

   const tokens =  generateTokensAndSetCookies(request, reply, {
      id: user.id,
      access: user.credential?.accessLevel 
    });

    return reply.send({ status: "success", code: 200, message: "Access token refreshed",token: tokens });
  } catch (err) {
    return sendError(reply, "Invalid refresh token", 500);
  }
};

//Update user Level
export const upDateUserLevel = async (request: FastifyRequest, reply: FastifyReply) =>{
    try{
        await request.jwtVerify()
        const user = request.user as {id: string}    
        const {...data} = request.body as any
        //clean the data after from body request so avoid spacing
        const cleanData = await sanitizeStoreAccessData(data) 
        
        //find the user from request body
        const existingCredentials = await Credential.findOne({where: {id: cleanData.userId}})
        
        //validation for existing User
        if(!existingCredentials) return sendError(reply,"User is not found!",404)
       
       
        //updating the credentials from body request
        await existingCredentials.update(cleanData)
        await existingCredentials.reload //fetch the lastest data
        
        return reply.send({status:"Success",code:200,user:existingCredentials,message:"Credentials is sucessfully update!"})

    }catch(err){
        return sendError(reply,err)
    }
}