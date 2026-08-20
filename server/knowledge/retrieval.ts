import fs from "node:fs";
import path from "node:path";

export type KnowledgePassage = {
  id: string;
  heading: string;
  text: string;
  score: number;
  matchedTerms: string[];
};

type RawPassage = Omit<KnowledgePassage, "score" | "matchedTerms">;

const HANDBOOK_PATH = path.join(process.cwd(), "server", "knowledge", "sourcedesk-handbook.md");
const STOPWORDS = new Set(["the", "what", "where", "when", "does", "how", "are", "is", "a", "an", "and", "or", "to", "from", "of", "in", "on", "for", "with", "it", "this", "that"]);
const SYNONYMS: Record<string, string[]> = {
  grounded: ["grounding", "source", "evidence", "traceable"],
  citation: ["citations", "cited", "excerpt", "excerpts"],
  search: ["retrieval", "find", "relevant"],
  history: ["session", "conversation", "reviewable"],
  limits: ["limit", "mvp", "support"],
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function loadPassages(): RawPassage[] {
  const source = fs.readFileSync(HANDBOOK_PATH, "utf8");
  const sections = source.split(/\n(?=## )/).filter(section => section.trim().startsWith("## "));
  return sections.map((section, index) => {
    const lines = section.trim().split("\n");
    const heading = lines[0].replace(/^##\s*/, "").trim();
    const text = lines.slice(1).join(" ").replace(/\s+/g, " ").trim();
    return { id: `S${index + 1}`, heading, text };
  });
}

export function retrievePassages(question: string, limit = 4): KnowledgePassage[] {
  const normalizedQuestion = normalize(question);
  const queryTerms = new Set(normalizedQuestion.split(" ").filter(term => term.length > 2 && !STOPWORDS.has(term)));
  const expandedTerms = new Set(queryTerms);
  queryTerms.forEach(term => (SYNONYMS[term] ?? []).forEach(synonym => expandedTerms.add(synonym)));

  return loadPassages()
    .map(passage => {
      const normalizedText = normalize(`${passage.heading} ${passage.text}`);
      const words = new Set(normalizedText.split(" "));
      const matchedTerms = Array.from(expandedTerms).filter(term => words.has(term));
      const phraseBonus = normalizedQuestion.length > 8 && normalizedText.includes(normalizedQuestion) ? 3 : 0;
      const score = matchedTerms.length + phraseBonus;
      return { ...passage, score, matchedTerms };
    })
    .filter(passage => passage.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function readKnowledgeSource() {
  return fs.readFileSync(HANDBOOK_PATH, "utf8");
}

export const knowledgeSourcePath = HANDBOOK_PATH;
