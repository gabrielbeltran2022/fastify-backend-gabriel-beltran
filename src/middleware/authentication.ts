import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/responseHelper';
import { Credential } from '../models/credentialsModel';

export interface JwtPayload {
  id: string;
  email: string;
  access?: number;
}
//I create a function that catches the access level from routes
export const authorize = (requiredLevel: number) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
    //get the request from jwt from server
      await request.jwtVerify();
    
      const user = request.user as JwtPayload;
      const { id: paramId } = request.params as { id?: string };
        
      //find the user id from the database
      const isRegistered = await Credential.findOne({ where: { fk_customer: user.id } });
      if (!isRegistered) {
        reply.clearCookie('accessToken');
        return sendError(reply, 'Unauthorized: Account status invalid', 401);
      }
 
      // If User is Owner, let them through (Bypass)
      if (paramId && user.id === paramId) return;

      // If User is Admin level 
      if (isRegistered.accessLevel! >= requiredLevel) return;

      //Otherwise, deny
      return sendError(reply, 'Forbidden: insufficient access', 403);
      
    } catch (err: any) {
      return sendError(reply, `Unauthorized: ${err.message}`, 401);
    }
  };
};