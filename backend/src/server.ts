import "dotenv/config";
import emailRoutes from "./routes/email.routes.js"
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/emails", emailRoutes);

app.get("/", (req, res) => {
  res.send("ReachInbox Email Scheduler API is running!");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});