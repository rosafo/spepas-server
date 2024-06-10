import gql from 'graphql-tag';

export const DeliveryApiExtensions = gql`
  type DeliveryDetails implements Node {
    id: ID!
    orderId: ID!
    pickUpAddress: String!
    pickUpDistance: Float!
    dropOffAddress: String!
    dropOffDistance: Float!
    totalDistance: Float!
    payment: Float!
    estimatedTime: String!
    status: String!
    deliveryProof: Asset
    customer: CustomerDetails
    rider: RiderDetails
    seller: SellerDetails
  }

  input LocationInput {
    latitude: Float!
    longitude: Float!
  }

  type OrderDetails {
    id: ID!
    orderStatus: String!
    rider: RiderDetails
  }

  type RiderDetails {
    id: ID!
    fullName: String!
    phone: String!
    avatar: Asset
    vehicle: String!
    rating: Float
    distance: Float
    eta: String!
  }

  type CustomerDetails {
    id: ID!
    fullName: String!
    phone: String!
    avatar: Asset
    status: String
  }

  type SellerDetails {
    id: ID!
    fullName: String!
    phone: String!
    avatar: Asset
    status: String
  }

  input OrderInput {
    orderId: String!
    pickUpAddress: String!
    pickUpDistance: Float!
    dropOffAddress: String!
    dropOffDistance: Float!
    totalDistance: Float!
    payment: Float!
    estimatedTime: String!
  }

  type DecisionResponse {
    success: Boolean!
    message: String
  }
  type foundResponse {
    success: Boolean!
    message: String!
    data: OrderDetails!
  }

  extend type Query {
    getDeliveryDetails(orderId: ID!): DeliveryDetails!
    generateQRCode(text: String!): String!
  }

  extend type Mutation {
    findRider(orderId: ID!): foundResponse!
    processRequest(requestId: ID!, decision: String!): DecisionResponse!
    updateRiderLocation(riderId: ID!, location: LocationInput!): RiderDetails
    scanQRCode(file: Upload!): String!
    submitDeliveryProof(file: Upload!): Asset
    updateOrderStatus(orderId: ID!, status: String!): OrderDetails!
  }
`;
