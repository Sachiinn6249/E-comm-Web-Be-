import mongoose from "mongoose";

const connectDb = () => {
  try {
    mongoose.connect(process.env.MONGO_URI).then((res) => {
      console.log("Successfully Connected With MongoDB");
    });
  } catch (error) {
    console.error("Error in Conncet With MongoDB", error);
  }
};

export default connectDb;
