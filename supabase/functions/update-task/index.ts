import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    console.log("update-task received body:", body)

    const taskId = body.task_id || body.id || body.taskId
    if (!taskId) {
       return new Response(JSON.stringify({ error: 'Missing task_id' }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const rawStatus = (body.status || body.state || 'ready').toLowerCase()
    let status = 'pending'
    if (['ready', 'completed', 'success', 'done'].includes(rawStatus)) {
      status = 'ready'
    } else if (['error', 'failed', 'failure', 'cancelled', 'timeout'].includes(rawStatus)) {
      status = 'error'
    }

    let resultUrl = body.result_url || body.output || body.file_url || body.video_url || body.imageUrl || body.url || null
    if (typeof resultUrl === 'object' && resultUrl !== null) {
      resultUrl = resultUrl.url || resultUrl.file_url || resultUrl.result_url || JSON.stringify(resultUrl)
    }

    const renderTime = body.render_time_seconds || body.duration || body.execution_time || 10

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Update task
    const { data: task, error: updateError } = await supabase
      .from('tasks')
      .update({ 
        status: status, 
        result_url: resultUrl, 
        error_message: body.message || body.error || null
      })
      .eq('id', taskId)
      .select('user_id')
      .single()

    if (updateError) {
      console.error("Failed to update task:", updateError)
    }

    // 2. Billing deduction
    const userId = task?.user_id || body.user_id || 'anonymous'
    if (status === "ready") {
      const { data: currentRec } = await supabase
        .from('users_billing')
        .select('available_seconds')
        .eq('id', userId)
        .single()

      if (currentRec) {
        const newBalance = Math.max(0, currentRec.available_seconds - renderTime)
        await supabase
          .from('users_billing')
          .update({ available_seconds: newBalance })
          .eq('id', userId)
      }
    }

    return new Response(JSON.stringify({ success: true, task_id: taskId, status, result_url: resultUrl }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })
  } catch (error: any) {
    console.error("update-task exception:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 500 
    })
  }
})
