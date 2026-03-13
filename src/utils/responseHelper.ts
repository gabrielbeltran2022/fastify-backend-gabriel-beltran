import { FastifyReply } from "fastify";
import { ValidationError } from "sequelize";

export const sendError = (reply: FastifyReply, error: any, statusCode?: number) => {
    let message = "An internal server error occurred.";
    let status = statusCode || 500;
    let statusName = "Internal Server Error";

    if (error instanceof ValidationError) {
        status = 400;
        statusName = "Bad Request";
        // Extracting multiple Sequelize validation messages
        message = error.errors.map(e => e.message).join("; ");
    } else if (typeof error === "string") {
        message = error;
        status = statusCode || 400;
        statusName = "Request Error";
    } else if (error instanceof Error) {
        // Log the actual error internally but hide it from the user
        console.error("Internal Error:", error.message);
    }

    return reply.status(status).send({
        statusCode: status,
        error: statusName,
        message: message
    });
};