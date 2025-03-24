import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Connect to DB");
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "CANNOT connect to the MongoDB!"
    );
  }
};
const connectCloudinary = async () => {};

export { connectDB, connectCloudinary };
