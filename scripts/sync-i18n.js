#!/usr/bin/env node
/**
 * 🌐 [DesignFlow Studio] Build-Time Translation Synchronizer
 * Downloads latest translations from Polyglot Hub (https://polyglot-hub.josapratama.com or http://localhost:4000)
 * and generates clean JSON locale files with ZERO runtime latency.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_SLUG = process.argv[2] || "design-flow";
const TARGET_DIR = path.resolve(process.cwd(), process.argv[3] || "src/i18n/locales");
const POLYGLOT_URL = (process.argv[4] || process.env.POLYGLOT_HUB_URL || "https://polyglot-hub.josapratama.com").replace(/\/+$/, "");

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}

async function syncTranslations() {
  console.log("\n======================================================");
  console.log("🌐 [Polyglot Hub] Build-Time Translation Sync");
  console.log("======================================================");
  console.log(`📦 Project     : "${PROJECT_SLUG}"`);
  console.log(`📡 Server URL  : ${POLYGLOT_URL}`);
  console.log(`📁 Target Dir  : ${TARGET_DIR}`);

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const languages = [
    { code: "id", name: "Bahasa Indonesia" },
    { code: "en", name: "English" },
    { code: "ja", name: "Japanese" },
  ];

  let successCount = 0;

  for (const lang of languages) {
    const nestedUrl = `${POLYGLOT_URL}/api/v1/export/${PROJECT_SLUG}/${lang.code}?common=true&format=nested`;

    try {
      const res = await fetchWithRetry(nestedUrl);
      if (!res.ok) {
        console.warn(`  ⚠️ Failed to fetch ${lang.code} from server (HTTP ${res.status}). Retaining local snapshot.`);
        continue;
      }

      const dict = await res.json();
      const filePath = path.join(TARGET_DIR, `${lang.code}.json`);
      fs.writeFileSync(filePath, JSON.stringify(dict, null, 2), "utf-8");

      const keyCount = Object.keys(dict).length;
      console.log(`  ✓ Synced ${lang.code}.json (${keyCount} namespaces)`);
      successCount++;
    } catch (err) {
      console.warn(`  ⚠️ Offline fallback: retained local ${lang.code}.json snapshot (${err.message})`);
    }
  }

  if (successCount > 0) {
    console.log(`\n✨ Successfully synced ${successCount} languages from Polyglot Hub! Zero runtime lag.`);
  } else {
    console.log(`\n✨ Using local bundled translation snapshots (id, en, ja). Ready to build!`);
  }
  console.log("======================================================\n");
}

syncTranslations().catch((err) => {
  console.warn("⚠️ Polyglot sync note (offline fallback active):", err.message || err);
  process.exit(0);
});
