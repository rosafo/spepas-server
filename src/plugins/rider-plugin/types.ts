import {Rider} from './entities/rider.entity'

export interface RiderInput {
  fullName: string;
  phone: string;
  vehicleRegistrationFile: any;
  vehicleType: string;
  profilePicture: any;
  nationalIdCard: any;
  password: string;
  status: string;
}

export interface  LoginInput {
  identifier: string;
  password: string;
}

export interface  AuthResult {
  token: string;
  rider: Rider;
}

export interface ChangePasswordInput {
  newPassword: String;
}

export interface   ChangeContactInput {
  newContact: string;
}

export interface   InitiatePasswordResetInput {
  identifier: string;
}

export interface  LoginInput {
  identifier: string;
  password: string;
}
export interface  OtpInput {
  otp: String;
}

export interface  ResetPasswordInput {
  newPassword: String;
}

export interface OtpResult {
  success: Boolean;
  message: String
}

export interface CreateRiderRespond {
  message: String;
}
export interface verifiedResponse {
  token: String;
}

export interface  InitiateRiderAccountInput {
  phone: string;
  password: string;
}
