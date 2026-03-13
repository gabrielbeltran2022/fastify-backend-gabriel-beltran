import { FastifyInstance } from "fastify";
import { customerVerification, getUser, loginCustomer, logOutCustomer, refreshToken, upDateUserLevel, validateVerificationCode } from "../controller/credentialsController";
import { authorize } from "../middleware/authentication";

const credentialsRoute = async (fastify: FastifyInstance): Promise<void> => {
   
    //get all valid user
    fastify.get('/user-credentials',getUser)
    //verification route
    fastify.post('/send-verification', customerVerification)
    //validate route
    fastify.patch('/verify-code', validateVerificationCode)
    //login
    fastify.post('/login', loginCustomer)
    //logut
    fastify.post('/logout',logOutCustomer)
    //refresh token
    fastify.post('/refresh-token',refreshToken)
    //update credentials
    fastify.post('/update-userlevel',{preHandler:[authorize(2)]},upDateUserLevel)
}

export default credentialsRoute