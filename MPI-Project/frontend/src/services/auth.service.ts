import { AxiosError } from 'axios';
import { httpClient } from './http-client';
import type { RegisterPayload, RegisterResponse } from '../types/auth';

interface ApiErrorResponse {
  message?: string | string[];
}

const toErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const responseMessage = (error.response?.data as ApiErrorResponse | undefined)?.message;

    if (Array.isArray(responseMessage) && responseMessage.length > 0) {
      return responseMessage[0];
    }

    if (typeof responseMessage === 'string' && responseMessage.length > 0) {
      return responseMessage;
    }
  }

  return 'Registration failed. Please try again.';
};

const register = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  try {
    const response = await httpClient.post<RegisterResponse>('/auth/register', payload);
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

export const authService = {
  register,
};
