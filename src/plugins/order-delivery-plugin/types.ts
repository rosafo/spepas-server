import {ID,Asset } from '@vendure/core';

export interface LocationInput {
  latitude: number;
  longitude: number;
}

export interface RiderDetails {
  id: ID;
  fullName: string;
  phone: string;
  avatar: Asset;
  vehicle: string;
  rating: number;
  distance: number;
  eta: string;
}

export interface CustomerDetails {
  id: ID;
  fullName: string;
  phone: string;
  avatar: Asset;
  status: string;
}

export interface SellerDetails {
  id: ID;
  fullName: string;
  phone: string;
  avatar: Asset;
  status: string;
}

export interface DeliveryDetails {
  id: ID;
  orderId: string;
  pickUpAddress: string;
  pickUpDistance: number;
  dropOffAddress: string;
  dropOffDistance: number;
  totalDistance: number;
  payment: number;
  estimatedTime: string;
  status: string;
  deliveryProof: Asset;
  customer: CustomerDetails;
  rider: RiderDetails;
  seller: SellerDetails;
}

export interface OrderDetails {
  id: ID;
  orderStatus: string;
  rider: RiderDetails;
}

export interface DecisionResponse {
  success: boolean;
  message: string;
}

export interface foundResponse {
  success: boolean;
  message: string;
  data: OrderDetails;
}