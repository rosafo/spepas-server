import {
  ElasticSearchInput,
  ElasticsearchOptions,
  ElasticSearchSortInput,
  ElasticSearchSortParameter
} from '@vendure/elasticsearch-plugin';

export const elasticsearchOptions: ElasticsearchOptions = {
  searchConfig: {
    mapSort: (sort: ElasticSearchSortInput, input: ElasticSearchInput) => {
      const { sortOrder } = input;
      const sortCriteria: { [key: string]: ElasticSearchSortParameter }[] = [
        {}
      ];
      switch (sortOrder) {
        case 'TOP_SELLING':
          sortCriteria[0]['variants.saleCount'] = { order: 'desc' };
          break;
        case 'RECOMMENDED':
          sortCriteria[0]['variants.totalSalesCount'] = {
            order: 'desc',
            weight: 0.7
          };
          sortCriteria[0]['variants.averageRating'] = {
            order: 'desc',
            weight: 0.3
          };
          break;
        case 'RECENTLY_ADDED':
          sortCriteria[0]['createdAt'] = { order: 'desc' };
          break;
        case 'PRICE_LOW_TO_HIGH':
          sortCriteria[0]['price'] = { order: 'asc' };
          break;
        case 'PRICE_HIGH_TO_LOW':
          sortCriteria[0]['price'] = { order: 'desc' };
          break;
        default:
          sortCriteria[0]['createdAt'] = { order: 'desc' };
      }
      return sortCriteria;
    }
  },
  extendSearchSortType: [
    'TOP_SELLING',
    'RECOMMENDED',
    'RECENTLY_ADDED',
    'PRICE_LOW_TO_HIGH',
    'PRICE_HIGH_TO_LOW'
  ],
};
