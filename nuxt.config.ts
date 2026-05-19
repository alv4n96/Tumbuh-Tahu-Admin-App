export default defineNuxtConfig({
  compatibilityDate: "2026-05-19",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    adminSeedPassword: process.env.ADMIN_SEED_PASSWORD || "TumbuhTahuAdmin#2026",
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
