import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const BEAM_URL = Deno.env.get('BEAM_URL') ?? '' 
  const APP_SECRET_TOKEN = Deno.env.get('APP_SECRET_TOKEN') ?? ''
  const BEAM_API_KEY = Deno.env.get('BEAM_API_KEY') || APP_SECRET_TOKEN
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    console.log("📥 Received request body:", JSON.stringify(body))
    const { 
      prompt, 
      media_type, 
      model_type, 
      duration, 
      user_id, 
      width, 
      height, 
      tier, 
      style, 
      lighting, 
      angle, 
      format, 
      reference_url 
    } = body

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Check user billing
    if (user_id && user_id !== 'anonymous') {
      const { data: userRecord } = await supabase
        .from('users_billing')
        .select('available_seconds')
        .eq('id', user_id)
        .single()

      if (userRecord && userRecord.available_seconds <= 0) {
        return new Response(
          JSON.stringify({ status: "error", message: "Недостатньо секунд на балансі" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        )
      }
    }

    // 2. Create task record
    const { data: taskRecord, error: taskErr } = await supabase
      .from('tasks')
      .insert({ user_id: user_id || null, status: 'pending' })
      .select('id')
      .single()
      
    if (taskErr || !taskRecord) {
      throw new Error(`Failed to create task: ${taskErr?.message}`)
    }
    
    const taskId = taskRecord.id
    const webhookUrl = `${SUPABASE_URL}/functions/v1/update-task`

    // 3. Forward request to Beam Cloud API asynchronously
    const beamHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
    if (BEAM_API_KEY) {
      beamHeaders['Authorization'] = `Bearer ${BEAM_API_KEY}`
    }

    const beamPayload = { 
      prompt,
      media_type: media_type || "video", 
      model_type: model_type || "ltx", 
      duration: duration || 5, 
      width: width || 1024,
      height: height || 1024,
      tier: tier || "1.5",
      style,
      lighting,
      angle,
      format,
      reference_url,
      auth_token: APP_SECRET_TOKEN,
      task_id: taskId,
      callback_url: webhookUrl
    };

    console.log(`🚀 Sending to BEAM_URL: ${BEAM_URL}`);
    console.log(`📦 Payload:`, JSON.stringify(beamPayload));

    let debugInfo: any = { BEAM_URL };
    try {
      const beamRes = await fetch(BEAM_URL, {
        method: 'POST',
        headers: beamHeaders,
        body: JSON.stringify(beamPayload)
      });
      const beamText = await beamRes.text();
      console.log(`✅ Beam Response [${beamRes.status}]:`, beamText);
      debugInfo.beam_status = beamRes.status;
      debugInfo.beam_response = beamText;
    } catch (beamErr: any) {
      console.error(`❌ Beam Fetch Error:`, beamErr.message);
      debugInfo.beam_error = beamErr.message;
    }

    // 4. Return task_id immediately
    return new Response(
      JSON.stringify({ status: "accepted", task_id: taskId, debug: debugInfo }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 202 },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: "error", message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    )
  }
})
