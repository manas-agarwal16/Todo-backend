import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { connectdb } from "./db/db.connection.js";
import { app } from "./app.js";


connectdb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("server is running on the port : ", process.env.PORT);
    });
  })
  .catch((err) => {
    console.error("Error in connecting express to DB:", err);
  });

