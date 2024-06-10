import gql from 'graphql-tag';

export const customerApiExtensions = gql`
  type CustomCustomer implements Node {
    id: ID!
    phone: String
    email: String
    fullName: String
    createdAt: DateTime
    updatedAt: DateTime
    avatar: Asset
    addresses: [UserAddress]
    productRequests: [Request]
    reports:[Reports]
  }

  type Request {
    id: ID!
    productName: String!
    quantity: Int!
    make: String!
    model: String!
    description: String!
    year: String!
    countryOfOrigin: String
    condition: String!
    productRequestImage: Asset
    status: String!
    offers: [Offers!]!
  }

   type Offers {
    id: ID!
    seller: SellerInfo!
    price: Float!
    deliveryTime: String!
    offerImage: Asset
    status: String!
    createdAt: DateTime!
    updatedAt: DateTime!
   }

   type SellerInfo {
    id: ID!
    fullName: String!
    shopName: String!
    phone: String!
    profilePicture: Asset
    shopAddress: String!
    aboutShop: String!
  }

  type Reports {
    id: ID!
    orderNumber: String!
    issueType: String!
    description: String
    itemImage: Asset
  }

  type UserAddress {
    id: ID!
    title: String
    city: String
    street: String
    GPS: String
  }

  input PasswordRecoveryInput {
    identifier: String!
  }

  input AddressInput {
    title: String!
    city: String!
    street: String!
    gps: String!
  }

  input EditAddressInput {
    id: ID!
    title: String
    city: String
    street: String
    gps: String
  }

  extend type Query {
    customer: CustomCustomer
  }

  extend type Mutation {
    addAddress(input: AddressInput!): CustomCustomer
    editAddress(input: EditAddressInput!): CustomCustomer
    deleteAddress(id: ID!): CustomCustomer
  }
`;
