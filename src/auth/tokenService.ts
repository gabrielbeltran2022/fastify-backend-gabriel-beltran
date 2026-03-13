// src/auth/tokenService.ts
import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Generate access & refresh tokens and set HttpOnly cookies
 */
export const generateTokensAndSetCookies = (request: FastifyRequest,reply: FastifyReply,payload: { id: string; email?: string; access?: number}) => {
            // Access token (1 hour)
          const accessToken = request.server.jwt.sign(
            {
              id: payload.id,
              email: payload.email,
              access: payload.access || 0
            },
            { expiresIn: "1h" }
          );

          // Refresh token (7 days)
          const refreshToken = request.server.jwt.sign(
            { id: payload.id,
              access: payload.access  },
            { expiresIn: "7d" }
          );

          // Set cookies
          reply
            .setCookie("accessToken", accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              signed: true,
              path: "/",
              maxAge: 60 * 60 // 1 hour
            })
            .setCookie("refreshToken", refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              signed: true,
              path: "/",
              maxAge: 7 * 24 * 60 * 60 // 7 days
            });

  return { accessToken, refreshToken }; // optionally return tokens
};