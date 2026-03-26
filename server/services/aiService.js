const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

let openai = null;
let gemini = null;

const initializeAI = () => {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  if (process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
};

const getAIProvider = () => {
  const provider = process.env.AI_PROVIDER || "openai";
  if (provider === "gemini" && gemini) return "gemini";
  if (openai) return "openai";
  if (gemini) return "gemini";
  return null;
};

const summarizeWithOpenAI = async (content, language = "en") => {
  const langInstruction =
    language === "ur"
      ? "Respond in Urdu."
      : language === "mixed"
        ? "Respond in the same language mix as the content."
        : "Respond in English.";

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an academic assistant. Summarize the following notes concisely while preserving key information. ${langInstruction}`,
      },
      {
        role: "user",
        content: content,
      },
    ],
    max_tokens: 500,
    temperature: 0.5,
  });

  return response.choices[0].message.content;
};

const summarizeWithGemini = async (content, language = "en") => {
  const langInstruction =
    language === "ur"
      ? "Respond in Urdu."
      : language === "mixed"
        ? "Respond in the same language mix as the content."
        : "Respond in English.";

  const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const prompt = `You are an academic assistant. Summarize the following notes concisely while preserving key information. ${langInstruction}\n\nContent:\n${content}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

const summarizeNote = async (content, language = "en") => {
  const provider = getAIProvider();

  if (!provider) {
    throw new Error(
      "No AI provider configured. Please set OPENAI_API_KEY or GEMINI_API_KEY.",
    );
  }

  if (provider === "openai") {
    return {
      text: await summarizeWithOpenAI(content, language),
      model: "openai",
    };
  } else {
    return {
      text: await summarizeWithGemini(content, language),
      model: "gemini",
    };
  }
};

const extractTextFromImageWithOpenAI = async (imageUrl) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all text from this handwritten note image. Preserve the structure and formatting as much as possible. If there are mathematical equations, represent them in LaTeX format.",
          },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
    max_tokens: 2000,
  });

  return response.choices[0].message.content;
};

const extractTextFromImageWithGemini = async (imageUrl) => {
  const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

  const response = await fetch(imageUrl);
  const imageData = await response.arrayBuffer();
  const base64Image = Buffer.from(imageData).toString("base64");
  const mimeType = response.headers.get("content-type") || "image/jpeg";

  const result = await model.generateContent([
    "Extract all text from this handwritten note image. Preserve the structure and formatting as much as possible. If there are mathematical equations, represent them in LaTeX format.",
    {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    },
  ]);

  return result.response.text();
};

const extractTextFromImage = async (imageUrl) => {
  const provider = getAIProvider();

  if (!provider) {
    throw new Error("No AI provider configured.");
  }

  if (provider === "openai") {
    return {
      text: await extractTextFromImageWithOpenAI(imageUrl),
      model: "openai",
    };
  } else {
    return {
      text: await extractTextFromImageWithGemini(imageUrl),
      model: "gemini",
    };
  }
};

const generateQuizWithOpenAI = async (content, options = {}) => {
  const {
    questionCount = 5,
    difficulty = "medium",
    includeTopics = [],
  } = options;

  const topicsInstruction =
    includeTopics.length > 0
      ? `Also include questions about these related topics: ${includeTopics.join(
          ", ",
        )}.`
      : "";

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an educational quiz generator. Create a quiz based on the provided notes. Generate ${questionCount} questions with ${difficulty} difficulty. ${topicsInstruction} Return the quiz in JSON format with this structure: { "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "...", "difficulty": "easy|medium|hard" }] }`,
      },
      {
        role: "user",
        content: content,
      },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });

  const quizText = response.choices[0].message.content;
  const jsonMatch = quizText.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse quiz response");
};

const generateQuizWithGemini = async (content, options = {}) => {
  const {
    questionCount = 5,
    difficulty = "medium",
    includeTopics = [],
  } = options;

  const topicsInstruction =
    includeTopics.length > 0
      ? `Also include questions about these related topics: ${includeTopics.join(
          ", ",
        )}.`
      : "";

  const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const prompt = `You are an educational quiz generator. Create a quiz based on the provided notes. Generate ${questionCount} questions with ${difficulty} difficulty. ${topicsInstruction} Return the quiz in JSON format with this structure: { "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "...", "difficulty": "easy|medium|hard" }] }\n\nNotes:\n${content}`;

  const result = await model.generateContent(prompt);
  const quizText = result.response.text();
  const jsonMatch = quizText.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse quiz response");
};

const generateQuiz = async (content, options = {}) => {
  const provider = getAIProvider();

  if (!provider) {
    throw new Error("No AI provider configured.");
  }

  if (provider === "openai") {
    return {
      quiz: await generateQuizWithOpenAI(content, options),
      model: "openai",
    };
  } else {
    return {
      quiz: await generateQuizWithGemini(content, options),
      model: "gemini",
    };
  }
};

module.exports = {
  initializeAI,
  getAIProvider,
  summarizeNote,
  extractTextFromImage,
  generateQuiz,
};
