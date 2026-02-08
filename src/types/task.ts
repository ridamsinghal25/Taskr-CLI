export enum TaskType {
  Normal = "normal",
  Critical = "critical",
}

export enum TaskStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Done = "done",
  Archived = "archived",
}

export const TASK_TYPES = Object.values(TaskType);
export const TASK_STATUSES = Object.values(TaskStatus);

export type Task = {
  id: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GetTasks = {
  tasks: Task[];
};

export type DeleteTasks = {
  count: number;
};