import { UserRole } from '../entities/role.entity';
import { CustomCustomer } from '../../customer-plugin/entities/customer.entity';
export type InitiateAccountCreationInput = {
  phone: string;
  password: string;
};

export type LoginInput = {
  identifier: string;
  password: string;
};

export type OtpInput = {
  otp: string;
};

export type InitiatePasswordResetInput = {
  identifier: string;
};

export type ResetPasswordInput = {
  newPassword: string;
};

export type CustomerInput = {
  fullName: string;
  city: string;
  street: string;
  gps: string;
  profilePicture?: { file: any };
};

export type RiderInput = {
  fullName: string;
  phone: string;
  vehicleRegistrationFile: { file: any };
  profilePicture: { file: any };
  nationalIdCard: { file: any };
  vehicleType: string;
  status: string;
};

export type SellerDetailsInput = {
  fullName: string;
  emailAddress: string;
  phone: string;
  TIN: string;
  businessRegistrationFile: { file: any };
  profilePicture: { file: any };
  shopAddress: string;
  aboutShop: string;
};

export type SellerInput = {
  shopName: string;
  seller: SellerDetailsInput;
};

export interface CompleteAccountCreationInput {
  role: UserRole;
  customer?: CustomerInput;
  rider?: RiderInput;
  seller?: SellerInput;
}

export type ChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
};

type CustomerResponse = {
  token: string;
  user: CustomCustomer;
};

type SellerResponse = {
  success: Boolean;
  message: string;
};

type RiderResponse = {
  success: Boolean;
  message: string;
};



type GenericResponse = {
  success: Boolean;
  message: string;
};
export interface AccountCreationResult {
  CustomerResponse?: CustomerResponse;
  RiderResponse?: RiderResponse;
  SellerResponse?: SellerResponse;
}
