import { auth } from '@clerk/nextjs/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { ratelimit } from '@/lib/ratelimit';
import { getSupabase } from '@/lib/supabase';

// Initialize the Google Gemini provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export const maxDuration = 60;

export async function POST(req: Request) {
  const LOG = (step: string, detail?: unknown) =>
    console.log(`[/api/generate] ${step}`, detail !== undefined ? detail : '');

  try {
    // ─── Step 1: Auth ────────────────────────────────────────────────────────
    LOG('step 1 – auth check');
    const { userId, getToken } = await auth();
    if (!userId) {
      LOG('step 1 FAIL – not authenticated');
      return new Response(JSON.stringify({ error: 'Unauthorized – please sign in' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    LOG('step 1 OK – userId', userId);

    // ─── Step 2: Parse body ──────────────────────────────────────────────────
    LOG('step 2 – parsing request body');
    let prompt: string, option: string | undefined, length: string | undefined;
    try {
      const body = await req.json();
      prompt = body.prompt;
      option = body.option;
      length = body.length;
    } catch {
      LOG('step 2 FAIL – could not parse JSON body');
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      LOG('step 2 FAIL – empty prompt');
      return new Response(JSON.stringify({ error: 'Prompt is required and cannot be empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    LOG('step 2 OK – prompt details', { length: prompt.length, option, outputLength: length });

    // ─── Step 3: Rate limiting ───────────────────────────────────────────────
    LOG('step 3 – rate limit check');
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(userId);
      LOG('step 3 – rate limit result', { success, limit, remaining, reset });
      if (!success) {
        const resetDate = new Date(reset);
        LOG('step 3 FAIL – rate limit exceeded. Resets at', resetDate.toISOString());
        return new Response(
          JSON.stringify({
            error: `Rate limit exceeded – you have used all ${limit} free generations for today. Resets at ${resetDate.toLocaleTimeString()}.`,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        );
      }
      LOG('step 3 OK – remaining requests today:', remaining);
    } catch (rateLimitErr) {
      // If Redis is down, log it but don't block the user
      LOG('step 3 WARN – rate limit check threw (Redis issue?), allowing through', rateLimitErr);
    }

    // ─── Step 4: Build system prompt ────────────────────────────────────────
    LOG('step 4 – building system prompt');
    
    const requestedLength = length || 'medium';
    
    let systemInstruction =
      'You are an expert AI Text Summarizer & Explainer. Your goal is to simplify, condense, or explain the provided text.\n' +
      'Strictly format your response in clean Markdown. Use bold headers, highlights, or lists where appropriate.\n\n' +
      'CRITICAL RESPONSE LENGTH CONTROL RULES:\n' +
      'You MUST strictly adjust the density and size of your response based on the requested output length:\n';

    if (requestedLength === 'short') {
      systemInstruction +=
        '- TARGET LENGTH: "short"\n' +
        '- Rule: Keep the response extremely brief. Provide exactly 1 short, highly concentrated paragraph of 50-80 words total. Do not use multiple paragraphs or lists. Get straight to the absolute point.\n';
    } else if (requestedLength === 'medium') {
      systemInstruction +=
        '- TARGET LENGTH: "medium"\n' +
        '- Rule: Keep the response balanced. Provide exactly 2 well-structured paragraphs of 120-180 words total. You may include a brief 2-bullet list if highly relevant.\n';
    } else if (requestedLength === 'long') {
      systemInstruction +=
        '- TARGET LENGTH: "long"\n' +
        '- Rule: Keep the response comprehensive and exhaustive. Provide a detailed summary of 300+ words. Use 3 to 4 substantial paragraphs and a structured bulleted breakdown of the key clauses, sections, and items. Deliver maximum context.\n';
    }

    systemInstruction += '\nUser-specified explain mode criteria:\n';

    if (option === 'summary') {
      systemInstruction += ` - Mode: Standard Summary. Extract and condense the main ideas, core concepts, and takeaways according to the length rules above.`;
    } else if (option === 'bullet') {
      systemInstruction += ` - Mode: Key Points. Ignore paragraph rules and output a clean, organized bulleted list. The list size must match the length: short = exactly 3 bullet points, medium = exactly 5-6 bullet points, long = 8-10 highly detailed bullet points.`;
    } else if (option === 'explain_like_5') {
      systemInstruction += ` - Mode: Explain Like I'm 5 (ELI5). Simplify all complex logic and technical jargon. Use simple real-world analogies. Adjust explanation detail according to the length: short = 1 brief analogy, medium = 2 analogies, long = full step-by-step breakdown.`;
    } else if (option === 'deep_dive') {
      systemInstruction += ` - Mode: Deep Dive. Conduct a highly analytical, full structural audit of the clauses, implications, definitions, and arguments. Ensure comprehensive coverage.`;
    }
    LOG('step 4 OK');

    // ─── Step 4.5: Retrieve Clerk token for Supabase RLS ─────────────────────
    let clerkToken: string | null = null;
    try {
      clerkToken = await getToken({ template: 'supabase' });
    } catch (tokenErr: any) {
      const isTemplateNotFound =
        tokenErr?.status === 404 ||
        tokenErr?.errors?.[0]?.code === 'resource_not_found' ||
        String(tokenErr).includes('JWT template not found');

      if (isTemplateNotFound) {
        LOG('step 4.5 WARN – Clerk JWT template "supabase" not found in your Clerk Dashboard.');
        LOG('👉 FIX: Go to your Clerk Dashboard -> JWT Templates -> New Template -> select Supabase, and save it with the name "supabase".');
      } else {
        LOG('step 4.5 WARN – could not retrieve Clerk Supabase token:', tokenErr instanceof Error ? tokenErr.message : String(tokenErr));
      }
    }

    // ─── Step 5: Stream from Gemini ──────────────────────────────────────────
    LOG('step 5 – calling streamText with gemini-2.5-flash');
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemInstruction,
      prompt: prompt,
      onFinish: async ({ text }) => {
        // ─── Step 6: Persist to Supabase (non-blocking, never affects stream) ─
        LOG('step 6 – saving to Supabase');
        try {
          const dbClient = getSupabase(clerkToken);
          const { error: dbError } = await dbClient.from('generations').insert({
            user_id: userId,
            prompt: prompt.length > 500 ? prompt.substring(0, 500) + '…' : prompt,
            response: text,
          });
          if (dbError) {
            LOG('step 6 WARN – Supabase insert failed (RLS policy or key issue)', {
              code: dbError.code,
              message: dbError.message,
            });
            LOG(
              'step 6 FIX HINT – To save history without any configuration, get your real "service_role" secret key from Supabase dashboard and set it as SUPABASE_SERVICE_ROLE_KEY in .env.local.'
            );
          } else {
            LOG('step 6 OK – generation saved to Supabase');
          }
        } catch (dbErr) {
          LOG('step 6 WARN – Supabase call threw', dbErr);
        }
      },
    });

    LOG('step 5 OK – streaming response to client');
    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[/api/generate] UNHANDLED ERROR:', error);
    return new Response(JSON.stringify({ error: `Internal Server Error: ${msg}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
