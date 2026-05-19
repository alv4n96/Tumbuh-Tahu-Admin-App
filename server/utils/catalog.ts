import { createClient } from "@supabase/supabase-js";
import type {
  AdminUser,
  AppUser,
  AgeRangeRecord,
  CatalogCategory,
  CatalogRecord,
  CatalogState,
  DailyActivity,
  EducationMaterial,
  FeedbackRecord,
  MilestoneItem
} from "../../types/admin";

const ageRanges: AgeRangeRecord[] = [
  { id: "0-6-bln", label: "0-6 bln", minAgeMonths: 0, maxAgeMonths: 6, active: true, displayOrder: 1 },
  { id: "6-12-bln", label: "6-12 bln", minAgeMonths: 6, maxAgeMonths: 12, active: true, displayOrder: 2 },
  { id: "1-2-th", label: "1-2 th", minAgeMonths: 12, maxAgeMonths: 24, active: true, displayOrder: 3 },
  { id: "2-3-th", label: "2-3 th", minAgeMonths: 24, maxAgeMonths: 36, active: true, displayOrder: 4 },
  { id: "3-4-th", label: "3-4 th", minAgeMonths: 36, maxAgeMonths: 48, active: true, displayOrder: 5 },
  { id: "4-5-th", label: "4-5 th", minAgeMonths: 48, maxAgeMonths: 60, active: true, displayOrder: 6 }
];

const milestones: MilestoneItem[] = [
  {
    id: "sit",
    slug: "sit",
    label: "Duduk tanpa bantuan",
    category: "Motorik Kasar",
    ageRange: "6-12 bln",
    minAgeMonths: 6,
    maxAgeMonths: 12,
    critical: true,
    active: true,
    displayOrder: 1
  },
  {
    id: "crawl",
    slug: "crawl",
    label: "Merangkak",
    category: "Motorik Kasar",
    ageRange: "6-12 bln",
    minAgeMonths: 6,
    maxAgeMonths: 12,
    critical: true,
    active: true,
    displayOrder: 2
  },
  {
    id: "respond-name",
    slug: "respond-name",
    label: "Merespon ketika dipanggil namanya",
    category: "Bahasa",
    ageRange: "6-12 bln",
    minAgeMonths: 6,
    maxAgeMonths: 12,
    critical: true,
    active: true,
    displayOrder: 3
  }
];

const education: EducationMaterial[] = [
  {
    id: "materi-6-12-milestone",
    title: "Memahami Perkembangan Anak 6-12 Bulan",
    ageRange: "6-12 bln",
    duration: "5 menit baca",
    summary: "Kenali milestone, stimulasi yang tepat, dan tanda yang perlu diperhatikan secara dini.",
    content: "Konten edukasi dapat diperluas dari admin panel.",
    published: true,
    displayOrder: 1
  },
  {
    id: "materi-0-6-komunikasi",
    title: "Membangun Komunikasi Hangat Sejak Bayi",
    ageRange: "0-6 bln",
    duration: "6 menit baca",
    summary: "Bahasa sederhana, kontak mata, dan rutinitas membantu stimulasi komunikasi sejak dini.",
    content: "Gunakan contoh aktivitas harian yang mudah dilakukan orang tua.",
    published: true,
    displayOrder: 2
  }
];

const activities: DailyActivity[] = [
  {
    id: "activity-peekaboo",
    title: "Ajak bermain ciluk ba",
    ageRange: "6-12 bln",
    duration: "10 menit",
    description: "Permainan sederhana untuk melatih interaksi sosial dan respon visual.",
    published: true,
    displayOrder: 1
  },
  {
    id: "activity-crawl",
    title: "Latihan merangkak",
    ageRange: "6-12 bln",
    duration: "10 menit",
    description: "Siapkan area aman agar anak terdorong bergerak dan mengeksplorasi.",
    published: true,
    displayOrder: 2
  }
];

export const adminUsers: AdminUser[] = [
  { id: "owner", email: "owner@tumbuhtahu.test", fullName: "Owner Tumbuh Tahu", role: "owner", active: true, lastLoginAt: null },
  { id: "admin-growth", email: "growth@tumbuhtahu.test", fullName: "Admin Growth", role: "admin", active: true, lastLoginAt: null },
  { id: "admin-content", email: "content@tumbuhtahu.test", fullName: "Admin Content", role: "editor", active: true, lastLoginAt: null },
  { id: "admin-clinic", email: "clinic@tumbuhtahu.test", fullName: "Admin Clinic", role: "admin", active: true, lastLoginAt: null },
  { id: "admin-support", email: "support@tumbuhtahu.test", fullName: "Admin Support", role: "editor", active: true, lastLoginAt: null }
];

export const catalogKeys: CatalogCategory[] = ["milestones", "education", "activities", "ageRanges", "adminUsers", "users", "feedback"];

export const templates: Record<CatalogCategory, string[]> = {
  milestones: ["slug", "label", "category", "ageRange", "minAgeMonths", "maxAgeMonths", "critical", "active", "displayOrder"],
  education: ["title", "ageRange", "duration", "summary", "content", "published", "displayOrder"],
  activities: ["title", "ageRange", "duration", "description", "published", "displayOrder"],
  ageRanges: ["label", "minAgeMonths", "maxAgeMonths", "active", "displayOrder"],
  adminUsers: ["email", "fullName", "role", "active", "lastLoginAt"],
  users: ["email", "fullName", "createdAt", "lastLoginAt"],
  feedback: [
    "respondentName",
    "ownerId",
    "flowAnswer",
    "helpfulAnswer",
    "confusingAnswer",
    "languageAnswer",
    "featuresAnswer",
    "usabilityRating",
    "clarityRating",
    "visualRating",
    "usefulnessRating",
    "createdAt"
  ]
};

export function seedCatalog(): CatalogState {
  return {
    milestones: structuredClone(milestones),
    education: structuredClone(education),
    activities: structuredClone(activities),
    ageRanges: structuredClone(ageRanges),
    adminUsers: structuredClone(adminUsers),
    users: [],
    feedback: []
  };
}

export function isCatalogCategory(value: string): value is CatalogCategory {
  return catalogKeys.includes(value as CatalogCategory);
}

export async function getCatalogState() {
  const supabaseState = await getSupabaseCatalogState();
  if (supabaseState) {
    return supabaseState;
  }

  const storage = useStorage<CatalogState>("adminCatalog");
  const existing = await storage.getItem("state");
  if (existing) {
    return existing;
  }

  const seeded = seedCatalog();
  await storage.setItem("state", seeded);
  return seeded;
}

export async function saveCatalogState(state: CatalogState) {
  const storage = useStorage<CatalogState>("adminCatalog");
  await storage.setItem("state", state);
}

export async function upsertCatalogRecord(category: CatalogCategory, record: CatalogRecord) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const table = tableForCategory(category);
    const payload = toDatabaseRecord(category, record);
    const { error } = await supabase.from(table).upsert(payload as never);
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
    return;
  }

  if (requireDatabaseInThisEnvironment()) {
    assertDatabaseConfigured();
  }

  const state = await getCatalogState();
  const list = state[category] as CatalogRecord[];
  state[category] = [record, ...list.filter((item) => item.id !== record.id)] as never;
  await saveCatalogState(state);
}

export async function deleteCatalogRecord(category: CatalogCategory, id: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const table = tableForCategory(category);
    const { error } = await supabase.from(table).delete().eq(category === "milestones" ? "slug" : "id", id);
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
    return;
  }

  if (requireDatabaseInThisEnvironment()) {
    assertDatabaseConfigured();
  }

  const state = await getCatalogState();
  const list = state[category] as CatalogRecord[];
  state[category] = list.filter((item) => item.id !== id) as never;
  await saveCatalogState(state);
}

export async function bulkUpsertCatalogRecords(category: CatalogCategory, records: CatalogRecord[]) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const table = tableForCategory(category);
    const payload = records.map((record) => toDatabaseRecord(category, record));
    const { error } = await supabase.from(table).upsert(payload as never);
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
    return;
  }

  if (requireDatabaseInThisEnvironment()) {
    assertDatabaseConfigured();
  }

  const state = await getCatalogState();
  const list = state[category] as CatalogRecord[];
  const incomingIds = new Set(records.map((item) => item.id));
  state[category] = [...records, ...list.filter((item) => !incomingIds.has(item.id))] as never;
  await saveCatalogState(state);
}

export function normalizeRecord(category: CatalogCategory, input: Record<string, unknown>, options: { preserveEmptyId?: boolean } = {}): CatalogRecord {
  const id = String(input.id || (options.preserveEmptyId ? "" : crypto.randomUUID()));
  if (category === "milestones") {
    return {
      id,
      slug: String(input.slug || id),
      label: String(input.label || ""),
      category: String(input.category || "Motorik Kasar") as MilestoneItem["category"],
      ageRange: String(input.ageRange || "6-12 bln") as MilestoneItem["ageRange"],
      minAgeMonths: Number(input.minAgeMonths || 6),
      maxAgeMonths: Number(input.maxAgeMonths || 12),
      critical: parseBoolean(input.critical),
      active: input.active === undefined ? true : parseBoolean(input.active),
      displayOrder: Number(input.displayOrder || 0)
    };
  }

  if (category === "education") {
    return {
      id,
      title: String(input.title || ""),
      ageRange: String(input.ageRange || "6-12 bln") as EducationMaterial["ageRange"],
      duration: String(input.duration || "5 menit baca"),
      summary: String(input.summary || ""),
      content: String(input.content || ""),
      published: input.published === undefined ? true : parseBoolean(input.published),
      displayOrder: Number(input.displayOrder || 0)
    };
  }

  if (category === "activities") {
    return {
      id,
      title: String(input.title || ""),
      ageRange: String(input.ageRange || "6-12 bln") as DailyActivity["ageRange"],
      duration: String(input.duration || "10 menit"),
      description: String(input.description || ""),
      published: input.published === undefined ? true : parseBoolean(input.published),
      displayOrder: Number(input.displayOrder || 0)
    };
  }

  if (category === "ageRanges") {
    return {
      id,
      label: String(input.label || "6-12 bln") as AgeRangeRecord["label"],
      minAgeMonths: Number(input.minAgeMonths || 0),
      maxAgeMonths: Number(input.maxAgeMonths || 12),
      active: input.active === undefined ? true : parseBoolean(input.active),
      displayOrder: Number(input.displayOrder || 0)
    };
  }

  if (category === "feedback") {
    return {
      id,
      respondentName: String(input.respondentName || ""),
      ownerId: input.ownerId ? String(input.ownerId) : null,
      flowAnswer: input.flowAnswer ? String(input.flowAnswer) : null,
      helpfulAnswer: input.helpfulAnswer ? String(input.helpfulAnswer) : null,
      confusingAnswer: input.confusingAnswer ? String(input.confusingAnswer) : null,
      languageAnswer: input.languageAnswer ? String(input.languageAnswer) : null,
      featuresAnswer: input.featuresAnswer ? String(input.featuresAnswer) : null,
      usabilityRating: Number(input.usabilityRating || 0),
      clarityRating: Number(input.clarityRating || 0),
      visualRating: Number(input.visualRating || 0),
      usefulnessRating: Number(input.usefulnessRating || 0),
      createdAt: input.createdAt ? String(input.createdAt) : new Date().toISOString()
    };
  }

  if (category === "users") {
    return {
      id,
      email: String(input.email || ""),
      fullName: input.fullName ? String(input.fullName) : null,
      createdAt: input.createdAt ? String(input.createdAt) : null,
      lastLoginAt: input.lastLoginAt ? String(input.lastLoginAt) : null
    };
  }

  return {
    id,
    email: String(input.email || ""),
    fullName: String(input.fullName || ""),
    role: String(input.role || "admin") as AdminUser["role"],
    active: input.active === undefined ? true : parseBoolean(input.active),
    lastLoginAt: input.lastLoginAt ? String(input.lastLoginAt) : null
  };
}

export function validateRecord(category: CatalogCategory, input: CatalogRecord) {
  const missing: string[] = [];
  const optionalFields = [
    "content",
    "displayOrder",
    "active",
    "published",
    "critical",
    "ownerId",
    "flowAnswer",
    "helpfulAnswer",
    "confusingAnswer",
    "languageAnswer",
    "featuresAnswer",
    "createdAt",
    "lastLoginAt"
  ];
  const required = templates[category].filter((field) => !optionalFields.includes(field));
  for (const field of required) {
    if (!String((input as unknown as Record<string, unknown>)[field] ?? "").trim()) {
      missing.push(field);
    }
  }

  if ((category === "adminUsers" || category === "users") && !String((input as AdminUser | AppUser).email).includes("@")) {
    missing.push("valid email");
  }

  if (missing.length) {
    return `Missing or invalid: ${missing.join(", ")}`;
  }

  return null;
}

function parseBoolean(value: unknown) {
  return value === true || String(value).toLowerCase() === "true" || String(value) === "1" || String(value).toLowerCase() === "yes";
}

export function getSupabaseAdmin() {
  const config = useRuntimeConfig();
  const url = String(config.public.supabaseUrl || process.env.NUXT_PUBLIC_SUPABASE_URL || "");
  const serviceRoleKey = String(config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || "");
  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function getSupabasePublicClient() {
  const config = useRuntimeConfig();
  const url = String(config.public.supabaseUrl || process.env.NUXT_PUBLIC_SUPABASE_URL || "");
  const anonKey = String(config.public.supabaseKey || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || "");
  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function requireDatabaseInThisEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function assertDatabaseConfigured() {
  if (!getSupabaseAdmin()) {
    throw createError({
      statusCode: 500,
      statusMessage: "Supabase database env is required in production. Set NUXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    });
  }
}

async function getSupabaseCatalogState() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (requireDatabaseInThisEnvironment()) {
      assertDatabaseConfigured();
    }
    return null;
  }

  const [ageRangesResult, milestonesResult, educationResult, activitiesResult, rolesResult, usersResult, profilesResult, feedbackResult] = await Promise.all([
    supabase.from("age_ranges").select("label,min_age_months,max_age_months,is_active,display_order").order("display_order", { ascending: true }),
    supabase
      .from("milestones")
      .select("id,slug,label,category,age_range,is_critical,min_age_months,max_age_months,is_active,display_order")
      .order("display_order", { ascending: true }),
    supabase
      .from("education_materials")
      .select("id,title,age_range,duration_label,summary,content,is_published,display_order")
      .order("display_order", { ascending: true }),
    supabase
      .from("stimulation_activities")
      .select("id,title,age_range,duration_label,description,is_published,display_order")
      .order("display_order", { ascending: true }),
    supabase.from("app_roles").select("user_id,role"),
    supabase.auth.admin.listUsers(),
    supabase.from("user_profiles").select("id,full_name"),
    supabase
      .from("usability_feedback")
      .select("id,owner_id,respondent_name,flow_answer,helpful_answer,confusing_answer,language_answer,features_answer,usability_rating,clarity_rating,visual_rating,usefulness_rating,created_at")
      .order("created_at", { ascending: false })
  ]);

  const firstError =
    ageRangesResult.error ||
    milestonesResult.error ||
    educationResult.error ||
    activitiesResult.error ||
    rolesResult.error ||
    profilesResult.error ||
    feedbackResult.error ||
    usersResult.error;
  if (firstError) {
    throw createError({ statusCode: 500, statusMessage: firstError.message });
  }

  const authUsers = usersResult.data.users;
  const profiles = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile.full_name]));
  const roleRows = rolesResult.data ?? [];

  return {
    ageRanges: (ageRangesResult.data ?? []).map((item) => ({
      id: slugify(item.label),
      label: item.label,
      minAgeMonths: item.min_age_months,
      maxAgeMonths: item.max_age_months,
      active: item.is_active,
      displayOrder: item.display_order
    })) as AgeRangeRecord[],
    milestones: (milestonesResult.data ?? []).map((item) => ({
      id: item.slug,
      slug: item.slug,
      label: item.label,
      category: item.category,
      ageRange: item.age_range,
      minAgeMonths: item.min_age_months ?? 0,
      maxAgeMonths: item.max_age_months ?? 0,
      critical: item.is_critical,
      active: item.is_active,
      displayOrder: item.display_order
    })) as MilestoneItem[],
    education: (educationResult.data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      ageRange: item.age_range,
      duration: item.duration_label ?? "",
      summary: item.summary,
      content: item.content ?? "",
      published: item.is_published,
      displayOrder: item.display_order
    })) as EducationMaterial[],
    activities: (activitiesResult.data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      ageRange: item.age_range,
      duration: item.duration_label ?? "",
      description: item.description ?? "",
      published: item.is_published,
      displayOrder: item.display_order
    })) as DailyActivity[],
    adminUsers: roleRows.map((roleRow) => {
      const authUser = authUsers.find((user) => user.id === roleRow.user_id);
      return {
        id: roleRow.user_id,
        email: authUser?.email ?? `${roleRow.user_id}@unknown.local`,
        fullName: profiles.get(roleRow.user_id) ?? authUser?.user_metadata?.full_name ?? "Admin User",
        role: roleRow.role,
        active: true,
        lastLoginAt: authUser?.last_sign_in_at ?? null
      };
    }) as AdminUser[],
    users: authUsers.map((user) => ({
      id: user.id,
      email: user.email ?? `${user.id}@unknown.local`,
      fullName: profiles.get(user.id) ?? user.user_metadata?.full_name ?? null,
      createdAt: user.created_at ?? null,
      lastLoginAt: user.last_sign_in_at ?? null
    })) as AppUser[],
    feedback: (feedbackResult.data ?? []).map((item) => ({
      id: item.id,
      ownerId: item.owner_id,
      respondentName: item.respondent_name,
      flowAnswer: item.flow_answer,
      helpfulAnswer: item.helpful_answer,
      confusingAnswer: item.confusing_answer,
      languageAnswer: item.language_answer,
      featuresAnswer: item.features_answer,
      usabilityRating: item.usability_rating,
      clarityRating: item.clarity_rating,
      visualRating: item.visual_rating,
      usefulnessRating: item.usefulness_rating,
      createdAt: item.created_at
    })) as FeedbackRecord[]
  } satisfies CatalogState;
}

function tableForCategory(category: CatalogCategory) {
  const tables: Record<CatalogCategory, string> = {
    milestones: "milestones",
    education: "education_materials",
    activities: "stimulation_activities",
    ageRanges: "age_ranges",
    adminUsers: "app_roles",
    users: "auth.users",
    feedback: "usability_feedback"
  };
  return tables[category];
}

function toDatabaseRecord(category: CatalogCategory, record: CatalogRecord) {
  if (category === "milestones") {
    const item = record as MilestoneItem;
    return dropUndefined({
      slug: item.slug || item.id || undefined,
      label: item.label,
      category: item.category,
      age_range: item.ageRange,
      is_critical: item.critical,
      min_age_months: item.minAgeMonths,
      max_age_months: item.maxAgeMonths,
      is_active: item.active,
      display_order: item.displayOrder
    });
  }

  if (category === "education") {
    const item = record as EducationMaterial;
    return dropUndefined({
      id: item.id || undefined,
      title: item.title,
      age_range: item.ageRange,
      duration_label: item.duration,
      summary: item.summary,
      content: item.content,
      is_published: item.published,
      display_order: item.displayOrder
    });
  }

  if (category === "activities") {
    const item = record as DailyActivity;
    return dropUndefined({
      id: item.id || undefined,
      title: item.title,
      age_range: item.ageRange,
      duration_label: item.duration,
      description: item.description,
      is_published: item.published,
      display_order: item.displayOrder
    });
  }

  if (category === "ageRanges") {
    const item = record as AgeRangeRecord;
    return {
      label: item.label,
      min_age_months: item.minAgeMonths,
      max_age_months: item.maxAgeMonths,
      is_active: item.active,
      display_order: item.displayOrder
    };
  }

  if (category === "feedback") {
    const item = record as FeedbackRecord;
    return {
      id: item.id,
      owner_id: item.ownerId,
      respondent_name: item.respondentName,
      flow_answer: item.flowAnswer,
      helpful_answer: item.helpfulAnswer,
      confusing_answer: item.confusingAnswer,
      language_answer: item.languageAnswer,
      features_answer: item.featuresAnswer,
      usability_rating: item.usabilityRating,
      clarity_rating: item.clarityRating,
      visual_rating: item.visualRating,
      usefulness_rating: item.usefulnessRating,
      created_at: item.createdAt
    };
  }

  if (category === "users") {
    const item = record as AppUser;
    return {
      id: item.id,
      email: item.email,
      full_name: item.fullName,
      created_at: item.createdAt,
      last_sign_in_at: item.lastLoginAt
    };
  }

  const item = record as AdminUser;
  return {
    user_id: item.id,
    role: item.role
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function dropUndefined<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter((entry) => entry[1] !== undefined)) as Partial<T>;
}
