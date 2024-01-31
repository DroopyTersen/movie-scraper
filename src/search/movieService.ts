import { TmdbMovieDetails } from "../tmdbService";
import {
  movieSearchIndexDefinition,
  prepMovieSearchDocument,
} from "./movies.schema";
import { searchService } from "./searchService";

export const movieSearchService = {
  recreateIndex: async () => {
    await searchService.recreateIndex(movieSearchIndexDefinition);
  },
  ensureIndex: async () => {
    await searchService.ensureIndex(movieSearchIndexDefinition);
  },
  saveMovies: async (tmdbMovies: TmdbMovieDetails[]) => {
    let moviesToInsert = tmdbMovies.map(prepMovieSearchDocument);
    await searchService.uploadDocuments(
      movieSearchIndexDefinition.name,
      moviesToInsert
    );
  },
};
