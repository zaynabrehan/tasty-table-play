import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getBearerToken = (authHeader: string | null) => {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
};

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const findUserByEmail = async (
  adminClient: ReturnType<typeof createClient>,
  email: string,
) => {
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const users = data.users ?? [];
    const matchedUser = users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail,
    );

    if (matchedUser) {
      return matchedUser;
    }

    if (users.length < 200) {
      break;
    }
  }

  return null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error("Missing env vars:", {
        url: !!supabaseUrl,
        serviceRole: !!serviceRoleKey,
        anon: !!anonKey,
      });
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const token = getBearerToken(req.headers.get("Authorization"));
    if (!token) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const anonClient = createClient(supabaseUrl, anonKey);
    const {
      data: { user: caller },
      error: authError,
    } = await anonClient.auth.getUser(token);

    if (authError || !caller) {
      console.error("Caller auth failed:", authError);
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin, error: roleError } = await adminClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });

    if (roleError) {
      console.error("Admin role check failed:", roleError);
      return jsonResponse({ error: "Failed to verify admin access" }, 500);
    }

    if (!isAdmin) {
      return jsonResponse({ error: "Only admins can manage admin users" }, 403);
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    const action = body.action;
    const redirectTo = typeof body.redirectTo === "string" ? body.redirectTo : undefined;

    if (action === "remove" && userId) {
      const { error } = await adminClient
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");

      if (error) {
        console.error("Remove admin failed:", error);
        return jsonResponse({ error: error.message }, 400);
      }

      return jsonResponse({ success: true });
    }

    if (!email || !isValidEmail(email)) {
      return jsonResponse({ error: "A valid email is required" }, 400);
    }

    let targetUser = await findUserByEmail(adminClient, email);
    let invited = false;

    if (!targetUser) {
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        email,
        redirectTo ? { redirectTo } : undefined,
      );

      if (inviteError) {
        console.error("Invite admin failed:", inviteError);
        return jsonResponse({ error: inviteError.message }, 400);
      }

      targetUser = inviteData.user;
      invited = true;
    }

    if (!targetUser) {
      return jsonResponse({ error: "Could not create or find a user for this email" }, 500);
    }

    const { error: insertError } = await adminClient
      .from("user_roles")
      .insert({ user_id: targetUser.id, role: "admin" });

    if (insertError) {
      if (insertError.code === "23505") {
        return jsonResponse({ error: "User is already an admin" }, 400);
      }

      console.error("Insert admin role failed:", insertError);
      return jsonResponse({ error: insertError.message }, 400);
    }

    return jsonResponse({
      success: true,
      user_id: targetUser.id,
      invited,
      message: invited
        ? "Admin invite sent. They will get admin access after completing signup."
        : "Admin access granted.",
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
