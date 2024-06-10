import { gql } from '@apollo/client';

// Define your GraphQL queries and mutations
export const GET_PENDING_SELLERS = gql`
  query GetPendingRiders {
    pendingRiders {
      id
      fullName
      phone
      vehicleRegistrationFile
      vehicleType
      nationalIdCard
      status
    }
  }
`;

export const PROCESS_RIDER_REQUEST = gql`
  mutation processRiderRequest($id: ID!, $decision: String!) {
    processRiderRequest(id: $id, decision: $decision) {
      message
    }
  }
`;
