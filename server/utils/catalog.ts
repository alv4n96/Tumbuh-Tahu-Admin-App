import type {
  AdminUser,
  AgeRangeRecord,
  CatalogCategory,
  CatalogRecord,
  CatalogState,
  DailyActivity,
  EducationMaterial,
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

const adminUsers: AdminUser[] = [
  { id: "owner", email: "owner@tumbuhtahu.test", fullName: "Owner Tumbuh Tahu", role: "owner", active: true },
  { id: "admin-growth", email: "growth@tumbuhtahu.test", fullName: "Admin Growth", role: "admin", active: true },
  { id: "admin-content", email: "content@tumbuhtahu.test", fullName: "Admin Content", role: "editor", active: true },
  { id: "admin-clinic", email: "clinic@tumbuhtahu.test", fullName: "Admin Clinic", role: "admin", active: true },
  { id: "admin-support", email: "support@tumbuhtahu.test", fullName: "Admin Support", role: "editor", active: true }
];

export const catalogKeys: CatalogCategory[] = ["milestones", "education", "activities", "ageRanges", "adminUsers"];

export const templates: Record<CatalogCategory, string[]> = {
  milestones: ["id", "slug", "label", "category", "ageRange", "minAgeMonths", "maxAgeMonths", "critical", "active", "displayOrder"],
  education: ["id", "title", "ageRange", "duration", "summary", "content", "published", "displayOrder"],
  activities: ["id", "title", "ageRange", "duration", "description", "published", "displayOrder"],
  ageRanges: ["id", "label", "minAgeMonths", "maxAgeMonths", "active", "displayOrder"],
  adminUsers: ["id", "email", "fullName", "role", "active"]
};

export function seedCatalog(): CatalogState {
  return {
    milestones: structuredClone(milestones),
    education: structuredClone(education),
    activities: structuredClone(activities),
    ageRanges: structuredClone(ageRanges),
    adminUsers: structuredClone(adminUsers)
  };
}

export function isCatalogCategory(value: string): value is CatalogCategory {
  return catalogKeys.includes(value as CatalogCategory);
}

export async function getCatalogState() {
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

export function normalizeRecord(category: CatalogCategory, input: Record<string, unknown>): CatalogRecord {
  const id = String(input.id || crypto.randomUUID());
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

  return {
    id,
    email: String(input.email || ""),
    fullName: String(input.fullName || ""),
    role: String(input.role || "admin") as AdminUser["role"],
    active: input.active === undefined ? true : parseBoolean(input.active)
  };
}

export function validateRecord(category: CatalogCategory, input: CatalogRecord) {
  const missing: string[] = [];
  const required = templates[category].filter((field) => !["content", "displayOrder", "active", "published", "critical"].includes(field));
  for (const field of required) {
    if (!String((input as unknown as Record<string, unknown>)[field] ?? "").trim()) {
      missing.push(field);
    }
  }

  if (category === "adminUsers" && !String((input as AdminUser).email).includes("@")) {
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
