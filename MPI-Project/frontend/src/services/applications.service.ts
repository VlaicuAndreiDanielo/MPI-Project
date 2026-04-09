import { httpClient } from './http-client';
import type { GetUserApplicationsResponse, JobApplication } from '../types/applications';

const getByUser = async (userId: string): Promise<JobApplication[]> => {
  const response = await httpClient.get<GetUserApplicationsResponse>(
    `/applications/user/${userId}`,
  );

  return response.data.applications;
};

export const applicationsService = {
  getByUser,
};
