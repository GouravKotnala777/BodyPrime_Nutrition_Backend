import connectDatabase from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 8000;

connectDatabase(process.env.MONGO_URI);

app.listen(PORT, () => console.log("Listening...."));