export type ApiStatus = "success" | "error";

export type ApiResponse<T> = {
  Data: T | null;
  Error: string | Record<string, unknown> | null;
  status: ApiStatus | number;
};

export type AgeRange = "0-6 bln" | "6-12 bln" | "1-2 th" | "2-3 th" | "3-4 th" | "4-5 th";

export type ChecklistCategory = "Motorik Kasar" | "Motorik Halus" | "Bahasa" | "Sosial & Kemandirian";

export type AdminRole = "owner" | "admin" | "editor";

export type CatalogCategory = "milestones" | "education" | "activities" | "ageRanges" | "feedbackQuestions" | "adminUsers" | "users" | "feedback";

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
  youtubeUrl?: string | null;
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

export type AppUser = {
  id: string;
  email: string;
  fullName?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
};

export type FeedbackRecord = {
  id: string;
  respondentName: string;
  ownerId?: string | null;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
  q10: number;
  createdAt: string;
};

export type FeedbackQuestion = {
  id: string;
  slug: string;
  label: string;
  active: boolean;
  displayOrder: number;
};

export type CatalogRecord = MilestoneItem | EducationMaterial | DailyActivity | AgeRangeRecord | FeedbackQuestion | AdminUser | AppUser | FeedbackRecord;

export type CatalogState = {
  milestones: MilestoneItem[];
  education: EducationMaterial[];
  activities: DailyActivity[];
  ageRanges: AgeRangeRecord[];
  feedbackQuestions: FeedbackQuestion[];
  adminUsers: AdminUser[];
  users: AppUser[];
  feedback: FeedbackRecord[];
};

export type ImportResult = {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
};
