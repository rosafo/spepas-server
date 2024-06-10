import gql from 'graphql-tag';

export const productRequestsApiExtensions = gql`
  type ProductRequest implements Node {
    id: ID!
    productName: String!
    quantity: Int!
    make: String!
    model: String!
    description: String!
    year: String!
    countryOfOrigin: String
    condition: String!
    productRequestImage: Asset!
    status: String!
    offers: [Offer!]!
  }

  type Offer implements Node {
    id: ID!
    seller: CusSeller!
    price: Float!
    deliveryTime: String!
    offerImage: Asset!
    status: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CusSeller {
    id: ID!
    fullName: String!
    shopName: String!
    phone: String!
    profilePicture: Asset
    shopAddress: String!
    aboutShop: String!
  }

  input OfferInput {
    requestId: ID!
    price: Float!
    deliveryTime: String!
    file: Upload!
  }

  input ProductRequestInput {
    productName: String!
    quantity: Int!
    make: String!
    model: String!
    description: String!
    year: String!
    countryOfOrigin: String
    condition: String!
  }

  input EditRequestInput {
    id: ID!
    productName: String!
    quantity: Int!
    make: String!
    model: String!
    description: String!
    year: String!
    countryOfOrigin: String
    condition: String!
  }

  type ProductRequestResponse {
    success: Boolean!
    message: String
  }

  type OfferResponse {
    success: Boolean!
    message: String
  }

  extend type Query {
    getProductRequestsForSellers: [ProductRequest!]!
    getProductRequest: [ProductRequest!]!
    getOffersForProductRequest(requestId: ID!): [Offer!]!
  }

  extend type Mutation {
    submitProductRequest(
      input: ProductRequestInput!
      file: Upload!
    ): ProductRequestResponse!

    submitOffer(input: OfferInput!): OfferResponse!
    processOffer(offerId:ID! ,decision:String!): OfferResponse!

    editProductRequest(
      input: EditRequestInput!
      file: Upload
    ): [ProductRequest!]!

    deleteProductRequest(itemId: ID!): [ProductRequest!]!
  }
`;
