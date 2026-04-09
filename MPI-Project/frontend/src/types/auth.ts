export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisteredUser {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface RegisterResponse {
  message: string;
  user: RegisteredUser;
}
