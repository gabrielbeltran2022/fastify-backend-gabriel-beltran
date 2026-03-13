import { Product } from "../models/productModels";
import { FastifyReply } from "fastify";
import { sendError } from "../utils/responseHelper";


export const generatedUniqueSku = async (reply: FastifyReply, productSku: string): Promise<string> => {
    try {
        // 1. Generate 5-character alphanumeric string (e.g., SK3XA)
        const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
        
        // 2. Format Date as DDMMYYYY (e.g., 11032026)
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const datePart = `${day}${month}${year}`;
        
        // 3. Assemble: 5-char-random + '-' + productSku + '-' + DDMMYYYY
        const finalSku = `${randomPart}-${productSku}-${datePart}`;
        
        return finalSku;
    } catch (err) {
        return sendError(reply, 'Stock unsuccessful generated!', 400) as any;
    }
}

// utils/generateTransactionCode.ts

export const generateTransactionCode = (length = 12): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Get today's date in YYYYMMDD format
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;

  return `${code}-${dateStr}`;
};