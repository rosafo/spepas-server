import gql from 'graphql-tag';

export const customerApiExtensions = gql`
  type CustomCustomer implements Node {
    id: ID!
    phone: String
    email: String
    fullName: String
    city: String
    street: String
    gps: String
    createdAt: DateTime!
    updatedAt: DateTime!
    avatar: String
  }

  type OtpResult {
    success: Boolean!
    message: String
  }

  type AuthResult {
    token: String!
    user: CustomCustomer!
  }

  type verifiedResponse {
    token: String!
  }

  input LoginInput {
    identifier: String!
    password: String!
  }

  input InitiateAccountCreationInput {
    phone: String!
    password: String!
  }

  input CompleteAccountCreationInput {
    userId: String!
    fullName: String!
    city: String!
    street: String!
    gps: String!
    profilePicture: Upload
  }

  input PasswordRecoveryInput {
    identifier: String!
  }

  input VerifyPasswordRecoveryOtpInput {
    otp: String!
  }

  input InitiatePasswordResetInput {
    identifier: String!
  }

  input ResetPasswordInput {
    userId: String!
    newPassword: String!
  }

  extend type Query {
    customer(id: ID!): CustomCustomer
  }

  extend type Mutation {
    initiateAccountCreation(input: InitiateAccountCreationInput!): OtpResult
    completeAccountCreation(input: CompleteAccountCreationInput!): AuthResult
    uploadProfilePicture(file: Upload!): String
    customLogin(input: LoginInput!): AuthResult
    changePassword(
      customerId: ID!
      oldPassword: String!
      newPassword: String!
    ): CustomCustomer
    verifyOtp(input: VerifyPasswordRecoveryOtpInput!): verifiedResponse
    initiatePasswordReset(input: InitiatePasswordResetInput!): OtpResult
    resetUserPassword(input: ResetPasswordInput!): CustomCustomer
  }
`;
