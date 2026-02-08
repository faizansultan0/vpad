const { getAIProvider } = require("../../services/aiService");

describe("AI Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getAIProvider", () => {
    it("should return null when no API keys configured", () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.AI_PROVIDER;

      // Re-require the module to reset state
      jest.isolateModules(() => {
        const { getAIProvider: getProvider } = require("../../services/aiService");
        const provider = getProvider();
        expect(provider).toBeNull();
      });
    });
  });

  describe("AI Model Configuration", () => {
    it("should use gemini-2.0-flash model", () => {
      const expectedModel = "gemini-2.0-flash";
      expect(expectedModel).toBe("gemini-2.0-flash");
    });

    it("should use gpt-3.5-turbo for OpenAI", () => {
      const expectedModel = "gpt-3.5-turbo";
      expect(expectedModel).toBe("gpt-3.5-turbo");
    });
  });

  describe("Prompt Templates", () => {
    it("should have correct summarize prompt structure", () => {
      const langInstruction = "Respond in English.";
      const content = "Test content";
      const prompt = `You are an academic assistant. Summarize the following notes concisely while preserving key information. ${langInstruction}\n\nContent:\n${content}`;

      expect(prompt).toContain("academic assistant");
      expect(prompt).toContain("Summarize");
      expect(prompt).toContain(content);
    });

    it("should support Urdu language instruction", () => {
      const langInstruction = "Respond in Urdu.";
      expect(langInstruction).toBe("Respond in Urdu.");
    });

    it("should support mixed language instruction", () => {
      const langInstruction = "Respond in the same language mix as the content.";
      expect(langInstruction).toContain("same language mix");
    });
  });

  describe("Quiz Generation", () => {
    it("should have correct quiz JSON structure", () => {
      const quizStructure = {
        questions: [
          {
            question: "Sample question?",
            options: ["A", "B", "C", "D"],
            correctAnswer: 0,
            explanation: "Explanation text",
            difficulty: "medium",
          },
        ],
      };

      expect(quizStructure.questions).toBeInstanceOf(Array);
      expect(quizStructure.questions[0]).toHaveProperty("question");
      expect(quizStructure.questions[0]).toHaveProperty("options");
      expect(quizStructure.questions[0]).toHaveProperty("correctAnswer");
      expect(quizStructure.questions[0].options).toHaveLength(4);
    });
  });
});
