export default defineNuxtConfig({
  compatibilityDate: "2026-05-19",
  devtools: { enabled: true },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/icon.svg" }]
    }
  },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    adminSeedPassword: process.env.ADMIN_SEED_PASSWORD || "TumbuhTahuAdmin#2026",
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || "change-this-before-production",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    public: {
      appName: "Tumbuh Tahu Admin",
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || "",
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ""
    }
  },
  nitro: {
    preset: "vercel",
    storage: {
      adminCatalog: {
        driver: "memory"
      }
    }
  }
});
