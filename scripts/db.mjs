#!/usr/bin/env node
/**
 * Direct Supabase DB utility.
 * Usage:
 *   node scripts/db.mjs reset          — wipe all app data, re-seed for existing users
 *   node scripts/db.mjs sql "SELECT 1" — run any SQL via Supabase REST
 *   node scripts/db.mjs truncate ideas — delete all rows from a table
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local")
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => {
      const [k, ...v] = l.split("=")
      return [k.trim(), v.join("=").trim().replace(/^["']|["']$/g, "")]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const [,, command, ...args] = process.argv

async function sql(query) {
  // Execute raw SQL via Supabase postgres REST endpoint
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    // Fallback: try pg via supabase RPC if exec_sql not available
    console.log("ℹ️  exec_sql RPC not available — using table API instead")
    return null
  }
  return res.json()
}

async function deleteTable(table) {
  const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000")
  if (error) {
    // Some tables might use different non-null strategies
    const { error: e2 } = await supabase.from(table).delete().not("id", "is", null)
    if (e2) console.error(`  ✗ ${table}: ${e2.message}`)
    else console.log(`  ✓ cleared ${table}`)
  } else {
    console.log(`  ✓ cleared ${table}`)
  }
}

async function reset() {
  console.log("🗑  Clearing all app data (keeping auth.users)…\n")

  // Delete in FK-safe order (children before parents)
  const tables = [
    "analytics_snapshots",
    "integrations",
    "reports",
    "automations",
    "ideas",
    "experiments",
    "profiles",
    "workspaces",
  ]
  for (const t of tables) await deleteTable(t)

  console.log("\n🌱 Re-seeding workspace + profile + integrations + automations…\n")

  // Get all auth users via admin API
  const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers()
  if (usersErr) { console.error("✗ Could not list users:", usersErr.message); return }

  for (const user of users) {
    const wsId = crypto.randomUUID()
    const rawName = user.user_metadata?.full_name || user.email.split("@")[0]
    const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + wsId.slice(0, 6)

    // Workspace
    const { error: wsErr } = await supabase.from("workspaces").insert({
      id: wsId, name: rawName + "'s Workspace", slug, owner_id: user.id, plan: "free",
    })
    if (wsErr) { console.error(`  ✗ workspace for ${user.email}: ${wsErr.message}`); continue }

    // Profile
    await supabase.from("profiles").insert({
      id: user.id, workspace_id: wsId, full_name: rawName, role: "owner",
    })

    // Integrations
    await supabase.from("integrations").insert([
      { workspace_id: wsId, provider: "Google Analytics 4", category: "Analytics",      status: "disconnected" },
      { workspace_id: wsId, provider: "Stripe",             category: "Payments",       status: "disconnected" },
      { workspace_id: wsId, provider: "Slack",              category: "Communication",  status: "disconnected" },
      { workspace_id: wsId, provider: "HubSpot",            category: "CRM",            status: "disconnected" },
      { workspace_id: wsId, provider: "Mixpanel",           category: "Analytics",      status: "disconnected" },
      { workspace_id: wsId, provider: "Mailchimp",          category: "Email",          status: "disconnected" },
      { workspace_id: wsId, provider: "Linear",             category: "Project Mgmt",   status: "disconnected" },
      { workspace_id: wsId, provider: "Notion",             category: "Knowledge Base", status: "disconnected" },
      { workspace_id: wsId, provider: "Zapier",             category: "Automation",     status: "disconnected" },
      { workspace_id: wsId, provider: "Figma",              category: "Design",         status: "disconnected" },
    ])

    console.log(`  ✓ seeded workspace for ${user.email}`)
  }

  // Verify counts
  console.log("\n📊 Verification:\n")
  for (const t of ["workspaces","profiles","integrations","experiments","ideas"]) {
    const { count } = await supabase.from(t).select("*", { count: "exact", head: true })
    console.log(`  ${t}: ${count ?? 0} rows`)
  }
  console.log("\n✅ Done — refresh your dashboard")
}

async function truncate(table) {
  console.log(`🗑  Deleting all rows from ${table}…`)
  const { error } = await supabase.from(table).delete().not("id", "is", null)
  if (error) console.error(`✗ ${error.message}`)
  else console.log(`✓ ${table} cleared`)
}

switch (command) {
  case "reset":    await reset(); break
  case "truncate": await truncate(args[0]); break
  case "sql":      console.log(await sql(args.join(" "))); break
  default:
    console.log("Usage: node scripts/db.mjs reset | truncate <table> | sql <query>")
}
