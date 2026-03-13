import { FastifyReply } from 'fastify';
import { sendError } from '../utils/responseHelper';


/**
 * Generate a code with 4 random uppercase letters followed by 3 random digits
 * Example: ABCD123
 */
// utils/generateCode.ts
export const generateRandomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    // Generate 7 characters randomly (letters + numbers)
    for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }

    return result;
};