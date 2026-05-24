import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  TableProperties,
  Users
} from "lucide-vue-next";
import type { Component } from "vue";
import type { CatalogCategory } from "~/types/admin";

export type AdminNavItem = {
  key?: CatalogCategory;
  path: string;
  label: string;
  description?: string;
  fields?: string[];
  icon: Component;
};

export const dashboardNavItem: AdminNavItem = { path: "/", label: "Dashboard", icon: BarChart3 };
export const processingNavItem: AdminNavItem = { path: "/olah-data", label: "Olah Data", icon: TableProperties };

export const catalogSections: Required<Pick<AdminNavItem, "key" | "path" | "label" | "description" | "fields" | "icon">>[] = [
  {
    key: "milestones",
    path: "/milestones",
    label: "Milestones",
    description: "Kontrol checklist perkembangan anak.",
    fields: ["slug", "label", "category", "ageRange", "minAgeMonths", "maxAgeMonths", "critical", "active", "displayOrder"],
    icon: CheckCircle2
  },
  {
    key: "education",
    path: "/education",
    label: "Materi Edukasi",
    description: "Konten baca yang muncul di aplikasi user.",
    fields: ["title", "ageRange", "duration", "summary", "content", "youtubeUrl", "published", "displayOrder"],
    icon: BookOpen
  },
  {
    key: "activities",
    path: "/activities",
    label: "Stimulasi",
    description: "Aktivitas harian untuk orang tua.",
    fields: ["title", "ageRange", "duration", "description", "published", "displayOrder"],
    icon: Activity
  },
  {
    key: "ageRanges",
    path: "/age-ranges",
    label: "Rentang Usia",
    description: "Master data segmentasi usia.",
    fields: ["label", "minAgeMonths", "maxAgeMonths", "active", "displayOrder"],
    icon: LayoutDashboard
  },
  {
    key: "feedbackQuestions",
    path: "/feedback-questions",
    label: "Pertanyaan Feedback",
    description: "Label, urutan, dan status pertanyaan rating di aplikasi.",
    fields: ["slug", "label", "active", "displayOrder"],
    icon: MessageSquare
  },
  {
    key: "adminUsers",
    path: "/admin-users",
    label: "Admin Users",
    description: "Akses admin, role, dan status login terakhir.",
    fields: ["email", "fullName", "role", "active", "lastLoginAt"],
    icon: Settings
  },
  {
    key: "users",
    path: "/users",
    label: "Users",
    description: "Daftar user aplikasi dan login terakhir.",
    fields: ["email", "fullName", "createdAt", "lastLoginAt"],
    icon: Users
  },
  {
    key: "feedback",
    path: "/feedback",
    label: "Feedback",
    description: "Masukan pengguna dari aplikasi utama.",
    fields: ["respondentName", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "createdAt"],
    icon: MessageSquare
  }
];

export const adminNavItems: AdminNavItem[] = [dashboardNavItem, ...catalogSections, processingNavItem];
export const pageSizeOptions = [10, 25, 50, 100];
export const booleanFields = ["active", "published", "critical"];
export const numberFields = ["minAgeMonths", "maxAgeMonths", "displayOrder", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"];
export const textAreaFields = ["summary", "content", "description"];
export const readonlyCategories: CatalogCategory[] = ["users", "feedback"];
export const readonlyFields = ["lastLoginAt"];
