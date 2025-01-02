import "./db";
import express from "express";
import { productRouter } from "./api/products";
import { producer } from "./kafka";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productRouter);

const startServer = async () => {
  const connectionsRes = await producer.connect();
  connectionsRes.onFailurePeek((error) => {
    console.error("Failed to connect to Kafka", error);
    process.exit(1);
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

startServer();
