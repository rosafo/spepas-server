import { gql } from '@apollo/client';

// Define your GraphQL queries and mutations
export const GET_PENDING_SELLERS = gql`
  query GetPendingSellers {
    pendingSellers {
      id
      fullName
      emailAddress
      phone
    }
  }
`;

export const PROCESS_SELLER_REQUEST = gql`
  mutation ProcessSellerRequest($id: ID!, $decision: String!) {
    processSellerRequest(id: $id, decision: $decision) {
      message
    }
  }
`;
