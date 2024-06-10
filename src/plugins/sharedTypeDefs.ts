import gql from 'graphql-tag';

export const sharedTypeDefs = gql`

  type UserAddress {
    id: ID!
    title: String!
    city: String!
    street: String!
    GPS: String!
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

  input resendOtpInput {
    phone: String!
  }

  input LoginInput {
    identifier: String!
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
    password: String
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
    password: String
  }

  input createSellerInput {
    shopName: String!
    seller: SellerInput!
  }

  union CompleteAccountCreationInput =
      CustomerInput
    | createRiderInput
    | createSellerInput

  input InitiateAccountCreationInput {
    phone: String!
    password: String!
  }

  input PasswordRecoveryInput {
    identifier: String!
  }

  input OtpInput {
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

  input ChangePasswordInput {
    oldPassword: String!
    newPassword: String!
  }

  input ResetPasswordInput {
    newPassword: String!
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

  input DeleteAddressInput {
    id: ID!
  }
`;
