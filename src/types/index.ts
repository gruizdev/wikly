export type FrequencyType = 'weekly' | 'monthly' | 'yearly';

export interface Objective {
  id: string;
  title: string;
  icon?: string;
  frequency: FrequencyType;
  createdAt: Date;
  completedDates: string[]; // YYYY-MM-DD format
}

export interface ObjectiveWithStatus extends Objective {
  isCompletedToday: boolean;
  nextDueDate: string;
}
