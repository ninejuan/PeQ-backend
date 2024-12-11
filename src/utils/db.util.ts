import mongo from 'mongoose';
import { config } from 'dotenv';
config();

export async function linkToDatabase() {
  let env = process.env;
  mongo
    .connect(`${env.MONGODB_URI}`)
    .then(() => {
      console.log('mongoDB Connected');
    })
    .catch((e) => {
      console.error(e);
    });
}
