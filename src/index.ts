import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { FacebookResponse } from "./types/api";
import { access } from "fs";

dotenv.config();

const PAGE_ID = process.env.PAGE_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const FB_API_VERSION = process.env.FB_API_VERSION;

const port = process.env.PORT || 3000;
const app = express();

// app.use(cors({
//   origin: ALLOWED_ORIGIN,
//   methods: ["GET"],
// }));
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/api/feed", async (req: Request, res: Response) => {
  (async () => {
    try {
      const limit = Number(req.query.limit) || 10;
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ error: "Invalid limit parameter" });
      }
      const fields =
        "id,message,created_time,full_picture,permalink_url,attachments";
      const apiUrl = `https://graph.facebook.com/${FB_API_VERSION}/${PAGE_ID}/&access_token=${ACCESS_TOKEN}`;
      console.log("API URL:", apiUrl);

      const response = await axios.get<FacebookResponse>(apiUrl, {
        params: {
          access_token: ACCESS_TOKEN,
          fields,
          limit,
        },
      });
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Error fetching feed" });
    }
  })();
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
