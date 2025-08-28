import exppress from "express";
import app from "./app.js";

const PORT = 8000;


app.use(exppress.urlencoded({extended:true}));


app.listen(PORT, () => console.log("Listening...."))