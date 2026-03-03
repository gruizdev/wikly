export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ObjectiveColor = 'purple' | 'pink' | 'blue' | 'green' | 'orange' | 'yellow';

export interface Objective {
  id: string;
  title: string;
  icon?: string;
  frequency: FrequencyType;
  color: ObjectiveColor;
  createdAt: Date;
  completedDates: string[]; // YYYY-MM-DD format
}

export interface ObjectiveWithStatus extends Objective {
  isCompletedToday: boolean;
  nextDueDate: string;
}
