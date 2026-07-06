// Imports a roadmap JSON dump (see supabase/seeds/*.json) into the
// roadmap_templates / roadmap_semaines / roadmap_etapes tables via a
// direct PostgREST call (service role). Run AFTER
// supabase/migrations/0010_roadmaps.sql. Uses raw fetch instead of
// @supabase/supabase-js to avoid that package's Realtime client requiring
// a global WebSocket, which Node 20 doesn't provide.
//
// Usage:
//   node --env-file=.env scripts/seed-roadmap.mjs supabase/seeds/roadmap-web-fullstack.json

import { readFileSync } from "node:fs";
import path from "node:path";

const STATUT_MAP = { Brouillon: "brouillon", Publié: "publie", Archivé: "archive" };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

function rest(table) {
  return `${url}/rest/v1/${table}`;
}

async function insertOne(table, row) {
  const res = await fetch(rest(table), {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`${table} insert failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body[0];
}

async function main() {
  const jsonArg = process.argv[2];
  if (!jsonArg) {
    console.error("Usage: node --env-file=.env scripts/seed-roadmap.mjs <path-to-json>");
    process.exit(1);
  }

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
    process.exit(1);
  }

  const roadmap = JSON.parse(readFileSync(path.resolve(jsonArg), "utf8"));

  const template = await insertOne("roadmap_templates", {
    titre: roadmap.titre,
    branche: roadmap.branche,
    niveau: roadmap.niveau ?? null,
    duree_semaines: roadmap.duree_semaines,
    version: roadmap.version,
    statut: STATUT_MAP[roadmap.statut] ?? "brouillon",
  });

  console.log(`Created roadmap template ${template.id} - ${roadmap.titre}`);

  for (const semaine of roadmap.semaines) {
    const semaineRow = await insertOne("roadmap_semaines", {
      roadmap_id: template.id,
      numero: semaine.numero,
      titre: semaine.titre,
    });

    console.log(`  Semaine ${semaine.numero} - ${semaine.titre}`);

    for (const etape of semaine.etapes) {
      await insertOne("roadmap_etapes", {
        semaine_id: semaineRow.id,
        jour: etape.jour,
        titre: etape.titre,
        objectifs: etape.objectifs,
        cours: etape.cours,
        exercice: etape.exercice,
        livrable_attendu: etape.livrable_attendu,
        quiz: etape.quiz,
      });

      console.log(`    Jour ${etape.jour} - ${etape.titre}`);
    }
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
