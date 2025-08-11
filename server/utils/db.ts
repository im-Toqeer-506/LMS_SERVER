import mongoose, { set } from "mongoose";
require("dotenv").config();
const dbURl: String = process.env.MONOGODB_URI || "";
const dbConnection = async () => {
  try {
    const connected=await mongoose.connect(`${dbURl}`, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      maxPoolSize: 10,
    });
    console.log(`MongoDB connected successfully: ${connected.connection.host}`);

  } catch (error) {
    console.error("Error", error);
    setTimeout(dbConnection, 5000);
  }
};
export default dbConnection;