import { httpClient } from './http-client';
import { AxiosError } from 'axios';
import type {
  ApplicationStatus,
  AddApplicationNotePayload,
  AddApplicationNoteResponse,
  CreateJobApplicationPayload,
  CreateJobApplicationResponse,
  DeleteApplicationNotePayload,
  DeleteApplicationNoteResponse,
  DeleteJobApplicationPayload,
  DeleteJobApplicationResponse,
  GetApplicationNotesResponse,
  GetUserApplicationStatsResponse,
  GetUserApplicationsResponse,
  JobApplication,
  UserApplicationStats,
  UpdateApplicationNotePayload,
  UpdateApplicationNoteResponse,
  UpdateJobApplicationPayload,
  UpdateJobApplicationResponse,
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

const getByUserAndStatus = async (
  userId: string,
  status: ApplicationStatus,
): Promise<JobApplication[]> => {
  try {
    const response = await httpClient.get<GetUserApplicationsResponse>(
      `/applications/user/${userId}/status/${status}`,
    );

    return response.data.applications;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

const getStatsByUser = async (userId: string): Promise<UserApplicationStats> => {
  try {
    const response = await httpClient.get<GetUserApplicationStatsResponse>(
      `/applications/user/${userId}/stats`,
    );

    return response.data.stats;
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

const update = async (
  id: string,
  payload: UpdateJobApplicationPayload,
): Promise<UpdateJobApplicationResponse> => {
  try {
    const response = await httpClient.patch<UpdateJobApplicationResponse>(
      `/applications/${id}`,
      payload,
    );

    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

const addNote = async (
  id: string,
  payload: AddApplicationNotePayload,
): Promise<AddApplicationNoteResponse> => {
  try {
    const response = await httpClient.post<AddApplicationNoteResponse>(
      `/applications/${id}/notes`,
      payload,
    );

    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

const getNotesByApplication = async (
  id: string,
  userId: string,
): Promise<GetApplicationNotesResponse['notes']> => {
  try {
    const response = await httpClient.get<GetApplicationNotesResponse>(
      `/applications/${id}/notes/user/${userId}`,
    );

    return response.data.notes;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

const updateNote = async (
  applicationId: string,
  noteId: string,
  payload: UpdateApplicationNotePayload,
): Promise<UpdateApplicationNoteResponse> => {
  try {
    const response = await httpClient.patch<UpdateApplicationNoteResponse>(
      `/applications/${applicationId}/notes/${noteId}`,
      payload,
    );

    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

const removeNote = async (
  applicationId: string,
  noteId: string,
  payload: DeleteApplicationNotePayload,
): Promise<DeleteApplicationNoteResponse> => {
  try {
    const response = await httpClient.delete<DeleteApplicationNoteResponse>(
      `/applications/${applicationId}/notes/${noteId}`,
      { data: payload },
    );

    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

const remove = async (
  id: string,
  payload: DeleteJobApplicationPayload,
): Promise<DeleteJobApplicationResponse> => {
  try {
    const response = await httpClient.delete<DeleteJobApplicationResponse>(
      `/applications/${id}`,
      { data: payload },
    );

    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
};

export const applicationsService = {
  getByUser,
  getByUserAndStatus,
  getStatsByUser,
  create,
  update,
  addNote,
  getNotesByApplication,
  updateNote,
  removeNote,
  remove,
};
