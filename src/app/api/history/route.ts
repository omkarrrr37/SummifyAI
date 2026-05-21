import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    let clerkToken: string | null = null;
    try {
      clerkToken = await getToken({ template: 'supabase' });
    } catch (e: any) {
      const isTemplateNotFound =
        e?.status === 404 ||
        e?.errors?.[0]?.code === 'resource_not_found' ||
        String(e).includes('JWT template not found');

      if (isTemplateNotFound) {
        console.warn("[History GET] Clerk JWT template 'supabase' not found. Please create it in your Clerk Dashboard.");
      } else {
        console.warn("Could not fetch Clerk Supabase token for GET:", e instanceof Error ? e.message : String(e));
      }
    }

    const dbClient = getSupabase(clerkToken);

    // Fetch generations for this user sorted by newest first
    const { data, error } = await dbClient
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(data), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("History API error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { url } = req;
    const { searchParams } = new URL(url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    let clerkToken: string | null = null;
    try {
      clerkToken = await getToken({ template: 'supabase' });
    } catch (e: any) {
      const isTemplateNotFound =
        e?.status === 404 ||
        e?.errors?.[0]?.code === 'resource_not_found' ||
        String(e).includes('JWT template not found');

      if (isTemplateNotFound) {
        console.warn("[History DELETE] Clerk JWT template 'supabase' not found. Please create it in your Clerk Dashboard.");
      } else {
        console.warn("Could not fetch Clerk Supabase token for DELETE:", e instanceof Error ? e.message : String(e));
      }
    }

    const dbClient = getSupabase(clerkToken);

    // Delete item where id matches and belongs to the user
    const { error } = await dbClient
      .from('generations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase delete error:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Delete History error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
