import exppress from "express";
import app from "./app.js";
import connectDatabase from "./config/db.js";

const PORT = process.env.PORT || 8000;


app.listen(PORT, () => console.log("Listening...."));



