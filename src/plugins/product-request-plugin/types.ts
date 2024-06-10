import { ID } from '@vendure/core';

export interface ProductRequestInput {
  productName: string;
  quantity: number;
  make: string;
  model: string;
  description: string;
  year: string;
  countryOfOrigin: string;
  condition: string;
  photos: any;
}

export interface EditRequestInput {
  id: ID;
  productName: String;
  quantity: number;
  make: String;
  model: String;
  description: String;
  year: String;
  countryOfOrigin: String;
  condition: String;
}

export interface OfferInput {
  productRequestId: ID;
  price: number;
  deliveryTime: string;
  file: any;
}