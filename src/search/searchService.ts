import {
  AzureKeyCredential,
  SearchClient,
  SearchIndex,
  SearchIndexClient,
} from "@azure/search-documents";

let ADMIN_KEY = process.env.AZURE_SEARCH_ADMIN_KEY!;
let SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT!;

// TODO: Zod Schema to ensure environment variables are set

export const searchService = {
  recreateIndex: async (indexDefinition: SearchIndex) => {
    const indexClient = new SearchIndexClient(
      SEARCH_ENDPOINT,
      new AzureKeyCredential(ADMIN_KEY)
    );
    let existingIndexes = indexClient.listIndexes();
    let itExists = false;
    for await (const index of existingIndexes) {
      if (index.name === indexDefinition.name) {
        itExists = true;
      }
    }
    if (itExists) {
      console.log(`Deleting index ${indexDefinition.name}...`);
      await indexClient.deleteIndex(indexDefinition.name);
    }
    console.log(`Creating index ${indexDefinition.name}...`);
    await indexClient.createIndex(indexDefinition);
  },
  ensureIndex: async (indexDefinition: SearchIndex) => {
    const indexClient = new SearchIndexClient(
      SEARCH_ENDPOINT,
      new AzureKeyCredential(ADMIN_KEY)
    );
    let existingIndexes = indexClient.listIndexes();

    // Loop over the existing indexes to check if there is a match on indexDefinition.name
    for await (const index of existingIndexes) {
      if (index.name === indexDefinition.name) {
        console.log(`Index ${indexDefinition.name} already exists.`);
        return;
      }
    }

    console.log(`Creating index ${indexDefinition.name}...`);
    await indexClient.createIndex(indexDefinition);
  },
  uploadDocuments: async <TDoc extends Record<string, any>>(
    indexName: string,
    documents: TDoc[]
  ) => {
    const client = new SearchClient(
      SEARCH_ENDPOINT,
      indexName,
      new AzureKeyCredential(ADMIN_KEY)
    );
    return client.uploadDocuments(documents);
  },
  createSearchClient: <TDoc extends Record<string, any>>(indexName: string) => {
    const client = new SearchClient<TDoc>(
      SEARCH_ENDPOINT,
      indexName,
      new AzureKeyCredential(ADMIN_KEY)
    );
    return client;
  },
};
