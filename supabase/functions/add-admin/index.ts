import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const headers = { ...corsHeaders, "Content-Type": "application/json" };

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
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers }
      );
    }

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers,
      });
    }

    const anonClient = createClient(supabaseUrl, anonKey);
    const {
      data: { user: caller },
      error: authError,
    } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers,
      });
    }

    // Check caller is admin using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Only admins can manage admin users" }),
        { status: 403, headers }
      );
    }

    const body = await req.json();
    const { email, user_id, action } = body;

    // Remove admin
    if (action === "remove" && user_id) {
      const { error } = await adminClient
        .from("user_roles")
        .delete()
        .eq("user_id", user_id)
        .eq("role", "admin");
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers,
        });
      }
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Add admin by email
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers,
      });
    }

    // Look up user by email using admin API
    const {
      data: { users },
      error: listError,
    } = await adminClient.auth.admin.listUsers();

    if (listError) {
      console.error("listUsers error:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to look up users" }),
        { status: 500, headers }
      );
    }

    const targetUser = users.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: "No registered user found with that email" }),
        { status: 404, headers }
      );
    }

    // Insert admin role
    const { error: insertError } = await adminClient
      .from("user_roles")
      .insert({ user_id: targetUser.id, role: "admin" });

    if (insertError) {
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({ error: "User is already an admin" }),
          { status: 400, headers }
        );
      }
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
        headers,
      });
    }

    return new Response(
      JSON.stringify({ success: true, user_id: targetUser.id }),
      { headers }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    });
  }
});
