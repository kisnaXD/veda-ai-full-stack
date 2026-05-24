import mongoose from "mongoose";
import { config } from "../config";

mongoose.set("strictQuery", true);

export async function connectMongo() {
  await mongoose.connect(config.mongoUri, { autoIndex: true });
  console.log("[mongo] connected →", config.mongoUri);
}

export { mongoose };
