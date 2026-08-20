import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));

import { invokeLLM } from "./_core/llm";
import { appRouter, validateAnswerCitations } from "./routers";

const mockedInvokeLLM = vi.mocked(invokeLLM);
const caller = () => appRouter.createCaller({
  user: undefined,
  req: { protocol: "https", headers: {} } as never,
  res: {} as never,
});

describe("knowledge answer citation contract", () => {
  it("accepts citations that map to retrieved passages", () => {
    expect(validateAnswerCitations("Grounding is enforced [S1].", ["S1", "S2"])).toBe(true);
  });

  it("rejects answers without inline citations", () => {
    expect(validateAnswerCitations("Grounding is enforced.", ["S1"])).toBe(false);
  });

  it("rejects fabricated passage IDs", () => {
    expect(validateAnswerCitations("This is supported [S9].", ["S1", "S2"])).toBe(false);
  });
});

describe("knowledge.ask", () => {
  beforeEach(() => vi.resetAllMocks());

  it("returns a safe not-found response without outside knowledge", async () => {
    const result = await caller().knowledge.ask({ question: "What is the weather on Mars today?" });
    expect(result.passages).toEqual([]);
    expect(result.answer).toContain("verify");
    expect(mockedInvokeLLM).not.toHaveBeenCalled();
  });

  it("returns a successful answer when the model cites retrieved passages", async () => {
    mockedInvokeLLM.mockResolvedValue({ choices: [{ message: { content: "SourceDesk answers from a curated source [S1]." } }] } as never);
    const result = await caller().knowledge.ask({ question: "What does SourceDesk do?" });
    expect(result.passages.length).toBeGreaterThan(0);
    expect(result.answer).toContain("[S1]");
    expect(mockedInvokeLLM).toHaveBeenCalledOnce();
  });

  it("falls back when the model cites a passage that was not retrieved", async () => {
    mockedInvokeLLM.mockResolvedValue({ choices: [{ message: { content: "This is supported [S99]." } }] } as never);
    const result = await caller().knowledge.ask({ question: "What does SourceDesk do?" });
    expect(result.answer).toContain("verifiable, cited answer");
    expect(result.answer).not.toContain("[S99]");
  });
});
