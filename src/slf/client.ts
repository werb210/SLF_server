import axios from "axios";
import { ENV } from "../config/env";

export const slfClient = axios.create({
  baseURL: ENV.SLF_BASE_URL,
  headers: {
    Authorization: ENV.SLF_TOKEN,
    Accept: "application/json"
  },
  timeout: 15000
});
