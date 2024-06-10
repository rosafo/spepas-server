import gql from 'graphql-tag';

export const commonApiExtensions = gql`
  type CustomSeller implements Node {
    id: ID!
    fullName: String!
    shopName: String!
    emailAddress: String
    phone: String!
    TIN: String!
    businessRegistrationFile: Asset
    profilePicture: Asset
    shopAddress: String!
    aboutShop: String!
    password: String
    status: String
    offers: [productOffer]
  }

  type productOffer implements Node {
    id: ID!
    price: Float!
    deliveryTime: String!
    offerImage: Asset!
    status: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
 
`;

export const shopApiExtensions = gql`
  ${commonApiExtensions}

  extend type Query {
    getSeller: CustomSeller!

  }
`;

export const adminApiExtensions = gql`
  ${commonApiExtensions}

  type CreateSellerRespond {
    message: String!
  }

  extend type Query {
    pendingSellers: [CustomSeller!]!
  }

  extend type Mutation {
    processSellerRequest(id: ID!, decision: String!): CreateSellerRespond!
  }
`;
