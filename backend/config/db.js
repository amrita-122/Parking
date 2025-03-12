const mongoose = require("mongoose");
require('dotenv').config()

const connectDB = async () => {
try {
    await mongoose.connect(process.env.MongoDB_URL);
    console.log("Mongo DB Connected");
  }
 catch (error) {
  console.log(process.env.MongoDB_URL,"Error Occured while connecting to database",error);
  process.exit(1);
}
}

module.exports = connectDB
