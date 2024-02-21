import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import gql from 'graphql-tag';
import { searchSortExtensions } from './api/api-extensions'; 

// Define the schema extension
const schemaExtension = gql`
  ${searchSortExtensions}
`;

class SearchSortResolver {
  TOP_SELLING() {
    return { field: 'TOP_SELLING', direction: 'asc' };
  }
  RECOMMENDED() {
    return { field: 'RECOMMENDED', direction: 'asc' };
  }
  RECENTLY_ADDED() {
    return { field: 'RECENTLY_ADDED', direction: 'asc' };
  }
  PRICE_LOW_TO_HIGH() {
    return { field: 'PRICE_LOW_TO_HIGH', direction: 'asc' };
  }
  PRICE_HIGH_TO_LOW() {
    return { field: 'PRICE_HIGH_TO_LOW', direction: 'asc' };
  }
}

@VendurePlugin({
  imports: [PluginCommonModule],
  shopApiExtensions: {
    schema: schemaExtension,
    resolvers: [SearchSortResolver]
  }
})
export class SearchSortPlugin {}
