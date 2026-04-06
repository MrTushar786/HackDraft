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

  const { systemPrompt, userMessage } = request.body;

  if (!systemPrompt || !userMessage) {
    return response.status(400).json({ error: 'System and User prompt are required' });
  }

  try {
    const stream = hf.chatCompletionStream({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 4000,
      temperature: 0.1,
    });

    let result = "";
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const content = chunk.choices[0].delta.content || "";
        result += content;
      }
    }

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        let rawJson = jsonMatch[0];
        // Fix common trailing comma issues
        rawJson = rawJson.replace(/,\s*([\]}])/g, '$1');
        const parsed = JSON.parse(rawJson);
        return response.status(200).json(parsed);
      } catch (parseError) {
        return response.status(500).json({ 
          error: "Failed to parse JSON response. The LLM produced malformed output. Please click reboot and try again.", 
          details: parseError instanceof Error ? parseError.message : String(parseError),
          raw: result 
        });
      }
    }

    return response.status(500).json({ error: "No JSON object found in response", raw: result });

  } catch (error) {
    console.error('API Error:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}
