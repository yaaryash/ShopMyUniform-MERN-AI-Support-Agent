import OpenAI from "openai";
import { toolDefinitions, executeTool } from "./aiTools.js";

let client;
const getClient = () => {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return client;
};

const SYSTEM_PROMPT = `You are the customer support assistant for ShopMyUniform, an online school uniform store.

Rules:
- Always use the provided tools to look up real data (products, sizes, orders, delivery, returns) before answering. Never invent product availability, prices, or order statuses from general knowledge.
- For order-related questions, ALWAYS call get_my_orders or get_order_by_id first — do not assume the user is logged out. If the tool result contains a "not logged in" error, THEN tell the user to log in. Never skip the tool call and guess.
- Keep answers concise, friendly, and specific (mention actual sizes/prices/status you retrieved).
- If a tool returns no results, say so honestly instead of guessing.
- For product questions, if the user didn't mention a school, ask which school so you can filter correctly — unless they've already told you.
- Format answers as plain conversational text only. Do NOT use markdown tables, pipe characters, or heavy markdown formatting — this is a chat widget, not a document. Short bullet points with a dash are fine if needed, but prefer plain sentences.
- Format answers as plain conversational text only. Do NOT use markdown tables, pipe characters, bold asterisks, or heavy formatting — this is a plain-text chat widget, not a document. Plain sentences only, occasional dashes for a short list are fine.
- Never mention internal database IDs (product IDs, order IDs as raw Mongo strings) to the customer. If you need to reference an order, use natural phrasing like "your most recent order" instead of an ID string.
- Always use ₹ (rupees) as the currency symbol when mentioning prices, never $ or "USD".`

const stripMarkdown = (text) => {
  if (!text) return text;
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\|/g, "")
    .replace(/-{2,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

export const runAgent = async (userMessage, history = [], userId = null) => {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage },
  ];

  const allToolsUsed = []; // accumulates across every round, not just the last one

  for (let round = 0; round < 4; round++) {
    const response = await getClient().chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      tools: toolDefinitions,
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    const msg = choice.message;

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return { reply: stripMarkdown(msg.content), toolsUsed: allToolsUsed };
    }

    messages.push(msg);

    for (const call of msg.tool_calls) {
      const args = call.function.arguments
        ? JSON.parse(call.function.arguments)
        : {};
      const result = await executeTool(call.function.name, args, userId);
      allToolsUsed.push({ name: call.function.name, args });

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }

    if (round === 3) {
      const finalResponse = await getClient().chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages,
      });
      return {
        reply: stripMarkdown(finalResponse.choices[0].message.content),
        toolsUsed: allToolsUsed,
      };
    }
  }
};
