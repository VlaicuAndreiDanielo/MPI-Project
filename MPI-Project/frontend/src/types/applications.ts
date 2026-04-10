export type ApplicationStatus = 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
export type ApplicationFilterStatus = ApplicationStatus | 'ALL';

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

export interface CreateJobApplicationPayload {
  userId: string;
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface CreateJobApplicationResponse {
  message: string;
  application: JobApplication;
}

export interface UpdateJobApplicationPayload {
  userId: string;
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface UpdateJobApplicationResponse {
  message: string;
  application: JobApplication;
}

export interface AddApplicationNotePayload {
  userId: string;
  content: string;
}

export interface AddApplicationNoteResponse {
  message: string;
  note: ApplicationNote;
}

export interface ApplicationNote {
  id: string;
  applicationId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetApplicationNotesResponse {
  message: string;
  notes: ApplicationNote[];
}

export interface UpdateApplicationNotePayload {
  userId: string;
  content: string;
}

export interface UpdateApplicationNoteResponse {
  message: string;
  note: ApplicationNote;
}

export interface DeleteApplicationNotePayload {
  userId: string;
}

export interface DeleteApplicationNoteResponse {
  message: string;
}

export interface DeleteJobApplicationPayload {
  userId: string;
}

export interface DeleteJobApplicationResponse {
  message: string;
}
