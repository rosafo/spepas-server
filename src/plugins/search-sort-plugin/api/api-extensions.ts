import gql from 'graphql-tag';

export const searchSortExtensions = gql`
  extend enum SearchResultSortParameter {
    TOP_SELLING
    RECOMMENDED
    RECENTLY_ADDED
    PRICE_LOW_TO_HIGH
    PRICE_HIGH_TO_LOW
  }
`;
