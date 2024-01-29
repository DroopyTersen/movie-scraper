import * as Cheerio from "cheerio";

export type ImdbMovie = {
  id: string;
  summaries: string[];
  synopsis: string;
};
export const fetchImdbMovieHtml = async (imdbId: string) => {
  let url = `https://www.imdb.com/title/${imdbId}/plotsummary`;
  const body = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  }).then((res) => {
    if (res.status !== 200) throw new Error("Failed to download");
    return res.text();
  });

  return body;
};

export const getImdbMovie = async (imdbId: string): Promise<ImdbMovie> => {
  if (!imdbId) {
    return {
      id: "",
      summaries: [],
      synopsis: "",
    };
  }
  let filepath = `data/imdb/${imdbId}.html`;
  // let file = Bun.file(filepath);
  let html = await fetchImdbMovieHtml(imdbId);
  console.log("🚀 | getImdbMovie | html:", html);
  let data = parseImdbHtml(html);
  console.log("🚀 | getImdbMovie | data:", data);
  await Bun.write(filepath, html);

  return {
    id: imdbId,
    ...data,
  };
};

const parseImdbHtml = (html: string): Omit<ImdbMovie, "id"> => {
  const $ = Cheerio.load(html);
  let summaries: string[] = [];
  $("[data-testid=sub-section-summaries] li").each(function () {
    summaries.push($(this).text().trim());
  });

  const synopsis = $("[data-testid=sub-section-synopsis]").text().trim();

  return {
    summaries,
    synopsis,
  };
};
