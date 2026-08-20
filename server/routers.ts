import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { retrievePassages } from "./knowledge/retrieval";

export function validateAnswerCitations(answer: string, passageIds: string[]) {
  const citations = Array.from(answer.matchAll(/\[S(\d+)\]/g)).map(match => `S${match[1]}`);
  const allowed = new Set(passageIds);
  return citations.length > 0 && citations.every(citation => allowed.has(citation));
}

function messageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map(part => (typeof part === "string" ? part : (part as { text?: string }).text ?? ""))
      .join("");
  }
  return "";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  knowledge: router({
    ask: publicProcedure
      .input(z.object({ question: z.string().trim().min(3).max(500) }))
      .mutation(async ({ input }) => {
        const passages = retrievePassages(input.question);
        if (passages.length === 0) {
          return {
            answer: "I can’t verify that from the connected knowledge file. Try asking about SourceDesk’s purpose, grounding, retrieval, citations, history, or MVP limits.",
            passages: [],
          };
        }

        const sourceBlock = passages
          .map(passage => `[${passage.id}] ${passage.heading}: ${passage.text}`)
          .join("\n\n");
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are SourceDesk, a strict grounded knowledge-base assistant. Answer using only the supplied source passages. Do not use outside knowledge, assumptions, or unstated facts. If the passages do not support an answer, say you cannot verify it from the connected source. Keep the answer concise and useful. Cite every substantive claim inline with the exact source ID format [S1], [S2], etc. Do not invent source IDs.",
            },
            {
              role: "user",
              content: `Question: ${input.question}\n\nRetrieved source passages:\n${sourceBlock}`,
            },
          ],
        });

        const answer = messageText(response.choices?.[0]?.message?.content).trim();
        const safeAnswer = validateAnswerCitations(answer, passages.map(passage => passage.id))
          ? answer
          : "I couldn’t produce a verifiable, cited answer from the retrieved passages. Please try a more specific question.";
        return {
          answer: safeAnswer || "I couldn’t produce a grounded answer from the retrieved passages.",
          passages,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
