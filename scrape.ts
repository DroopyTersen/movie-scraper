import {
  MovieListItem,
  fetchMovieDetails,
  fetchPopularMovies as fetchTopRatedMovies,
} from "./src/tmdbService";

async function getMovieList() {
  let movies = await fetchTopRatedMovies(100);
  console.log("🚀 | movies length:", movies.length);

  Bun.write("data/topRatedMovies.json", JSON.stringify(movies, null, 2));
}

async function getMovieDetails() {
  let movies = (await Bun.file(
    "data/topRatedMovies.json"
  ).json()) as MovieListItem[];
  // for each movie call fetchMovieDetails
  // delay for 1 second between each call
  // write each deatils json to a file, data/details/${id}.json
  for (const movie of movies) {
    try {
      // check if the file is already there
      let filepath = `data/movies/${movie.id}.json`;
      if (await Bun.file(filepath).exists()) {
        console.log(`Details for movie id ${movie.id} already exist.`);
        continue;
      }
      const details = await fetchMovieDetails(movie.id);
      console.log("🚀 | details:", details);
      await Bun.write(filepath, JSON.stringify(details, null, 2));
      console.log(`Details for movie id ${movie.id} written to file.`);
    } catch (error) {
      console.error(`Failed to fetch details for movie id ${movie.id}:`, error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

await getMovieList();
await getMovieDetails();
