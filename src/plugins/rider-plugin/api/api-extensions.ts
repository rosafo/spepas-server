import gql from 'graphql-tag';

export const commonApiExtensions = gql`
  type Rider implements Node {
    id: ID!
    fullName: String!
    phone: String!
    vehicleRegistrationFile: Asset
    vehicleType: String
    avatar: Asset
    nationalIdCard: Asset
    status: String
    requests: [RequestDetails]
  }

  type RequestDetails {
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
    Date: DateTime
  }
`;

export const shopApiExtensions = gql`
  ${commonApiExtensions}

  extend type Query {
    rider: Rider!
  }
  
  extend type Mutation {
    setRiderOnline: Boolean!
  }
`;

export const adminApiExtensions = gql`
  ${commonApiExtensions}

  type CreateRiderRespond {
    success: Boolean!
    message: String
  }

  extend type Query {
    pendingRiders: [Rider!]!
  }

  extend type Mutation {
    processRiderRequest(id: ID!, decision: String!): CreateRiderRespond!
  }
`;
