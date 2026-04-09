export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface BasicUser {
  id: string;
  fullName: string;
  email: string;
}

export interface RegisteredUser extends BasicUser {
  createdAt: string;
}

export interface RegisterResponse {
  message: string;
  user: RegisteredUser;
}

export interface LoginResponse {
  message: string;
  user: BasicUser;
}
