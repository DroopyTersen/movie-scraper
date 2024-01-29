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
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=vote_average.desc&without_genres=99,10755&vote_count.gte=1000&popularity.gte=24&api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🚀 | fetchPopularMovies | page:", page, data);
    allMovies = allMovies.concat(MovieListResponse.parse(data).results);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return allMovies.filter((m) => m.popularity > 25);
}

export const TmdbMovieDetails = BaseTmdbMovie.extend({
  overview: z.string().nullable(),
  imdb_id: z.string().nullable(),
  budget: z.number().nullable(),
  homepage: z.string().nullable(),
  revenue: z.number().nullable(),
  runtime: z.number().nullable(),
  genres: z
    .array(z.object({ id: z.number(), name: z.string() }))
    .transform((genres) => genres.map((g) => g.name)),
});

export type TmdbMovieDetails = z.infer<typeof TmdbMovieDetails>;
export type MovieDetails = TmdbMovieDetails & {
  synopsis: string;
  summaries: string[];
};

export async function fetchMovieDetails(
  movieId: number
): Promise<MovieDetails> {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`;
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
