export interface IProject {
  id: number;
  name: string;
  description: string;
  code: string;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
  updatedAt: null;
  isOwner: number;
  enabled: number;
  userId: number;
  projectId: number;
}
export interface IProjectCreate {
  name: string;
  description: string;
  code: string;
  startAt: Date;
  endAt: Date;
}

export interface IProjectUserAssign {
  projectId: number;
  userId: number;
  isOwner: boolean;
  enabled: boolean;
}
