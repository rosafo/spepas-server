import { SearchResultSortParameter } from '@vendure/common/lib/generated-types';
import { SearchResolver } from '@vendure/core';

export const searchSortResolver = {
  SearchResultSortParameter: {
    TOP_SELLING: { name: 'variants.saleCount', direction: 'DESC' },
    RECOMMENDED: [
      { name: 'variants.totalSalesCount', direction: 'DESC' },
      { name: 'variants.averageRating', direction: 'DESC', weight: 0.3 }
    ],
    RECENTLY_ADDED: { name: 'createdAt', direction: 'DESC' },
    PRICE_LOW_TO_HIGH: { name: 'price', direction: 'ASC' },
    PRICE_HIGH_TO_LOW: { name: 'price', direction: 'DESC' },
  },
};
