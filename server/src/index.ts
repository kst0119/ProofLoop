import "dotenv/config";
import { app } from "./app";

const PORT = Number(process.env.PORT) || 3001;

export { app };

app.listen(PORT, () => {
  console.log(`ProofLoop API running on http://localhost:${PORT}`);
});
