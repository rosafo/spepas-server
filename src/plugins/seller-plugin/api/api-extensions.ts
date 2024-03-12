import gql from 'graphql-tag';

export const SellerApiExtensions = gql`
  input SellerInput {
    fullName: String!
    emailAddress: String
    phone: String!
    TIN: String!
    businessRegistrationFile: Upload
    profilePicture: Upload
    shopAddress: String!
    aboutShop: String!
    password: String
  }

  input createSellerInput {
    shopName: String!
    seller: SellerInput!
  }

  type CreateSellerPayload {
    message: String!
  }

  type CustomSeller {
    id: ID!
    fullName: String!
    emailAddress: String
    phone: String!
    TIN: String!
    businessRegistrationFile: String
    profilePicture: String
    shopAddress: String!
    aboutShop: String!
    password: String
    status: String
  }

  extend type Mutation {
    createNewSeller(input: createSellerInput!): CreateSellerPayload!
  }

  extend type Mutation {
    processSellerRequest(id: ID!, decision: String!): CreateSellerPayload!
  }

  extend type Query {
    pendingSellers: [CustomSeller!]!
  }
`;
