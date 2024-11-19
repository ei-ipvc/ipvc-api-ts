import express from "express";
import axios from "axios";

import academicosRouter from "./routes/academicos/";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/login", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;

  try {
    const response = await axios.post(
      "https://academicos.ipvc.pt/netpa/ajax?stage=loginstage",
      {
        _formsubmitstage: "loginstage",
        _formsubmitname: "login",
        ajax_mode: true,
        _user: username,
        _pass: password,
      },
      { withCredentials: true }
    );

    const cookies = response.headers["set-cookie"];
    const token =
      cookies?.find((cookie) => cookie.includes("JSESSIONID")) || null;

    res.status(response.status).json({
      academicos: token,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res
        .status(error.response ? error.response.status : 500)
        .send(error.message);
    } else {
      res.status(500).send("An unexpected error occurred");
    }
  }
});

app.use("/academicos", academicosRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
