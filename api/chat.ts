import { VercelRequest, VercelResponse } from '@vercel/node';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { idea, messages } = request.body;

  if (!idea || !messages || !Array.isArray(messages)) {
    return response.status(400).json({ error: 'Project idea and message history are required' });
  }

  const systemPrompt = `You are "HackDraft Buddy", an enthusiastic, elite developer buddy helping the user build their hackathon project: "${idea.name}".
Your personality: encouraging, highly technical, concise, and focused on shipping.

Here is the blueprint of the project you are building together:
- Tagline: ${idea.tagline}
- Problem: ${idea.problem}
- Solution: ${idea.solution}
- Architecture: ${idea.architecture}

Keep your answers extremely concise, practical, and conversational. Provide code snippets only if explicitly asked or highly relevant. Use brief bullet points if needed. Speak directly to the developer as their partner.`;

  try {
    const stream = hf.chatCompletionStream({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    let result = "";
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const content = chunk.choices[0].delta.content || "";
        result += content;
      }
    }

    return response.status(200).json({ reply: result });
  } catch (error) {
    console.error('Chat API Error:', error);
    return response.status(500).json({ error: 'Chat API Error', details: error instanceof Error ? error.message : 'Unknown' });
  }
}
