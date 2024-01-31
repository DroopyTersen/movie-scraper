import { TmdbMovieDetails } from "../tmdbService";
import { SearchIndex } from "@azure/search-documents";
import { z } from "zod";

export const MovieSearchDocument = TmdbMovieDetails.transform((tmdbMovie) => {
  // remove credits.crew
  if (tmdbMovie.credits.crew) {
    delete tmdbMovie.credits.crew;
  }
  return tmdbMovie;
});

export const prepMovieSearchDocument = (movie: TmdbMovieDetails) => {
  let { credits, id, ...restOfMovie } = movie;

  return {
    ...restOfMovie,
    id: id.toString(),
    cast: credits?.cast || [],
  };
};

export type MovieSearchDocument = ReturnType<typeof prepMovieSearchDocument>;

export const movieSearchIndexDefinition = {
  name: "idx-movie-search",
  fields: [
    {
      name: "id",
      type: "Edm.String",
      key: true,
      searchable: false,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "title",
      type: "Edm.String",
      searchable: true,
      filterable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: "overview",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "backdrop_path",
      type: "Edm.String",
      searchable: false,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "poster_path",
      type: "Edm.String",
      searchable: false,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "release_date",
      type: "Edm.String",
      searchable: false,
      filterable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: "vote_average",
      type: "Edm.Double",
      searchable: false,
      filterable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: "vote_count",
      type: "Edm.Int32",
      searchable: false,
      filterable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: "popularity",
      type: "Edm.Double",
      searchable: false,
      filterable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: "imdb_id",
      type: "Edm.String",
      searchable: true,
      filterable: true,
      sortable: false,
      facetable: false,
    },
    {
      name: "budget",
      type: "Edm.Int64",
      searchable: false,
      filterable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: "homepage",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "revenue",
      type: "Edm.Int64",
      searchable: false,
      filterable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: "runtime",
      type: "Edm.Int32",
      searchable: false,
      filterable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: "tagline",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "genres",
      type: "Collection(Edm.String)",
      searchable: true,
      filterable: true,
      sortable: false,
      facetable: true,
    },
    {
      name: "production_companies",
      type: "Collection(Edm.String)",
      searchable: true,
      filterable: true,
      sortable: false,
      facetable: true,
    },
    {
      name: "production_countries",
      type: "Collection(Edm.String)",
      searchable: true,
      filterable: true,
      sortable: false,
      facetable: true,
    },
    {
      name: "cast",
      type: "Collection(Edm.ComplexType)",
      fields: [
        {
          name: "name",
          type: "Edm.String",
          searchable: true,
          filterable: true,
          sortable: false,
          facetable: true,
        },
        {
          name: "character",
          type: "Edm.String",
          searchable: true,
          filterable: false,
          sortable: false,
          facetable: false,
        },
      ],
    },
    {
      name: "keywords",
      type: "Collection(Edm.String)",
      searchable: true,
      filterable: true,
      sortable: false,
      facetable: true,
    },
    {
      name: "mpaa",
      type: "Edm.String",
      searchable: true,
      filterable: true,
      sortable: true,
      facetable: true,
    },
    {
      name: "synopsis",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "summaries",
      type: "Collection(Edm.String)",
      searchable: true,
      filterable: false,
      sortable: false,
      facetable: false,
    },
  ],
} as SearchIndex;
