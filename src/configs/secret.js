import * as dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT | 3001;
const URL_DB = process.env.URL_DB;
const SECRET_KEY = process.env.SECRET_KEY;
const CLOUD_NAME = process.env.CLOUD_NAME;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const API_REGION = process.env.API_REGION;
export {
  PORT,
  URL_DB,
  SECRET_KEY,
  CLOUD_NAME,
  API_KEY,
  API_SECRET,
  API_REGION,
};
