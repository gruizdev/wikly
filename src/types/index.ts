export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ObjectiveColor = 'purple' | 'pink' | 'blue' | 'green' | 'orange' | 'yellow';

export interface Tag {
  id: string;
  name: string;
}

export interface Objective {
  id: string;
  title: string;
  icon?: string;
  frequency: FrequencyType;
  color: ObjectiveColor;
  tags: Tag[];
  createdAt: Date;
  completedDates: string[]; // YYYY-MM-DD format
}

export interface ObjectiveWithStatus extends Objective {
  isCompletedToday: boolean;
  nextDueDate: string;
}
