export type ApiStatus = "success" | "error";

export type ApiResponse<T> = {
  Data: T | null;
  Error: string | Record<string, unknown> | null;
  status: ApiStatus | number;
};

export type AgeRange = "0-6 bln" | "6-12 bln" | "1-2 th" | "2-3 th" | "3-4 th" | "4-5 th";

export type ChecklistCategory = "Motorik Kasar" | "Motorik Halus" | "Bahasa" | "Sosial & Kemandirian";

export type AdminRole = "owner" | "admin" | "editor";

export type CatalogCategory = "milestones" | "education" | "activities" | "ageRanges" | "adminUsers" | "feedback";

export type MilestoneItem = {
  id: string;
  slug: string;
  label: string;
  category: ChecklistCategory;
  ageRange: AgeRange;
  minAgeMonths: number;
  maxAgeMonths: number;
  critical: boolean;
  active: boolean;
  displayOrder: number;
};

export type EducationMaterial = {
  id: string;
  title: string;
  ageRange: AgeRange;
  duration: string;
  summary: string;
  content: string;
  published: boolean;
  displayOrder: number;
};

export type DailyActivity = {
  id: string;
  title: string;
  ageRange: AgeRange;
  duration: string;
  description: string;
  published: boolean;
  displayOrder: number;
};

export type AgeRangeRecord = {
  id: string;
  label: AgeRange;
  minAgeMonths: number;
  maxAgeMonths: number;
  active: boolean;
  displayOrder: number;
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt?: string | null;
};

export type FeedbackRecord = {
  id: string;
  respondentName: string;
  ownerId?: string | null;
  flowAnswer?: string | null;
  helpfulAnswer?: string | null;
  confusingAnswer?: string | null;
  languageAnswer?: string | null;
  featuresAnswer?: string | null;
  usabilityRating: number;
  clarityRating: number;
  visualRating: number;
  usefulnessRating: number;
  createdAt: string;
};

export type CatalogRecord = MilestoneItem | EducationMaterial | DailyActivity | AgeRangeRecord | AdminUser | FeedbackRecord;

export type CatalogState = {
  milestones: MilestoneItem[];
  education: EducationMaterial[];
  activities: DailyActivity[];
  ageRanges: AgeRangeRecord[];
  adminUsers: AdminUser[];
  feedback: FeedbackRecord[];
};

export type ImportResult = {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
};
