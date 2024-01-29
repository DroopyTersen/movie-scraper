import { z } from "zod";
import { GENRES } from "./tmdb.genres";
import { getImdbMovie } from "./imdbScraper";

const API_KEY = "9bc8fa1df47f3dde957bbd7f9dd5b48a";

export const BaseTmdbMovie = z.object({
  backdrop_path: z
    .string()
    .nullable()
    .transform((path) =>
      path ? `https://image.tmdb.org/t/p/w500${path}` : ""
    ),
  // Renaming genre_ids to genres and transforming the array of genre ids to an array of genre names
  id: z.number(),
  title: z.string(),
  poster_path: z
    .string()
    .nullable()
    .transform((path) =>
      path ? `https://image.tmdb.org/t/p/w500${path}` : ""
    ),
  release_date: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
  popularity: z.number(),
});

const MovieListResponse = z.object({
  results: z.array(BaseTmdbMovie),
});

export type MovieListItem = z.infer<typeof BaseTmdbMovie>;

export async function fetchPopularMovies(
  numPages = 1
): Promise<MovieListItem[]> {
  let allMovies: MovieListItem[] = [];

  // Loop through the first 10 pages
  for (let page = 1; page <= numPages; page++) {
    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&region=US&sort_by=vote_average.desc&vote_count.gte=1200&with_original_language=en&api_key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🚀 | fetchPopularMovies | page:", page, data);
    allMovies = allMovies.concat(MovieListResponse.parse(data).results);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return allMovies.filter((m) => m.popularity > 18);
}

export const TmdbMovieDetails = BaseTmdbMovie.extend({
  overview: z.string().nullable(),
  imdb_id: z.string().nullable(),
  budget: z.number().nullable(),
  homepage: z.string().nullable(),
  revenue: z.number().nullable(),
  runtime: z.number().nullable(),
  tagline: z.string().nullable(),
  genres: z
    .array(z.object({ id: z.number(), name: z.string() }))
    .nullable()
    .transform((genres) => (genres || []).map((g) => g.name)),
  production_companies: z
    .array(z.object({ name: z.string() }))
    .transform((companies) => (companies || []).map((company) => company.name)),
  production_countries: z
    .array(z.object({ iso_3166_1: z.string(), name: z.string() }))
    .transform((countries) => (countries || []).map((c) => c.iso_3166_1)),
  credits: z.object({
    cast: z.array(
      z.object({ name: z.string(), character: z.string().nullable() })
    ),
    crew: z.array(
      z.object({
        name: z.string(),
        department: z.string().nullable(),
        job: z.string().nullable(),
      })
    ),
  }),
  keywords: z
    .object({
      keywords: z.array(z.object({ name: z.string() })),
    })
    .transform((keywords) => keywords.keywords.map((k) => k.name)),
  release_dates: z
    .object({
      results: z.array(
        z.object({
          iso_3166_1: z.string(),
          release_dates: z.array(
            z.object({
              certification: z.string(),
              iso_639_1: z.string().nullable(),
              note: z.string().nullable(),
              release_date: z.string(),
              type: z.number(),
            })
          ),
        })
      ),
    })
    .transform((releaseDates) => {
      const usRelease = releaseDates.results
        .find((r) => r.iso_3166_1 === "US")
        ?.release_dates.find((r) => r.certification);
      return usRelease;
    }),
}).transform((movie) => {
  const { release_dates, ...restOfMovie } = movie;
  const mpaa = release_dates?.certification || "NR";
  return {
    ...restOfMovie,
    mpaa,
  };
});

export type TmdbMovieDetails = z.infer<typeof TmdbMovieDetails>;
export type MovieDetails = TmdbMovieDetails & {
  synopsis: string;
  summaries: string[];
};

export async function fetchMovieDetails(
  movieId: number
): Promise<MovieDetails> {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits,keywords,release_dates&api_key=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  let tmdbMovie = TmdbMovieDetails.parse(data);

  let { id, summaries, synopsis } = await getImdbMovie(tmdbMovie.imdb_id!);
  return {
    ...tmdbMovie,
    summaries,
    synopsis,
  };
}
