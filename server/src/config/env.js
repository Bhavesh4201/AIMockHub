import dontenv from "dotenv"
dontenv.config();

export const config ={
    PORT : process.env.PORT,
    AI_BASE_URL : process.env.AI_BASE_URL ,
    MONGODB_URL : process.env.MONGODB_URL,
    jwt_secret : process.env.jwt_secret,
    
}