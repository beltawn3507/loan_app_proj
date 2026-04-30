import {app} from './app'
import mongoose from "mongoose";
import dotenv from "dotenv";



dotenv.config();

const start = async () => {

   if(!process.env.MONGO_URI){
    throw new Error('MONGO URI must be defined')
   }
   if(!process.env.JWT_KEY){
    console.warn('JWT KEY is not defined. Signin and signup will need it before issuing tokens.')
   }

    try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to mongo-db',process.env.MONGO_URI)
  } catch (err) {
    console.error(err);
  }

  app.listen(3000,'0.0.0.0', () => {
    console.log("listening on port 3000 ..!!!!!");
  });
};

start();
