import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";
dotenv.config({
    path: "./.env",
});


const PORT = config.PORT;
connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
