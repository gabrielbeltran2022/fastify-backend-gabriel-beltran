import Fastify from "fastify";
import Database from './config/databaseConn'
import "dotenv/config";
import customerRoute from "./routes/customerRoute";
import productRoute from './routes/productRoutes'
import credentialsRoute from './routes/credentialsRoute'
import storeRoute  from './routes/storeRoute'
import salesRoute from "./routes/salesRoute";
import fastifyJwt from "@fastify/jwt";
import cookie from "@fastify/cookie";



//Initialization of Fastify
const fastify = Fastify({ logger: false });
//Connection for database
const db = new Database();
//Server PORT
const PORT = Number(process.env.PORT) || 4020;
// secret
const jwtSecret = process.env.JWTSECRET!

//Routes
fastify.register(customerRoute, {prefix: '/api'})
fastify.register(productRoute, {prefix: '/api'})
fastify.register(credentialsRoute, {prefix: '/api'})
fastify.register(storeRoute, {prefix: '/api'})
fastify.register(salesRoute, {prefix: '/api'})

//Initialization of cookie
fastify.register(cookie,{
  secret: jwtSecret,
})
//Starting up the server
const start = async () => {
  try {
    //jwt
    await fastify.register(fastifyJwt,{
    secret: jwtSecret,
    cookie: {
      cookieName: "accessToken",
      signed: true
    },
    sign: {expiresIn: "1h"}
    })

    await db.connect();
    await fastify.listen({ port: PORT });
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();