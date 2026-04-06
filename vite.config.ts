import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { HfInference } from '@huggingface/inference'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Pre-process raw LLM output BEFORE handing it to jsonrepair.
 * Handles the most common ways small models break JSON:
 *   - Markdown bullet points  (* item / - item) inside arrays
 *   - Bold/italic markdown (**text** / *text*)
 *   - Backticks used as string delimiters
 */
function preProcess(raw: string): string {
  return raw
    // 1. Strip markdown bold (**text**) → text
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    // 2. Convert bullet-list lines to quoted JSON strings
    //    e.g.  "  * Build the UI"  →  "  \"Build the UI\""
    .replace(/^[ \t]*[*\-][ \t]+(.+)$/gm, '"$1"')
    // 3. Strip any remaining lone * that are still outside strings
    //    (can't fix perfectly without a full parser, but covers most cases)
    .replace(/(?<=[\[,{]\s*)\*/g, '')
    // 4. Replace backtick-delimited strings with double-quoted strings
    //    e.g. `code here` → "code here"
    .replace(/`([^`\n]*)`/g, '"$1"')
}

export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-proxy-shim',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url || '', `http://${req.headers.host}`)

          if (url.pathname !== '/api/generate' && url.pathname !== '/api/chat') {
            next()
            return
          }

          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          let body = ''
          req.on('data', (chunk) => { body += chunk })
          req.on('end', async () => {
            try {
              const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)
              const payload = JSON.parse(body)

              if (url.pathname === '/api/chat') {
                const { idea, messages } = payload;
                if (!idea || !messages) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Missing idea or messages' }));
                  return;
                }
                const systemContent = `You are "HackDraft Buddy", an enthusiastic, elite developer buddy helping the user build their hackathon project: "${idea.name}".
Your personality: encouraging, highly technical, concise, and focused on shipping.

Here is the blueprint of the project you are building together:
- Tagline: ${idea.tagline}
- Tech Stack: ${idea.techStack?.map((t: any) => t.name).join(', ')}
- Problem: ${idea.problem}
- Solution: ${idea.solution}

Keep your answers extremely concise, practical, and conversational. Provide code snippets only if explicitly asked or highly relevant. Do NOT output markdown formatting like triple backticks unless providing code. Use brief bullet points if needed. Speak directly to the developer as their partner.`;

                const stream = hf.chatCompletionStream({
                  model: 'meta-llama/Llama-3.1-8B-Instruct',
                  messages: [
                    { role: 'system', content: systemContent },
                    ...messages.map((m: any) => ({ role: m.role, content: m.content }))
                  ],
                  max_tokens: 1000,
                  temperature: 0.7,
                });

                let raw = '';
                for await (const chunk of stream) {
                  if (chunk.choices?.length > 0) {
                    raw += chunk.choices[0].delta.content || '';
                  }
                }
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ reply: raw }))
                return;
              }

              // Handle /api/generate
              const { systemPrompt, userMessage } = payload
              const stream = hf.chatCompletionStream({
                model: 'meta-llama/Llama-3.1-8B-Instruct',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user',   content: userMessage  },
                ],
                max_tokens: 8192,
                temperature: 0.2,
              })

              let raw = ''
              for await (const chunk of stream) {
                if (chunk.choices?.length > 0) {
                  raw += chunk.choices[0].delta.content || ''
                }
              }

              // ── Step 1: strip markdown code fences if the model wrapped output ──
              const stripped = raw
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```\s*$/, '')
                .trim()

              // ── Step 2: extract the outermost { … } block ──────────────────────
              const startIdx = stripped.indexOf('{')
              const endIdx   = stripped.lastIndexOf('}')

              if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                  error: 'Format Error: No JSON object found in model output',
                  raw:   raw.slice(0, 400),
                }))
                return
              }

              const candidate = stripped.substring(startIdx, endIdx + 1)

              // ── Step 3: fast path — already valid JSON ──────────────────────────
              try {
                JSON.parse(candidate)
                res.setHeader('Content-Type', 'application/json')
                res.end(candidate)
                return
              } catch (_) { /* fall through */ }

              // ── Step 4: pre-process markdown artefacts, then repair ─────────────
              const { jsonrepair } = await import('jsonrepair')
              const processed = preProcess(candidate)

              try {
                const repaired = jsonrepair(processed)
                JSON.parse(repaired) // final validation
                res.setHeader('Content-Type', 'application/json')
                res.end(repaired)
              } catch (repairErr) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                  error:   'JSON Repair Failed: model output is unrecoverable',
                  details: repairErr instanceof Error ? repairErr.message : 'Unknown error',
                  raw:     candidate.slice(0, 600),
                }))
              }

            } catch (err: unknown) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                error:   'Backend error',
                details: err instanceof Error ? err.message : 'Unknown error',
              }))
            }
          })
        })
      },
    },
  ],
})
