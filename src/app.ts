import express, { Application } from "express";
import dotenv from "dotenv";
import emailRoutes from "./routes/emailRoutes";
import whatsappRoutes from "./routes/whatsappRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/email", emailRoutes);
app.use("/whatsapp", whatsappRoutes);

app.get("/", (req, res) => {
  res.send("Message Extractor API");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
