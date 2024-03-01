import gql from 'graphql-tag';

export const customerApiExtensions = gql`
  type CustomCustomer implements Node {
    id: ID!
    phone: String
    email: String
    fullName: String
    addressTitle: String
    city: String
    street: String
    GPS: String
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

  input ChangeContactInput {
    currentContact: String!
    newContact: String!
    password: String!
  }

  input ResetPasswordInput {
    newPassword: String!
  }

  input AddressInput {
    title: String!
    city: String
    street: String
    gps: String
  }
  input resendOtpInput {
    phone: String!
  }
  
  extend type Query {
    customer(id: ID!): CustomCustomer
  }

  extend type Mutation {
    initiateAccountCreation(input: InitiateAccountCreationInput!): OtpResult
    resendOtp(input: resendOtpInput!): OtpResult
    completeAccountCreation(input: CompleteAccountCreationInput!): AuthResult
    uploadProfilePicture(file: Upload!): CustomCustomer
    customLogin(input: LoginInput!): AuthResult
    changePassword(oldPassword: String!, newPassword: String!): CustomCustomer
    changeContact(input: ChangeContactInput!): CustomCustomer
    manageAddress(input: AddressInput!): CustomCustomer
    verifyOtp(input: VerifyPasswordRecoveryOtpInput!): verifiedResponse
    initiatePasswordReset(input: InitiatePasswordResetInput!): OtpResult
    resetUserPassword(input: ResetPasswordInput!): CustomCustomer
  }
`;
