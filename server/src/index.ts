import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ProofLoop API",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ProofLoop!",
    description: "AI-Powered Coding Assessment Platform",
    status: "Backend Running",
    version: "1.0.0"
  });
});


app.listen(PORT, () => {
  console.log(`ProofLoop API running on http://localhost:${PORT}`);
});
