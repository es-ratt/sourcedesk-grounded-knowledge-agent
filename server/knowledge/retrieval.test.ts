import { describe, expect, it } from "vitest";
import { retrievePassages, readKnowledgeSource } from "./retrieval";

describe("knowledge retrieval", () => {
  it("reads the bundled source and returns relevant cited passages", () => {
    expect(readKnowledgeSource()).toContain("SourceDesk Handbook");
    const results = retrievePassages("How does SourceDesk keep answers grounded?");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(result => result.text.includes("curated source"))).toBe(true);
  });

  it("supports synonym-aware retrieval for citation questions", () => {
    const results = retrievePassages("Where are the excerpts shown?");
    expect(results.some(result => result.id === "S3")).toBe(true);
  });

  it("returns no passages for an unsupported question", () => {
    expect(retrievePassages("What is the weather on Mars today?")).toEqual([]);
  });
});
