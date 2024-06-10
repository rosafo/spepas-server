import gql from 'graphql-tag';

export const reportApiExtensions = gql`
  type Report implements Node {
    id: ID!
    orderNumber: String!
    issueType: String!
    description: String!
    itemImage: Asset!
  }

  input ReportIssueInput {
    orderNumber: String!
    issueType: String!
    description: String!
  }

  type ReportResponse {
    success: Boolean!
    message: String
  }

  extend type Mutation {
    reportIssue(input: ReportIssueInput!, file: Upload!): ReportResponse!
  }
`;
