import { Router } from "express";

import { academicosStrategy } from "./academicos";
import { ONStrategy } from "./on";
import { SASStrategy } from "./sas";

const router = Router();
router.post("/", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send("Missing username or password");
    return;
  }

  const { username, password } = req.body;

  try {
    const [academicosToken, ONToken, SASTokens] = await Promise.all([
      academicosStrategy(username, password),
      ONStrategy(username, password),
      SASStrategy(username, password),
    ]);

    res.status(200).json({
      tokens: {
        academicos: academicosToken,
        ON: ONToken,
        SASRefreshToken: SASTokens[1],
        SASToken: SASTokens[0],
      },
    });
  } catch (error) {
    if (error instanceof Error) res.status(500).send(error.message);
    else res.status(500).send("An unknown error occurred");
  }
});

export default router;
