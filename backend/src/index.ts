import "./db";
import "dotenv/config";
import express from "express";
import { productRouter } from "./api/products";
import { producer } from "./events/kafka";
import { categoryRouter } from "./api/categories/category.router";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});
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
