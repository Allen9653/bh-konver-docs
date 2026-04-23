import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type TestUser = {
  id: string;
  email: string;
  password: string;
  client: SupabaseClient;
};

async function createConfirmedUser(label: string): Promise<TestUser> {
  const email = `rls-${label}-${crypto.randomUUID()}@example.com`;
  const password = `T3st!${crypto.randomUUID()}`;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;

  return { id: data.user.id, email, password, client };
}

async function cleanupUser(user?: TestUser) {
  if (!user) return;
  await user.client.auth.signOut();
  await admin.from("conversions").delete().eq("user_id", user.id);
  await admin.auth.admin.deleteUser(user.id);
}

Deno.test("conversions RLS allows only the owner to insert and delete while anon is denied", async () => {
  let owner: TestUser | undefined;
  let other: TestUser | undefined;

  try {
    owner = await createConfirmedUser("owner");
    other = await createConfirmedUser("other");

    const insertOwn = await owner.client.from("conversions").insert({
      user_id: owner.id,
      user_email: owner.email,
      original_filename: "owner-source.pdf",
      original_format: "pdf",
      target_format: "docx",
      status: "pending",
    }).select("id, user_id").single();

    assertEquals(insertOwn.error, null);
    assertExists(insertOwn.data);
    assertEquals(insertOwn.data.user_id, owner.id);

    const insertOther = await owner.client.from("conversions").insert({
      user_id: other.id,
      user_email: other.email,
      original_filename: "forbidden.pdf",
      original_format: "pdf",
      target_format: "docx",
      status: "pending",
    });

    assertExists(insertOther.error);

    const seedOther = await admin.from("conversions").insert({
      user_id: other.id,
      user_email: other.email,
      original_filename: "other-source.pdf",
      original_format: "pdf",
      target_format: "docx",
      status: "pending",
    }).select("id").single();

    if (seedOther.error) throw seedOther.error;

    const deleteOther = await owner.client.from("conversions").delete().eq("id", seedOther.data.id);
    assertExists(deleteOther.error);

    const deleteOwn = await owner.client.from("conversions").delete().eq("id", insertOwn.data.id).select("id");
    assertEquals(deleteOwn.error, null);
    assertEquals(deleteOwn.data?.length, 1);

    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const anonInsert = await anon.from("conversions").insert({
      user_id: owner.id,
      user_email: owner.email,
      original_filename: "anon.pdf",
      original_format: "pdf",
      target_format: "docx",
      status: "pending",
    });
    assertExists(anonInsert.error);

    const anonDelete = await anon.from("conversions").delete().eq("id", seedOther.data.id);
    assertExists(anonDelete.error);

    const cleanupSeed = await admin.from("conversions").delete().eq("id", seedOther.data.id);
    assert(cleanupSeed.error === null, cleanupSeed.error?.message);
  } finally {
    await cleanupUser(owner);
    await cleanupUser(other);
  }
});