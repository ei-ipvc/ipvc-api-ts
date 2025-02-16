import { Router, Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

interface Summary {
  id: number;
  date: string;
  time: string;
  class: string;
  room: string;
  teacher: string;
  summary: string;
  bibliography: string;
}

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const token = req.cookies.MoodleSession;
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const id = 1386; // @TODO: get course id from user and store it into db
    const response: AxiosResponse = await axios.get(
      `https://elearning.ipvc.pt/ipvc2024/course/view.php?id=${id}`,
      {
        headers: {
          Cookie: `MoodleSession=${token};`,
          //"User-Agent": "Mozilla/5.0 Chrome/99.0.0.0 Safari/537.36",
        },
        // responseType: "arraybuffer",
      }
    );

    console.log(`MoodleSession=${token}`);

    if (response.data.includes("loginform")) {
      res.status(401).send("Unauthorized");
      return;
    }

    const $ = cheerio.load(response.data);

    console.log(response.data);

    const summaries: Summary[] = $("#ipvc_sumarios table tbody tr td table")
      .toArray()
      .reduce((acc: Summary[], _, idx, tables) => {
        if (idx % 3 === 0) {
          const t1: string[] = $(tables[idx])
            .find("tr")
            .eq(1)
            .find("td")
            .map((_, el) => $(el).text().trim())
            .get();
          const t2: string = $(tables[idx + 1])
            .find("tr")
            .eq(1)
            .text()
            .trim();
          const t3: string = $(tables[idx + 2])
            .find("tr")
            .eq(1)
            .text()
            .trim();

          const summary: Summary = {
            id: Number(t1[0]),
            date: t1[1],
            time: t1[2],
            class: t1[3],
            room: t1[4],
            teacher: t1[5],
            summary: t1[6] || t2,
            bibliography: t1[7] || t3,
          };

          acc.push(summary);
        }
        return acc;
      }, []);

    res.status(response.status).json(summaries);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res
        .status(error.response ? error.response.status : 500)
        .send(error.message);
    } else {
      console.error(error);
      res.status(500).send("An unexpected error occurred");
    }
  }
});

export default router;
