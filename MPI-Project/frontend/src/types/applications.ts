export type ApplicationStatus = 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface JobApplication {
  id: string;
  userId: string;
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserApplicationsResponse {
  message: string;
  applications: JobApplication[];
}
