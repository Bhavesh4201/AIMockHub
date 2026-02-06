import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";

dotenv.config({
    path: "./.env",
});

const PORT = config.PORT;

// Connect to database before starting server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
