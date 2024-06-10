import gql from 'graphql-tag';

export const walletAdminApiExtensions = gql`
 input WithdrawFundsInput {
    amount: Int!
    recipientFullName: String!
    recipientPhoneNumber: String!
    recipientEmail: String!
    paymentMethod: String!
    accountNumber: String!
  }

  input AddWithdrawalAccountInput {
    fullName: String!
    accountNumber: String!
    paymentMethod: String!
  }

  input TransferFundsInput {
    recipientUserId: ID!
    amount: Int!
  }

  input TransactionHistoryInput {
    filter: TransactionFilter
  }

  type WithdrawalResponse {
    success: Boolean!
    message: String
    receipt: Receipt
  }

  type Receipt {
    message: String!
    amountSent: Int!
    refNumber: String!
    paymentTime: String!
    paymentMethod: String!
    senderName: String!
  }

  type ExternalAccount {
    id: ID!
    fullName: String!
    accountNumber: String!
    paymentMethod: String!
  }

  type TransferResponse {
    success: Boolean!
    message: String
  }

  type WalletBalanceResponse {
    balance: Int!
  }

  type TransactionHistoryResponse {
    transactions: [Transaction!]!
  }

  type Transaction {
    id: ID!
    type: String!
    amount: Int!
    date: String!
    status: String!
  }

  enum TransactionFilter {
    ALL
    PENDING
    COMPLETE
  }

  extend type Mutation {
    withdrawFunds(input: WithdrawFundsInput!): WithdrawalResponse!
    addWithdrawalAccount(input: AddWithdrawalAccountInput!): ExternalAccount!
    transferFunds(input: TransferFundsInput!): TransferResponse!
  }

  extend type Query {
    getWalletBalance: WalletBalanceResponse!
    getTransactionHistory(input: TransactionHistoryInput!): TransactionHistoryResponse!
    getExternalAccounts: [ExternalAccount!]!
  }
`;
