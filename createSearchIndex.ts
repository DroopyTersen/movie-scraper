import { movieSearchService } from "./src/search/movieService";
import { MovieListItem, TmdbMovieDetails } from "./src/tmdbService";

await movieSearchService.recreateIndex();
console.log("Index created.");

let moviesToIndex = (await Bun.file(
  "data/topRatedMovies.json"
).json()) as MovieListItem[];

// moviesToIndex = moviesToIndex.slice(0, 100);

const batchSize = 10;
// for each batch
for (let i = 0; i < moviesToIndex.length; i += batchSize) {
  let batch = moviesToIndex.slice(i, i + batchSize);
  console.log(
    `Indexing batch ${i / batchSize + 1} of ${Math.ceil(
      moviesToIndex.length / batchSize
    )}`
  );

  let batchMovieDetails: TmdbMovieDetails[] = [];

  // for each movie in the batch
  for (let j = 0; j < batch.length; j++) {
    let movie = batch[j];
    console.log(
      `Fetching details for movie ${j + 1} of ${batch.length}: ${movie.title}`
    );
    try {
      // fetch the full movie details from /data/movies/${id}.json
      let filepath = `data/movies/${movie.id}.json`;
      let movieDetails = (await Bun.file(filepath).json()) as TmdbMovieDetails;
      batchMovieDetails.push(movieDetails);
      console.log(`Details fetched for ${movie.title}.`);
    } catch (error) {
      console.error(`Failed to fetch details for movie ${movie.id}:`, error);
    }
  }

  try {
    await movieSearchService.saveMovies(batchMovieDetails);
    console.log(`Batch ${i / batchSize + 1} indexed.`);
  } catch (error) {
    console.error(`Failed to index batch ${i / batchSize + 1}:`, error);
  }
}
