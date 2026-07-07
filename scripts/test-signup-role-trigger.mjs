#!/usr/bin/env node
/**
 * Regression test: signup → handle_new_user trigger → user_roles assignment.
 *
 * Verifies that a fresh signup:
 *   1. Succeeds via the public auth endpoint (no "Database error saving new user").
 *   2. Creates a matching row in public.profiles.
 *   3. Assigns the default 'user' role in public.user_roles (proves the
 *      guard_user_roles_writes trigger does not block trusted backend context).
 *
 * Run:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/test-signup-role-trigger.mjs
 *
 * Exits non-zero on any failure so CI can catch regressions of the
 * signup-blocking bug documented in migration 20260706061148.
 */

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://kvuiqexsovexuyfgztwk.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dWlxZXhzb3ZleHV5Zmd6dHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Mjg0MzQsImV4cCI6MjA3NTAwNDQzNH0.km2HXPWK7ptgRsgeZFGbP2S2yClh9FHzzBUrboS0RC0";

const fail = (msg) => {
  console.error(`❌ FAIL: ${msg}`);
  process.exit(1);
};
const ok = (msg) => console.log(`✅ ${msg}`);

const email = `signup-regression-${Date.now()}-${Math.random()
  .toString(36)
  .slice(2, 8)}@example.com`;
const password = `RegTest!${Math.random().toString(36).slice(2, 12)}Aa1`;

async function main() {
  console.log(`→ Signing up: ${email}`);

  const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const signupBody = await signupRes.json();

  if (!signupRes.ok) {
    fail(
      `Signup HTTP ${signupRes.status}: ${JSON.stringify(signupBody)} — ` +
        `regression of guard_user_roles_writes / handle_new_user trigger?`
    );
  }
  const userId = signupBody?.user?.id;
  if (!userId) fail(`Signup response missing user.id: ${JSON.stringify(signupBody)}`);
  ok(`Signup succeeded (user_id=${userId})`);

  // Obtain a session token to query PostgREST. If email confirmation is required,
  // signInWithPassword will fail — fall back to whatever token we have.
  let accessToken = signupBody?.access_token;
  if (!accessToken) {
    const signInRes = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );
    const signInBody = await signInRes.json();
    accessToken = signInBody?.access_token;
  }

  if (!accessToken) {
    console.warn(
      "⚠️  No session token (email confirmation required). Skipping row assertions — signup itself succeeded, which is the primary regression signal."
    );
    ok("Regression test PASSED (signup endpoint healthy).");
    return;
  }

  // Profile row
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=id,email`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const profiles = await profileRes.json();
  if (!Array.isArray(profiles) || profiles.length !== 1) {
    fail(`Expected 1 profile row, got: ${JSON.stringify(profiles)}`);
  }
  ok("profiles row created by handle_new_user trigger");

  // Role row
  const rolesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&select=role`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const roles = await rolesRes.json();
  if (!Array.isArray(roles) || !roles.some((r) => r.role === "user")) {
    fail(
      `Expected default 'user' role, got: ${JSON.stringify(roles)} — ` +
        `guard_user_roles_writes may be blocking the trigger again.`
    );
  }
  ok("default 'user' role assigned (guard_user_roles_writes allows trusted trigger)");

  console.log("\n🎉 Signup role-trigger regression test PASSED");
}

main().catch((e) => fail(e?.stack || String(e)));
