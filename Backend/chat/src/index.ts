import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import ChatRoutes from "./routes/chat.js";
import cors from "cors";

dotenv.config();
const app = express();
connectDb();

app.use(express.json());

// ✅ Explicit CORS + preflight handling (THIS FIXES YOUR ERROR)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Optional but fine
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use("/api/v1", ChatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Chat service running on PORT ${PORT}`);
});