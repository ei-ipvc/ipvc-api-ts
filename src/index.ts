import express from "express";
import cookieParser from "cookie-parser";

import authRouter from "./auth";
import academicosRouter from "./routes/academicos/";
import onRouter from "./routes/on/";
import sasRouter from "./routes/sas/";

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/login", authRouter);
app.use("/academicos", academicosRouter);
app.use("/on", onRouter);
app.use("/sas", sasRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
