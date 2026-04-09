import { httpClient } from './http-client';
import { AxiosError } from 'axios';
import type {
  CreateJobApplicationPayload,
  CreateJobApplicationResponse,
  GetUserApplicationsResponse,
  JobApplication,
} from '../types/applications';

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

  return 'Could not complete request. Please try again.';
};

const getByUser = async (userId: string): Promise<JobApplication[]> => {
  try {
    const response = await httpClient.get<GetUserApplicationsResponse>(
      `/applications/user/${userId}`,
    );

    return response.data.applications;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

const create = async (
  payload: CreateJobApplicationPayload,
): Promise<CreateJobApplicationResponse> => {
  try {
    const response = await httpClient.post<CreateJobApplicationResponse>(
      '/applications',
      payload,
    );

    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

export const applicationsService = {
  getByUser,
  create,
};
