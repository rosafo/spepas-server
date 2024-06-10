import gql from 'graphql-tag';

export const UserApiExtensions = gql`
  type CustomUser implements Node {
    id: ID!
    phone: String
    email: String
    fullName: String
    avatar: Asset
    roles: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum UserRole {
    CUSTOMER
    RIDER
    SELLER
  }

  type AuthResult {
    token: String!
    user: CustomUser!
  }

  type OtpResult {
    success: Boolean!
    message: String
  }

  type VerifiedResponse {
    token: String!
  }

  input OtpInput {
    otp: String!
  }
  input resendOtpInput {
    phone: String!
  }
  input InitiatePasswordResetInput {
    identifier: String!
  }
  input ResetPasswordInput {
    newPassword: String!
  }
  input LoginInput {
    identifier: String!
    password: String!
  }
  input ChangePasswordInput {
    oldPassword: String!
    newPassword: String!
  }
  input InitiateAccountCreationInput {
    phone: String!
    password: String!
  }
  
  input CustomerInput {
    fullName: String!
    city: String!
    street: String!
    gps: String!
    profilePicture: Upload
  }

  input createRiderInput {
    fullName: String!
    phone: String!
    vehicleRegistrationFile: Upload!
    profilePicture: Upload
    nationalIdCard: Upload!
    vehicleType: String!
    status: String
  }

  input SellerInput {
    fullName: String!
    emailAddress: String
    phone: String!
    TIN: String!
    businessRegistrationFile: Upload
    profilePicture: Upload
    shopAddress: String!
    aboutShop: String!
  }
  
  input ChangeContactInput {
    currentContact: String!
    newContact: String!
    password: String!
  }

  input createSellerInput {
    shopName: String!
    seller: SellerInput!
  }

  input CompleteAccountCreationInput {
    role: UserRole!
    customer: CustomerInput
    rider: createRiderInput
    seller: createSellerInput
  }

  type CompleteAccountCreationResponse {
    success: Boolean
    message: String
    token: String
  }

  extend type Query {
    getCurrentUser: CustomUser
  }

  extend type Mutation {
    customLogin(input: LoginInput!): AuthResult
    switchAccount(newRole: UserRole!): AuthResult
    initiateAccountCreation(input: InitiateAccountCreationInput!): OtpResult
    resendOtp(input: resendOtpInput!): OtpResult
    createAccount(
      input: CompleteAccountCreationInput!
    ): CompleteAccountCreationResponse
    uploadProfilePicture(file: Upload!): Asset
    verifyOtp(input: OtpInput!): VerifiedResponse
    initiatePasswordReset(input: InitiatePasswordResetInput!): OtpResult
    resetUserPassword(input: ResetPasswordInput!): OtpResult
    changePassword(input: ChangePasswordInput!): CustomUser
    changeContact(input: ChangeContactInput!): CustomUser
  }
`;
