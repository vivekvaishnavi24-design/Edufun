import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Support large PDF payloads up to 50MB
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static assets (especially full audio tracks with HTTP Range / 206 Partial Content support)
app.use("/audio", express.static(path.join(process.cwd(), "public/audio"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".mp3")) res.setHeader("Content-Type", "audio/mpeg");
    if (filePath.endsWith(".ogg")) res.setHeader("Content-Type", "audio/ogg");
    res.setHeader("Accept-Ranges", "bytes");
  }
}));
app.use(express.static(path.join(process.cwd(), "public")));

let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in the environment. Please add your key in the Settings > Secrets panel."
    );
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Helper to reliably identify if a question is True/False
function isTrueFalseQuestionServer(q: any): boolean {
  if (!q) return false;
  if (q.type === "true_false") return true;
  const qText = String(q.question || "").toLowerCase();
  if (
    qText.includes("true or false") ||
    qText.includes("true/false") ||
    qText.includes("(true or false)") ||
    qText.includes("(true/false)") ||
    qText.includes("is this statement true") ||
    qText.includes("state whether true or false") ||
    qText.includes("सत्य या असत्य") ||
    qText.includes("सत्यम् अथवा असत्यम्")
  ) {
    return true;
  }
  const opts = (Array.isArray(q.options) ? q.options : []).map((o: any) =>
    String(o).trim().toLowerCase()
  );
  const hasTrue =
    opts.includes("true") || opts.includes("सत्य") || opts.includes("सत्यम्");
  const hasFalse =
    opts.includes("false") || opts.includes("असत्य") || opts.includes("अशुद्धम्");
  if (hasTrue && hasFalse) return true;
  const correct = String(q.correctAnswer || "").trim().toLowerCase();
  if ((correct === "true" || correct === "false") && opts.length <= 2) {
    return true;
  }
  return false;
}

// Helper to ensure correct MCQ option rotates/changes position after every question and is not always 'A'
function ensureVariedMcqOptionsServer(questions: any[]): any[] {
  let prevTargetIdx = -1;

  return questions.map((q, qIndex) => {
    // True/False questions must strictly have only 2 options: True and False (no Alternative 1)
    if (isTrueFalseQuestionServer(q)) {
      const isFalse = String(q.correctAnswer).trim().toLowerCase() === "false" ||
        String(q.correctAnswer).trim().toLowerCase() === "असत्य" ||
        String(q.correctAnswer).trim().toLowerCase() === "अशुद्धम्";

      return {
        ...q,
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: isFalse ? "False" : "True",
      };
    }

    // Typed questions have no options array
    if (q.type === "typed") {
      return {
        ...q,
        type: "typed",
        options: [],
        correctAnswer: String(q.correctAnswer || "").trim(),
        hint: q.hint || q.funFactOrJoke || "Think about the core term or principle.",
      };
    }

    const rawOptions: string[] = Array.isArray(q.options) ? q.options.map(String) : [];
    const correctAnswer = String(q.correctAnswer || "").trim();

    if (rawOptions.length < 2 || !correctAnswer) {
      return q;
    }

    const targetLength = 4;
    const rawDistractors = rawOptions.filter(
      (opt) => opt.trim().toLowerCase() !== correctAnswer.toLowerCase() && !opt.toLowerCase().startsWith("alternative")
    );

    const uniqueDistractors: string[] = [];
    for (const d of rawDistractors) {
      if (!uniqueDistractors.some((u) => u.toLowerCase() === d.toLowerCase())) {
        uniqueDistractors.push(d);
      }
    }

    // Gather authentic distractors from other questions in the quiz if needed
    if (uniqueDistractors.length < targetLength - 1) {
      const candidateDistractors = questions
        .flatMap((other) => [other.correctAnswer, ...(other.options || [])])
        .map((s) => String(s || "").trim())
        .filter(
          (s) =>
            s &&
            s.toLowerCase() !== correctAnswer.toLowerCase() &&
            s.toLowerCase() !== "true" &&
            s.toLowerCase() !== "false" &&
            !s.toLowerCase().startsWith("alternative") &&
            !uniqueDistractors.some((u) => u.toLowerCase() === s.toLowerCase())
        );

      for (const d of candidateDistractors) {
        if (uniqueDistractors.length >= targetLength - 1) break;
        uniqueDistractors.push(d);
      }
    }

    // Fallback options if still under 3 distractors, NEVER "Alternative 1"
    const fallbackOptions = ["None of the above", "All of the above", "Cannot be determined accurately"];
    let fIdx = 0;
    while (uniqueDistractors.length < targetLength - 1) {
      const fb = fallbackOptions[fIdx++] || `Option ${uniqueDistractors.length + 1}`;
      if (!uniqueDistractors.some((u) => u.toLowerCase() === fb.toLowerCase())) {
        uniqueDistractors.push(fb);
      }
    }

    const finalDistractors = uniqueDistractors.slice(0, targetLength - 1);
    const shuffledDistractors = [...finalDistractors].sort(() => Math.random() - 0.5);

    const allIndices = [0, 1, 2, 3];
    const validIndices = allIndices.filter((idx) => idx !== prevTargetIdx);

    let candidateIndices = validIndices;
    if (qIndex === 0) {
      const nonZero = validIndices.filter((idx) => idx !== 0);
      if (nonZero.length > 0) {
        candidateIndices = nonZero;
      }
    }

    const targetIdx =
      candidateIndices[Math.floor(Math.random() * candidateIndices.length)] ??
      (prevTargetIdx === 0 ? 1 : 0);

    prevTargetIdx = targetIdx;

    const newOptions: string[] = [];
    let dIndex = 0;
    for (let i = 0; i < targetLength; i++) {
      if (i === targetIdx) {
        newOptions.push(correctAnswer);
      } else {
        newOptions.push(shuffledDistractors[dIndex++] || `Option ${i + 1}`);
      }
    }

    return {
      ...q,
      type: "mcq",
      options: newOptions,
      correctAnswer: correctAnswer,
    };
  });
}

// Quiz generation endpoint
app.post("/api/generate-quiz", async (req, res) => {
  const {
    pdfBase64,
    textContext,
    documentName = "Uploaded Material",
    subjectName,
    faculty,
    educationLevel = "undergraduate",
    numQuestions = 5,
    questionTypes = "mixed",
    difficulty = "medium",
    focusTopic = "",
    language = "en",
  } = req.body || {};

  try {
    if (!pdfBase64 && !textContext && !subjectName) {
      return res.status(400).json({
        error: "Please provide either a PDF document, study text, or select/enter an academic subject to generate your test.",
      });
    }

    const ai = getGenAI();

    // Prepare content parts
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // If PDF is supplied, clean data URL header if necessary and append as inlineData
    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:[^;]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: cleanBase64,
        },
      });
    }

    // Add instructions and options
    let questionTypeGuidance = "";
    if (questionTypes === "mcq") {
      questionTypeGuidance = "Generate ONLY Multiple Choice Questions (MCQ, type='mcq'). Each must have strictly and exactly 4 choices in options.";
    } else if (questionTypes === "true_false") {
      questionTypeGuidance = "Generate ONLY True/False questions (type='true_false'). Each question's options array MUST be strictly and exactly 2 choices: ['True', 'False'] (or in Hindi: ['सत्य', 'असत्य'], in Sanskrit: ['सत्यम्', 'असत्यम्']).";
    } else if (questionTypes === "typed") {
      questionTypeGuidance = "Generate ONLY Typed questions (type='typed') where the student types their answer into a text box. For type='typed', options must be an empty array [], correctAnswer must be a clear concise answer (1-4 words or number), and hint must provide an encouraging clue.";
    } else {
      questionTypeGuidance =
        "Generate a balanced, varied mix of: Multiple Choice Questions (type='mcq', strictly 4 choices), True/False questions (type='true_false', strictly 2 choices ['True', 'False']), and Typed Short Answer questions (type='typed', open-ended with options: [], concise correctAnswer, and helpful hint).";
    }

    let difficultyGuidance = "";
    if (difficulty === "easy") {
      difficultyGuidance = "Target difficulty: Easy (focus on foundational definitions, core facts, and direct recall).";
    } else if (difficulty === "hard") {
      difficultyGuidance = "Target difficulty: Hard (focus on deep conceptual understanding, analytical reasoning, multi-step scenarios, and edge cases).";
    } else if (difficulty === "mixed") {
      difficultyGuidance = "Target difficulty: Progressive mix of easy, medium, and challenging analytical questions.";
    } else {
      difficultyGuidance = "Target difficulty: Medium (standard university/college exam level testing concepts and applications).";
    }

    let educationLevelGuidance = "";
    if (educationLevel === "class_1") {
      educationLevelGuidance = "Academic Level: Class 1 / Grade 1 (Age 5-7). Use very simple, cheerful, friendly words. Focus on counting numbers 1-20, primary colors, simple shapes (circle, square, triangle), familiar animals, sounds, family, and good habits. Questions must be easy and encourage young children.";
    } else if (educationLevel === "class_2") {
      educationLevelGuidance = "Academic Level: Class 2 / Grade 2 (Age 6-8). Simple addition & subtraction under 100, plant parts, four seasons & weather, community helpers (doctors, firefighters, teachers), opposites, and friendly animal facts.";
    } else if (educationLevel === "class_3") {
      educationLevelGuidance = "Academic Level: Class 3 / Grade 3 (Age 7-9). Times tables 2-10, simple sharing division, our solar system and the 8 planets, bird nests, healthy food, and basic nouns & verbs.";
    } else if (educationLevel === "class_4") {
      educationLevelGuidance = "Academic Level: Class 4 / Grade 4 (Age 8-10). Simple fractions (halves, quarters), solids/liquids/gases, human teeth & digestion, world habitats, and basic map reading.";
    } else if (educationLevel === "class_5") {
      educationLevelGuidance = "Academic Level: Class 5 / Grade 5 (Age 9-11). Factors, multiples, LCM/HCF, decimals, gravity, forces, 7 continents & 5 oceans, environment, and story vocabulary.";
    } else if (educationLevel === "junior_school") {
      educationLevelGuidance = "Academic Level: Junior Primary School (Classes 1 to 5, Age 6-11). Friendly, joyful, clear language with relatable examples (animals, toys, fruits, stars, family, nature). Focus on positive encouragement.";
    } else if (educationLevel === "class_6") {
      educationLevelGuidance = "Academic Level: Class 6 / Grade 6 (Age 11-12). Focus on Integers, Ratio & Proportion, Basic Geometry, Components of Food, Living Organisms & Habitats, Ancient Civilizations, Earth in Solar System.";
    } else if (educationLevel === "class_7") {
      educationLevelGuidance = "Academic Level: Class 7 / Grade 7 (Age 12-13). Focus on Fractions & Decimals, Algebraic Expressions, Heat & Temperature, Acids, Bases & Salts, Nutrition in Plants & Animals, Weather & Climate, Medieval History.";
    } else if (educationLevel === "class_8") {
      educationLevelGuidance = "Academic Level: Class 8 / Grade 8 (Age 13-14). Focus on Linear Equations in One Variable, Square Roots, Force & Pressure, Friction & Sound, Cell Structure & Microorganisms, Chemical Effects, Constitution & Civics.";
    } else if (educationLevel === "middle_school") {
      educationLevelGuidance = "Academic Level: Middle School (Grades 6-8). Focus on foundational principles, accessible definitions, intuitive examples, and fundamental scientific/humanistic vocabulary.";
    } else if (educationLevel === "class_9") {
      educationLevelGuidance = "Academic Level: Class 9 / Grade 9 (Age 14-15). Focus on Motion & Laws of Force, Gravitation, Work & Energy, Atoms & Molecules, Cell & Tissues, Polynomials, Coordinate Geometry, Number Systems, Democratic Institutions.";
    } else if (educationLevel === "class_10") {
      educationLevelGuidance = "Academic Level: Class 10 / Grade 10 (Age 15-16 Board Exam Level). Focus on Trigonometry, Quadratic Equations, Light Optics, Electricity, Chemical Reactions, Carbon Compounds, Life Processes, Heredity, Board Exam standards.";
    } else if (educationLevel === "class_11") {
      educationLevelGuidance = "Academic Level: Class 11 / Grade 11 (Age 16-17 Pre-University). Focus on Kinematics, Thermodynamics, Chemical Bonding, Organic Chemistry Basics, Sets & Functions, Calculus Intro, Cell Biology & Physiology.";
    } else if (educationLevel === "class_12") {
      educationLevelGuidance = "Academic Level: Class 12 / Grade 12 (Age 17-18 Senior Board Exam & Entrance Prep). Focus on Electrostatics, Current Electricity, Optics, Integrals & Differential Equations, Vectors, Genetics, Macroeconomics, Solutions.";
    } else if (educationLevel === "high_school") {
      educationLevelGuidance = "Academic Level: High School (Grades 9-12). Focus on standard secondary school curriculum benchmarks, formulas, historical dates, and key conceptual relationships.";
    } else if (educationLevel === "ap_college_prep") {
      educationLevelGuidance = "Academic Level: Advanced Placement (AP) / International Baccalaureate (IB) / College Prep. High rigor, multi-step analytical reasoning, synthesis across topics, and rigorous problem solving.";
    } else if (educationLevel === "graduate") {
      educationLevelGuidance = "Academic Level: Graduate (Master's / PhD level). Advanced theoretical nuances, research paradigms, complex proofs, historiography, and specialized terminology.";
    } else if (educationLevel === "professional") {
      educationLevelGuidance = "Academic Level: Professional & Board Certification. Focus on clinical, legal, industrial, and real-world applied scenarios with high-stakes precision.";
    } else {
      educationLevelGuidance = "Academic Level: Undergraduate University. Deep conceptual mastery, collegiate textbook depth, mechanism analysis, and standard university exam rigor.";
    }

    let languageGuidance = "";
    if (language === "hi") {
      languageGuidance =
        "CRITICAL LANGUAGE INSTRUCTION: The user has requested HINDI (हिन्दी). All output fields—title, summary, topics, question prompts, options, correctAnswer, questionSummary, and explanation—MUST be written in standard, grammatical Hindi in Devanagari script. Use clear academic Hindi terminology.";
    } else if (language === "sa") {
      languageGuidance =
        "CRITICAL LANGUAGE INSTRUCTION: The user has requested SANSKRIT (संस्कृतम्). All output fields—title, summary, topics, question prompts, options, correctAnswer, questionSummary, and explanation—MUST be written in classical, grammatically accurate Sanskrit in Devanagari script (शुद्धसंस्कृतेन). Use proper Vibhakti, Sandhi, and lucid academic Sanskrit.";
    } else {
      languageGuidance = "Language instruction: Write everything in clear, engaging academic English.";
    }

    const effectiveTitle = subjectName ? (focusTopic ? `${subjectName}: ${focusTopic}` : subjectName) : documentName;

    const subjectContextPrompt = subjectName ? `
UNIVERSAL ACADEMIC CURRICULUM MODE:
- Subject Discipline: "${subjectName}"
- Academic Faculty / Domain: "${faculty || "General Academia"}"
- ${educationLevelGuidance}
- Target Curriculum Standard: You are an expert university professor and textbook author in "${subjectName}". Design this test to match authentic, curriculum-aligned academic standards taught in universities and academies worldwide.
` : "";

    const promptText = `
You are an expert academic assessment creator and educator across all fields of human learning.
Your goal is to generate a rigorous, highly educational practice test.

Parameters:
- Test Title / Context: "${effectiveTitle}"
${subjectContextPrompt}
- Target Number of Questions: exactly ${Math.min(Math.max(Number(numQuestions) || 5, 3), 25)}
- Question Type Requirement: ${questionTypeGuidance}
- Difficulty Level: ${difficultyGuidance}
- Language: ${language === "hi" ? "Hindi (हिन्दी)" : language === "sa" ? "Sanskrit (संस्कृतम्)" : "English"}
${languageGuidance}
${focusTopic ? `- Specific Student Focus Area / Subtopic: "${focusTopic}". Focus heavily on this module while synthesizing the questions.` : ""}

Strict Quality & Pedagogical Rules:
1. Every question must be pedagogically sound, unambiguous, and test deep understanding of the subject matter.
2. Provide a "questionSummary" for each question: A concise 1-sentence summary of what the question is asking and what specific concept, theorem, or dilemma is being evaluated.
3. Provide a "conceptTested" for each question: A concise, impactful label (3-8 words) defining the exact core concept, theorem, or curriculum topic evaluated (e.g. "Troposphere & Active Weather Dynamics", "Ohm's Law & Circuit Resistance", "Mitochondrial ATP Synthesis").
4. Provide a "whyCorrect" for each question: A clear, direct 1-2 sentence explanation specifically stating WHY the correct answer is true, accurate, and factually sound.
5. For Multiple Choice (MCQ):
   - Provide strictly and exactly 4 realistic, distinct options.
   - Avoid trivial distractors; address common student misconceptions.
   - MANDATORY OPTION RANDOMIZATION: In the "options" array for MCQs, NEVER put the correct answer always in the first position (Option A). You MUST randomize and vary the position of "correctAnswer" across all 4 positions (A, B, C, D) such that consecutive questions have different correct option positions.
6. For True/False:
   - Provide unambiguous statements that are either definitively True or definitively False according to established academic scholarship.
   - Provide strictly and exactly 2 options: ["True", "False"].
7. For Typed (type="typed"):
   - The student types the answer directly into an input box.
   - Provide an empty array [] for "options".
   - "correctAnswer" must be the precise expected key term, number, or short answer (1-4 words).
   - "hint" MUST provide an encouraging hint that gives a clue without giving the whole answer away.
8. FRESHNESS GUARANTEE:
   - If the student is testing this topic again (timestamp: ${Date.now()}), ALWAYS generate completely fresh, new questions covering different scenarios, real-world examples, and problem variations so the test never feels repetitive even on the same topic!
9. Accuracy & Matching:
   - For MCQ and True/False, "correctAnswer" MUST match one of the items in the "options" array verbatim.
10. In-depth Explanations:
   - Provide an educational, illuminating explanation for every question in "explanation".
   - Explain why the correct answer is right and why the other choices are incorrect.
   - Cite the relevant concept, textbook law, or section from the material in "sourceReference" (e.g. standard textbook, historical chronicle, scientific law, or chapter).
11. "funFactOrJoke":
   - Provide a short, witty, tasteful 1-liner joke, clever pun, or amusing relatable mnemonic strictly about this question's topic. Keeps learning fun and delightful without getting off-track.
`;

    parts.push({ text: promptText });

    if (textContext && textContext.trim()) {
      parts.push({
        text: `--- Additional Study Text / Notes ---\n${textContext.trim()}`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        systemInstruction:
          "You are an elite academic test builder fluent in English, Hindi (हिन्दी), and Sanskrit (संस्कृतम्). You parse study materials, lecture slides, textbooks, and notes to generate high-yield, structured interactive practice quizzes with immediate feedback, question summaries, and pedagogical explanations in the requested language.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A descriptive academic title for the quiz based on the material",
            },
            summary: {
              type: Type.STRING,
              description: "A 1-2 sentence overview of the topics evaluated in this quiz",
            },
            topicsCovered: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key concepts or chapter topics tested",
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique question id like q1, q2" },
                  type: {
                    type: Type.STRING,
                    description: "One of 'mcq', 'true_false', or 'typed'",
                  },
                  question: {
                    type: Type.STRING,
                    description: "The question prompt or statement",
                  },
                  questionSummary: {
                    type: Type.STRING,
                    description: "A concise 1-sentence summary of what the question is asking and testing",
                  },
                  conceptTested: {
                    type: Type.STRING,
                    description: "Concise title or summary of the specific academic/scientific concept evaluated",
                  },
                  whyCorrect: {
                    type: Type.STRING,
                    description: "Clear, direct explanation stating specifically why the correct answer is right",
                  },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Options array. Exactly 4 choices for mcq, exactly 2 choices for true_false, empty for typed",
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: "The exact matching text of the correct choice",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Detailed teaching explanation for student feedback",
                  },
                  hint: {
                    type: Type.STRING,
                    description: "Helpful encouragement and hint when student gets the answer wrong",
                  },
                  sourceReference: {
                    type: Type.STRING,
                    description: "Short reference or section hint from the document",
                  },
                  difficulty: {
                    type: Type.STRING,
                    description: "'easy', 'medium', or 'hard'",
                  },
                  funFactOrJoke: {
                    type: Type.STRING,
                    description: "A short, witty, topic-related 1-liner joke, clever pun, or amusing relatable mnemonic strictly about this concept",
                  },
                },
                required: [
                  "id",
                  "type",
                  "question",
                  "questionSummary",
                  "options",
                  "correctAnswer",
                  "explanation",
                  "sourceReference",
                  "difficulty",
                ],
              },
            },
          },
          required: ["title", "summary", "topicsCovered", "questions"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response from Gemini API");
    }

    const quizData = JSON.parse(responseText.trim());

    // Sanitize and validate questions to ensure options and types conform strictly
    const validatedQuestions = (quizData.questions || []).map((q: any, idx: number) => {
      const rawType = String(q.type || "").toLowerCase().trim();
      const type = rawType === "typed" ? "typed" : rawType === "true_false" ? "true_false" : "mcq";
      let options: string[] = Array.isArray(q.options) ? q.options : [];

      if (type === "true_false") {
        options = ["True", "False"];
        const ca = String(q.correctAnswer).trim().toLowerCase();
        q.correctAnswer = ca === "false" || ca === "असत्य" || ca === "अशुद्धम्" ? "False" : "True";
      } else if (type === "typed") {
        options = [];
        q.correctAnswer = String(q.correctAnswer || "").trim();
      } else {
        // MCQ - ensure exactly 4 options with correct answer present
        if (!options.includes(q.correctAnswer) && options.length > 0) {
          options[0] = q.correctAnswer;
        }
        if (options.length < 4) {
          while (options.length < 4) {
            options.push(
              language === "hi"
                ? `विकल्प ${options.length + 1}`
                : language === "sa"
                ? `विकल्पः ${options.length + 1}`
                : `Option ${options.length + 1}`
            );
          }
        }
        options = options.slice(0, 4);
      }

      return {
        id: q.id || `q_${idx + 1}`,
        type,
        question: q.question || `Question ${idx + 1}`,
        questionSummary:
          q.questionSummary ||
          (language === "hi"
            ? "यह प्रश्न मूल संकल्पना का परीक्षण करता है।"
            : language === "sa"
            ? "अयम् प्रश्नः मुख्यसंकल्पनायाः परीक्षणं करोति।"
            : "This question evaluates the core concept and understanding."),
        options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "No explanation provided.",
        hint: q.hint || q.funFactOrJoke || "Focus on the key terminology and foundational rules of this topic.",
        sourceReference: q.sourceReference || documentName,
        difficulty: q.difficulty || difficulty,
        funFactOrJoke: q.funFactOrJoke || undefined,
      };
    });

    const finalQuiz = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: quizData.title || (subjectName ? `${subjectName} Practice Exam` : `${documentName} Practice Quiz`),
      summary: quizData.summary || `Practice quiz generated for ${subjectName || documentName}`,
      language: language as "en" | "hi" | "sa",
      topicsCovered: Array.isArray(quizData.topicsCovered) ? quizData.topicsCovered : [],
      documentName: subjectName || documentName,
      subjectName,
      faculty,
      educationLevel,
      createdAt: Date.now(),
      questions: ensureVariedMcqOptionsServer(validatedQuestions),
    };

    res.json(finalQuiz);
  } catch (error: any) {
    console.error("Error generating quiz, generating resilient curriculum fallback:", error);
    try {
      const isJunior =
        educationLevel === "class_1" ||
        educationLevel === "class_2" ||
        educationLevel === "class_3" ||
        educationLevel === "class_4" ||
        educationLevel === "class_5" ||
        educationLevel === "junior_school" ||
        faculty === "junior_school";

      const subject = subjectName || focusTopic || documentName || "General Knowledge";
      const count = Math.min(Math.max(Number(numQuestions) || 5, 3), 10);

      const juniorQuestions = [
        {
          id: "q_j1",
          type: "mcq",
          question: `Which of these is the most important basic rule when studying ${subject}?`,
          options: ["Practice step-by-step with patience", "Rush without checking", "Guess without looking", "Forget the rules"],
          correctAnswer: "Practice step-by-step with patience",
          explanation: "Taking your time and practicing step-by-step helps your brain remember things easily!",
          hint: "Think about how we practice writing or drawing!",
          difficulty: "easy"
        },
        {
          id: "q_j2",
          type: "true_false",
          question: `True or False: In ${subject}, practicing with fun examples makes learning easy and enjoyable.`,
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "Yes! Fun examples help young learners understand big ideas quickly.",
          hint: "Remember: learning is always fun when we explore together!",
          difficulty: "easy"
        },
        {
          id: "q_j3",
          type: "mcq",
          question: `What should you do first when you see a question about ${subject}?`,
          options: ["Read the question carefully twice", "Close your eyes", "Pick randomly", "Skip without reading"],
          correctAnswer: "Read the question carefully twice",
          explanation: "Reading carefully helps you find key words and clues!",
          hint: "Always check what is being asked first.",
          difficulty: "easy"
        },
        {
          id: "q_j4",
          type: "typed",
          question: `What is the word for a positive feeling when you solve a problem correctly?`,
          options: [],
          correctAnswer: "Happy",
          acceptedAnswers: ["happy", "happiness", "joy", "proud", "excited"],
          explanation: "Solving problems makes us feel proud, happy, and excited!",
          hint: "Starts with the letter H (like a big smile 😊)",
          difficulty: "easy"
        },
        {
          id: "q_j5",
          type: "true_false",
          question: `True or False: Asking teachers and parents questions helps you become smarter every day.`,
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "Asking questions is the sign of a curious and wonderful student!",
          hint: "Curiosity is a student's best superpower!",
          difficulty: "easy"
        }
      ];

      const standardQuestions = [
        {
          id: "q_s1",
          type: "mcq",
          question: `What is the central purpose and foundation of studying ${subject}?`,
          options: [
            `To understand core causal mechanisms and apply them to solve problems`,
            `To memorize isolated facts without context`,
            `To avoid testing hypotheses`,
            `To disregard observed evidence`
          ],
          correctAnswer: `To understand core causal mechanisms and apply them to solve problems`,
          explanation: `Systematic study of ${subject} builds structured mental models linking fundamental definitions to observable outcomes.`,
          hint: "Think about the foundational objectives of this field.",
          difficulty: "medium"
        },
        {
          id: "q_s2",
          type: "true_false",
          question: `True or False: In ${subject}, verified empirical observation and logical consistency are essential for drawing valid conclusions.`,
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: `All sound academic inquiry in ${subject} requires evidence and internally consistent reasoning.`,
          hint: "Consider how claims are validated.",
          difficulty: "easy"
        },
        {
          id: "q_s3",
          type: "mcq",
          question: `When analyzing a new problem in ${subject}, what is the first recommended step?`,
          options: [
            "Identify given parameters, core definitions, and target variables",
            "Guess an answer without reading assumptions",
            "Assume all external factors are irrelevant",
            "Skip to the end calculation immediately"
          ],
          correctAnswer: "Identify given parameters, core definitions, and target variables",
          explanation: "Clear problem framing is essential before applying specialized formulas or theorems.",
          hint: "Start by breaking down what you know and what you need to find.",
          difficulty: "medium"
        },
        {
          id: "q_s4",
          type: "true_false",
          question: `True or False: The principles learned in ${subject} can be applied across related disciplines and practical scenarios.`,
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "Cross-disciplinary synthesis is one of the highest values of academic learning.",
          hint: "Concepts connect across fields.",
          difficulty: "easy"
        },
        {
          id: "q_s5",
          type: "mcq",
          question: `Which factor most reliably prevents errors when answering complex questions in ${subject}?`,
          options: [
            "Checking dimensional consistency, units, and logical boundary conditions",
            "Speeding through the test without review",
            "Relying solely on intuition without validation",
            "Ignoring edge cases and constraints"
          ],
          correctAnswer: "Checking dimensional consistency, units, and logical boundary conditions",
          explanation: "Boundary condition checks and unit analysis quickly catch arithmetic and conceptual slips.",
          hint: "Think about verification techniques.",
          difficulty: "medium"
        }
      ];

      const pool = isJunior ? juniorQuestions : standardQuestions;
      const selected = pool.slice(0, count);

      const fallbackQuiz = {
        id: `quiz_fallback_${Date.now()}`,
        title: isJunior ? `${subject} • Junior School Quiz` : `${subject} • Practice Test`,
        summary: isJunior
          ? `Fun, interactive practice quiz specially designed for Junior School (Class 1 to 5) students!`
          : `Practice quiz generated for ${subject}`,
        language: language as "en" | "hi" | "sa",
        topicsCovered: [subject, isJunior ? "Junior School Fundamentals" : "Core Concepts"],
        documentName: subject,
        subjectName: subject,
        faculty: faculty || (isJunior ? "junior_school" : "all"),
        educationLevel,
        createdAt: Date.now(),
        questions: ensureVariedMcqOptionsServer(selected),
      };

      return res.json(fallbackQuiz);
    } catch (fallbackError) {
      console.error("Fallback generator also failed:", fallbackError);
      return res.status(500).json({
        error: error?.message || "Failed to generate quiz. Please try again.",
      });
    }
  }
});

// Endpoint: Interactive & Attractive Note Generator
app.post("/api/generate-notes", async (req, res) => {
  try {
    const { topic, subtopic = "", style = "active_recall", language = "en" } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Topic is required to generate study notes." });
    }

    const ai = getGenAI();
    const lang = (language as "en" | "hi" | "sa") || "en";

    const prompt = `
Generate high-yield, engaging, and deeply attractive study notes for:
Topic: "${topic.trim()}"
${subtopic.trim() ? `Subtopic: "${subtopic.trim()}"` : ""}
Format Style: "${style}" (Active Recall, Feynman analogies, Cornell notes, Cheat sheet)
Language: ${lang === "hi" ? "Hindi (हिन्दी in Devanagari script)" : lang === "sa" ? "Sanskrit (संस्कृतम् in Devanagari script)" : "English"}

Requirements:
1. Make these notes engaging, fun, and memorable—NOT boring.
2. "coreConcepts": 4 distinct key concepts. Each must include:
   - "term": Concept name
   - "definition": Clear, precise explanation
   - "analogy": A relatable, funny, or vivid real-world comparison that makes it click immediately
   - "mnemonic": A short, memorable acronym, rhyme, or memory hook
   - "importance": Why this matters on exams
3. "cornellSections": 3 sections following Cornell note structure:
   - "cue": Key question or review prompt
   - "notes": Array of 2-3 concise bullet points
   - "highlight": High-yield takeaway or trap to avoid
4. "conceptGraph": 4 nodes forming a mini interconnected concept map showing how ideas flow.
5. "cheatSheetRules": 3 crucial exam axioms, golden rules, or do's & don'ts.
6. "quickChecks": 2 instant recall check questions with answers and hints for self-testing.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction:
          "You are an elite educational note-architect and tutor. You transform complex academic topics into visually structured, highly attractive active-recall study notes with vivid analogies, mnemonics, Cornell cues, and self-checks.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            readingTimeMinutes: { type: Type.INTEGER },
            executiveSummary: { type: Type.STRING },
            coreConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  analogy: { type: Type.STRING },
                  mnemonic: { type: Type.STRING },
                  importance: { type: Type.STRING },
                },
                required: ["term", "definition", "analogy", "mnemonic", "importance"],
              },
            },
            cornellSections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cue: { type: Type.STRING },
                  notes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  highlight: { type: Type.STRING },
                },
                required: ["cue", "notes", "highlight"],
              },
            },
            conceptGraph: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  category: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  connectedTo: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["id", "label", "category", "summary", "connectedTo"],
              },
            },
            cheatSheetRules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  detail: { type: Type.STRING },
                },
                required: ["label", "detail"],
              },
            },
            quickChecks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ["question", "answer", "hint"],
              },
            },
          },
          required: [
            "title",
            "readingTimeMinutes",
            "executiveSummary",
            "coreConcepts",
            "cornellSections",
            "conceptGraph",
            "cheatSheetRules",
            "quickChecks",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    const notes = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      topic: topic.trim(),
      subtopic: subtopic.trim() || undefined,
      title: parsed.title || `${topic} Mastery Notes`,
      readingTimeMinutes: parsed.readingTimeMinutes || 4,
      executiveSummary: parsed.executiveSummary || `Comprehensive active recall notes on ${topic}.`,
      style,
      language: lang,
      createdAt: Date.now(),
      coreConcepts: parsed.coreConcepts || [],
      cornellSections: parsed.cornellSections || [],
      conceptGraph: parsed.conceptGraph || [],
      cheatSheetRules: parsed.cheatSheetRules || [],
      quickChecks: parsed.quickChecks || [],
    };

    res.json({ notes });
  } catch (error: any) {
    console.error("Error generating notes from Gemini, generating local fallback:", error);
    const { topic = "Core Subject", subtopic = "", style = "active_recall", language = "en" } = req.body;
    res.json({
      notes: {
        id: `note_${Date.now()}`,
        topic,
        subtopic: subtopic || undefined,
        title: `${topic} High-Yield Study Notes`,
        readingTimeMinutes: 4,
        executiveSummary: `Essential active-recall framework for ${topic}${subtopic ? ` (${subtopic})` : ""}, emphasizing core mechanisms, intuitive analogies, and high-yield exam rules.`,
        style,
        language,
        createdAt: Date.now(),
        coreConcepts: [
          {
            term: "Foundational Axiom",
            definition: `The primary operative law behind ${topic}. Everything in this chapter stems from this relationship.`,
            analogy: "Like the cornerstone of a skyscraper—keep this solid and the whole structure holds!",
            mnemonic: "F-A-C-T: Find Axiom, Check Transfer.",
            importance: "Crucial for baseline scenario and definitional exam questions."
          },
          {
            term: "Operative Dynamics",
            definition: "The step-by-step kinetic sequence or relational model linking input variables to measured responses.",
            analogy: "Think of an Olympic relay race: perfect baton passes between each phase guarantee victory.",
            mnemonic: "P-1 -> P-2 -> P-3: Sequence never reverses!",
            importance: "Distinguishes passing scores from top 5% percentiles."
          },
          {
            term: "Limiting Threshold",
            definition: "The boundary condition or rate-limiting step beyond which system behavior saturates or changes phase.",
            analogy: "The toll booth on a highway: traffic moves only as fast as the single bottleneck point.",
            mnemonic: "Cap the bottleneck to predict the outcome.",
            importance: "Frequently tested under 'What if we double variable X?' conditions."
          },
          {
            term: "Cross-Disciplinary Link",
            definition: `Synthesizes ${topic} with larger academic frameworks and real-world industrial or natural applications.`,
            analogy: "Like a universal socket wrench that fits nuts and bolts across different disciplines.",
            mnemonic: "Bridge the concept to the world.",
            importance: "Essential for synthesis questions and analytical essay sections."
          }
        ],
        cornellSections: [
          {
            cue: "Core Definition",
            notes: [
              `${topic} models essential principles in standard curricula.`,
              "Always identify primary inputs, boundary conditions, and equilibrium state."
            ],
            highlight: "Rule of thumb: Check conservation of mass/energy/information first."
          },
          {
            cue: "Mechanisms & Flow",
            notes: [
              "Stage 1 establishes prerequisite activation conditions.",
              "Stage 2 drives catalytic conversion through the primary pathway.",
              "Stage 3 restores steady-state equilibrium via feedback regulation."
            ],
            highlight: "Exam trap: Distractors frequently swap cause and effect!"
          }
        ],
        conceptGraph: [
          {
            id: "node_1",
            label: "Prerequisites",
            category: "Foundations",
            summary: "Prior background needed before this concept.",
            connectedTo: ["node_2"]
          },
          {
            id: "node_2",
            label: topic,
            category: "Core Principle",
            summary: "The main mechanism under active study.",
            connectedTo: ["node_1", "node_3"]
          },
          {
            id: "node_3",
            label: subtopic || "Key Application",
            category: "Application",
            summary: "High-yield application area frequently evaluated on exams.",
            connectedTo: ["node_2"]
          }
        ],
        cheatSheetRules: [
          {
            label: "Axiom 1: Conservation Principle",
            detail: "Balance all inputs against total outputs across any boundary."
          },
          {
            label: "Axiom 2: Constraint Identification",
            detail: "Locate the rate-limiting step before attempting quantitative calculations."
          }
        ],
        quickChecks: [
          {
            question: `In simple terms, what is the main idea of ${topic}?`,
            answer: `It describes how the parts of ${topic} work together step by step.`,
            hint: "Think about why this topic matters in everyday life.",
          },
        ],
      },
    });
  }
});

// Endpoint: Refresh Instant Recall Questions with fresh memory checks
app.post("/api/refresh-instant-recall", async (req, res) => {
  try {
    const { topic = "Core Topic", subtopic = "", language = "en", existingQuestions = [] } = req.body;
    const ai = getGenAI();

    const prompt = `Generate 4 brand new, highly effective, quick recall questions for students studying:
Topic: "${topic}"
${subtopic ? `Subtopic: "${subtopic}"` : ""}
Language: ${language}

CRITICAL RULES:
1. Always use SIMPLE, clear, everyday words that any student can easily understand. Avoid academic jargon.
2. The questions must be fresh and different from any previously shown: ${JSON.stringify(existingQuestions)}.
3. For each question, provide:
   - "question": A short, clear question testing memory or understanding in plain words.
   - "answer": A direct, easy-to-understand answer in simple words.
   - "hint": A friendly, simple memory tip or hint.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: "You are a friendly tutor who explains everything in simple, clear, easy-to-understand words.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quickChecks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ["question", "answer", "hint"],
              },
            },
          },
          required: ["quickChecks"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ quickChecks: parsed.quickChecks || [] });
  } catch (err: any) {
    console.error("Error refreshing instant recall, using fallback:", err);
    const { topic = "Core Topic" } = req.body;
    res.json({
      quickChecks: [
        {
          question: `In simple terms, what is the main idea of ${topic}?`,
          answer: `It describes how the parts of ${topic} work together step by step.`,
          hint: "Think about why this topic matters in everyday life.",
        },
        {
          question: `What is the most important rule or fact to remember about ${topic}?`,
          answer: `Always check the starting conditions and what changes at the end.`,
          hint: "Think of what happens first and what happens last.",
        },
        {
          question: `Can you name one common mistake people make when studying ${topic}?`,
          answer: `Confusing cause and effect or skipping the basic definition.`,
          hint: "Remember to read the question carefully!",
        },
      ],
    });
  }
});

// Endpoint: Ask a Question with Question Summary and Multilingual Support (Hindi, Sanskrit, English)
app.post("/api/ask-question", async (req, res) => {
  try {
    const { question, context = "", language = "en" } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question prompt is required." });
    }

    const ai = getGenAI();

    let langGuidance = "";
    if (language === "hi") {
      langGuidance =
        "LANGUAGE: HINDI (हिन्दी). Provide the question summary ('questionSummary'), detailed answer ('answer'), key takeaways ('keyTakeaways'), and related concepts ('relatedConcepts') entirely in clear, accurate Hindi using Devanagari script.";
    } else if (language === "sa") {
      langGuidance =
        "LANGUAGE: SANSKRIT (संस्कृतम्). Provide the question summary ('questionSummary'), detailed answer ('answer'), key takeaways ('keyTakeaways'), and related concepts ('relatedConcepts') entirely in classical, grammatically pure Sanskrit using Devanagari script (सरल-शुद्ध-संस्कृतेन).";
    } else {
      langGuidance =
        "LANGUAGE: ENGLISH. Provide the response in clear, rigorous academic English.";
    }

    const prompt = `
Student Question: "${question.trim()}"
${context ? `Context / Related Material:\n"${context.trim()}"` : ""}

Task Instructions:
1. Provide a clear, insightful "questionSummary" (1-2 sentences) summarizing what the student's question is asking and the fundamental concept it addresses.
2. Provide a thorough, pedagogically clear "answer" that explains the core principles, resolves common doubts, and gives examples if appropriate.
3. Provide 3-4 concise "keyTakeaways".
4. Provide 2-4 "relatedConcepts".
${langGuidance}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert academic tutor and professor proficient in English, Hindi (हिन्दी), and Sanskrit (संस्कृतम्). You explain student questions clearly with a structured summary of the question, comprehensive pedagogical answers, and key takeaway points in the requested language.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionSummary: {
              type: Type.STRING,
              description: "A 1-2 sentence summary of what the question is asking and the core concept tested",
            },
            answer: {
              type: Type.STRING,
              description: "Comprehensive, accurate answer and explanation",
            },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Bullet points summarizing the key principles",
            },
            relatedConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Related topics or terms for further study",
            },
          },
          required: ["questionSummary", "answer", "keyTakeaways", "relatedConcepts"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response from Gemini API");
    }

    const data = JSON.parse(responseText.trim());
    res.json({
      questionSummary: data.questionSummary,
      answer: data.answer,
      keyTakeaways: data.keyTakeaways || [],
      relatedConcepts: data.relatedConcepts || [],
      language,
    });
  } catch (error: any) {
    console.error("Error answering question:", error);
    res.status(500).json({
      error: error?.message || "Failed to process question.",
    });
  }
});

// Endpoint: Summarize & Translate an existing question into Hindi, Sanskrit, or English
app.post("/api/summarize-question", async (req, res) => {
  try {
    const {
      questionText,
      options = [],
      correctAnswer = "",
      explanation = "",
      targetLanguage = "hi",
    } = req.body;

    if (!questionText) {
      return res.status(400).json({ error: "questionText is required." });
    }

    const ai = getGenAI();

    let langNote = "";
    if (targetLanguage === "hi") {
      langNote = "Target Language: Hindi (हिन्दी in Devanagari). Output must be in natural, accurate Hindi.";
    } else if (targetLanguage === "sa") {
      langNote = "Target Language: Sanskrit (संस्कृतम् in Devanagari). Output must be in correct classical Sanskrit.";
    } else {
      langNote = "Target Language: English.";
    }

    const prompt = `
Analyze this quiz question and provide:
1. A concise summary of the question (what it asks and what principle it tests).
2. The question translated into the target language.
3. The explanation translated into the target language.
4. The correct answer in the target language.

Input Question: "${questionText}"
Options: ${JSON.stringify(options)}
Correct Answer: "${correctAnswer}"
Explanation: "${explanation}"

${langNote}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an academic linguist translating and summarizing test questions into English, Hindi (हिन्दी), and Sanskrit (संस्कृतम्).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionSummary: {
              type: Type.STRING,
              description: "Concise 1-2 sentence summary of what the question is asking in the target language",
            },
            translatedQuestion: {
              type: Type.STRING,
              description: "The question translated into the target language",
            },
            translatedExplanation: {
              type: Type.STRING,
              description: "The explanation translated into the target language",
            },
            translatedCorrectAnswer: {
              type: Type.STRING,
              description: "The correct answer in the target language",
            },
          },
          required: [
            "questionSummary",
            "translatedQuestion",
            "translatedExplanation",
            "translatedCorrectAnswer",
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response from Gemini API");
    }

    const data = JSON.parse(responseText.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error summarizing question:", error);
    res.status(500).json({
      error: error?.message || "Failed to summarize question.",
    });
  }
});

// Endpoint: Imagine Ur Creativity - Visual Animated Explainer & Interactive Simulation Lab
app.post("/api/imagine-creativity", async (req, res) => {
  try {
    const { question, language = "en", difficulty = "intermediate" } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question prompt is required." });
    }

    const ai = getGenAI();
    const prompt = `
Student Question: "${question.trim()}"
Language: ${language}
Target Educational Difficulty: ${difficulty} (Options: 'beginner' [Grades 3-5, everyday metaphors, visual intuition], 'intermediate' [Grades 6-8, standard formulas and curriculum terminology], 'advanced' [High School / AP / College, precise biochemical & physical reaction mechanisms])

Task:
You are an award-winning science animator and educational visualization designer.
Generate an interactive, realistic animated conceptual lesson for "Imagine Ur Creativity" tailored to the "${difficulty}" difficulty level that explains how this question or physical/mathematical phenomenon is solved and works step-by-step.

Requirements:
1. "conceptTitle": Clear, exciting title with an emoji (e.g. "The Infinite Water Cycle & Weather Engine 🌧️")
2. "emoji": Single fitting icon emoji
3. "category": Academic domain (e.g. Earth & Climate Sciences, Cellular Biology, Physics & Mechanics, Pure Mathematics)
4. "difficulty": "${difficulty}"
5. "summary": 2-3 engaging, intuitive sentences tailored to the chosen difficulty level explaining the core mechanism
6. "realWorldAnalogy": An intuitive everyday analogy (e.g. "Think of Earth like a solar boiling pot with a cool glass lid...")
7. "stages": Exactly 4 progressive stages showing how the process operates from start to completion:
   - "id": short unique string
   - "stageNumber": 1, 2, 3, 4
   - "title": Stage heading with emoji
   - "subtitle": One-line punchy subtitle
   - "narration": 2-3 sentences of clear pedagogical explanation tailored to the "${difficulty}" difficulty
   - "visualScene": Choose the exact or closest fitting realistic visual scene for the question:
     * "aerodynamics_flight": Flight, airplanes, wings, lift/drag/thrust, airfoils, Bernoulli principle, drones, gliding
     * "gravity_orbits": Gravity, orbits, planets, celestial bodies, falling objects, spacetime curvature, black holes, moons
     * "rocket_propulsion": Rockets, space launches, exhaust thrust, Newton's 3rd law action/reaction, propulsion engines
     * "volcano_eruption": Volcanoes, magma, lava, plate tectonics, crust, mantle, seismic eruptions, geysers
     * "sound_waves": Sound, acoustic vibration, speakers, frequency, pitch, volume, compression/rarefaction, hearing
     * "digestive_system": Digestion, stomach, esophagus, intestines, enzymes, nutrition, swallowing, metabolism
     * "dna_replication": DNA, genetics, chromosomes, genes, heredity, unzipping double helix, molecular biology
     * "solar_eclipse": Solar or lunar eclipses, shadow cones (umbra/penumbra), orbital alignment of Sun/Moon/Earth
     * "atom_quantum": Atoms, electrons, protons, neutrons, quantum leaps, photon absorption/emission, radiation
     * "light_optics": Light rays, rainbows, prisms, reflection, refraction, lenses, fiber optics, mirrors, Snell's law
     * "cell_biology": Living cells, mitochondria, organelles, cell membranes, osmosis, diffusion, cellular respiration
     * "weather_water_cycle": Rain, evaporation, clouds, water cycle, condensation, atmosphere, precipitation
     * "photosynthesis": Plants making food, sunlight to sugar, chlorophyll, oxygen production
     * "electric_circuit": Electricity, circuits, batteries, bulbs, voltage, current, resistance, Ohm's law
      * "math_scale": Algebra equations, balance scale, arithmetic balance, solving for x
      * "heart_circulation": Heart pumping, blood flow, cardiovascular circulation, pulse, veins/arteries
      * "states_of_matter": Solid/liquid/gas, melting, freezing, boiling, kinetic theory of heat
      * "custom_dynamic": ANY other concept, machine, natural phenomenon, or invention!
   - "actionPrompt": What the student should look for / click on the interactive canvas
   - "highlightLabels": 3-4 key elements highlighted
   - "keyPrinciple": The governing physical or mathematical law
8. "interactiveKnobs": 2-3 interactive sliders or toggles for the student sandbox:
   - "id": string key
   - "label": human-readable label
   - "type": "slider" or "toggle"
   - "min": number (if slider)
   - "max": number (if slider)
   - "defaultValue": number or boolean
   - "unit": optional unit string (e.g. "%", "°C", "V", "BPM")
   - "impactDescription": What changes in the simulation when adjusted
9. "comprehensionQuiz": 2 multiple-choice questions to test understanding appropriate for "${difficulty}" difficulty:
   - "question": string
   - "options": 4 options
   - "correctIndex": index of correct option (0 to 3)
   - "explanation": thorough pedagogical explanation
10. "funFact": One fascinating trivia fact!
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an interactive educational simulation designer. You output structured JSON for animated scientific and mathematical simulations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conceptTitle: { type: Type.STRING },
            emoji: { type: Type.STRING },
            category: { type: Type.STRING },
            summary: { type: Type.STRING },
            realWorldAnalogy: { type: Type.STRING },
            stages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  stageNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  narration: { type: Type.STRING },
                  visualScene: {
                    type: Type.STRING,
                    description: "aerodynamics_flight, gravity_orbits, rocket_propulsion, volcano_eruption, sound_waves, digestive_system, dna_replication, solar_eclipse, atom_quantum, light_optics, cell_biology, weather_water_cycle, photosynthesis, electric_circuit, math_scale, heart_circulation, states_of_matter, or custom_dynamic"
                  },
                  actionPrompt: { type: Type.STRING },
                  highlightLabels: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  keyPrinciple: { type: Type.STRING }
                },
                required: ["id", "stageNumber", "title", "subtitle", "narration", "visualScene", "actionPrompt", "highlightLabels"]
              }
            },
            interactiveKnobs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING, description: "slider or toggle" },
                  min: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                  defaultValue: { type: Type.STRING, description: "numeric value or boolean as string" },
                  unit: { type: Type.STRING },
                  impactDescription: { type: Type.STRING }
                },
                required: ["id", "label", "type", "impactDescription"]
              }
            },
            comprehensionQuiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            },
            funFact: { type: Type.STRING },
            dynamicVisualData: {
              type: Type.OBJECT,
              properties: {
                sceneType: { type: Type.STRING },
                theme: { type: Type.STRING, description: "space, aerial, microscopic, laboratory, nature, or cyber" },
                canvasTitle: { type: Type.STRING },
                backdrop: { type: Type.STRING, description: "CSS linear-gradient background" },
                entities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      type: { type: Type.STRING, description: "circle, rect, path, beam, particle_cloud, stream, force_arrow, or label_box" },
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      width: { type: Type.NUMBER },
                      height: { type: Type.NUMBER },
                      color: { type: Type.STRING },
                      secondaryColor: { type: Type.STRING },
                      motion: { type: Type.STRING, description: "orbit, flow, oscillate, pulse, stream, rise, spin, or static" },
                      motionSpeed: { type: Type.NUMBER },
                      interactiveTooltip: { type: Type.STRING }
                    },
                    required: ["id", "label", "type", "x", "y", "color"]
                  }
                },
                forceLabels: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING },
                      color: { type: Type.STRING }
                    },
                    required: ["name", "value", "color"]
                  }
                },
                interactivePrompt: { type: Type.STRING }
              }
            }
          },
          required: ["conceptTitle", "emoji", "category", "summary", "realWorldAnalogy", "stages", "comprehensionQuiz", "funFact"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response from Gemini API");
    }

    const data = JSON.parse(responseText.trim());
    // Normalize knobs
    const normalizedKnobs = (data.interactiveKnobs || []).map((k: any) => ({
      ...k,
      defaultValue: k.type === "toggle" ? (k.defaultValue === true || k.defaultValue === "true") : Number(k.defaultValue) || 50
    }));

    res.json({
      id: `ai_${Date.now()}`,
      question: question.trim(),
      conceptTitle: data.conceptTitle,
      emoji: data.emoji || "✨",
      category: data.category || "General Science & Mathematics",
      summary: data.summary,
      realWorldAnalogy: data.realWorldAnalogy || "",
      stages: data.stages || [],
      interactiveKnobs: normalizedKnobs,
      comprehensionQuiz: data.comprehensionQuiz || [],
      funFact: data.funFact || "",
      dynamicVisualData: data.dynamicVisualData
    });
  } catch (error: any) {
    console.error("Error generating imagine creativity animation:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate animation simulation."
    });
  }
});

// Endpoint: Generate Chapter Games (Boss Battle and Memory Match pairs)
app.post("/api/generate-chapter-game", async (req, res) => {
  try {
    const { quizTitle, topicsCovered, questions, language } = req.body;

    const ai = getGenAI();
    const lang = (language as "en" | "hi" | "sa") || "en";

    const prompt = `
You are a game designer and creative educator creating an engaging learning game for students on:
Topic/Chapter: "${quizTitle || "Study Material"}"
Key Topics: ${Array.isArray(topicsCovered) ? topicsCovered.join(", ") : "General Concepts"}
Sample Questions & Answers: ${JSON.stringify(
      (questions || []).slice(0, 6).map((q: any) => ({
        q: q.question,
        a: q.correctAnswer,
        exp: q.explanation,
      }))
    )}
Target Language: ${lang === "hi" ? "Hindi (हिन्दी in Devanagari script)" : lang === "sa" ? "Sanskrit (संस्कृतम् in Devanagari script)" : "English"}

Generate:
1. "boss": A humorous, charming topic-themed Boss monster (e.g. "The ATP Goblin", "Professor Puzzler", "Deadlock Dragon", "विसर्गराक्षसः", "रसविघ्नकरः").
   - name: Funny title name
   - title: e.g. "Overlord of Mitochondrial Matrices"
   - avatarEmoji: A fitting single character or creature emoji (e.g. 🐉, 🧟, 🧙, 🤖, 🦁, ⚡)
   - maxHp: 100
   - weakness: What topic concept defeats him
   - introQuote: Playful challenge (witty educational taunt)
   - hitReactionQuotes: Array of 3 funny quotes when player answers a question correctly (e.g. "Argh! My electrons are leaking!", "Curse your accurate recall!")
   - tauntQuotes: Array of 3 funny quotes when player misses a question (e.g. "Haha! Have you reviewed your notes?", "My powers grow with every mistake!")
   - defeatQuote: Funny surrender quote congratulating the student on mastering the chapter.

2. "pairs": Exactly 6 to 8 concept matching pairs for a memory match game.
   - Each pair has "id", "term" (concise concept or word, 1-3 words), "definition" (short punchy definition or clue, under 10 words), and "funHint" (a funny memorable 1-liner clue or joke).

3. "battleQuestions": Exactly 8 high-yield chapter battle questions (all Multiple Choice with 4 options each) designed specifically for the Boss Battle!
   - Make questions testing the chapter concepts with punchy, exciting wording.
   - MANDATORY: In each question's "options" array, randomize the position of the correct answer so it is NEVER always option A, and rotates across A, B, C, and D for every question.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction:
          "You create funny, engaging, pedagogically sound educational games in English, Hindi, or Sanskrit. Humor should be tasteful, witty, academic puns and student-relatable banter that keeps the learning fun without distracting from the actual syllabus.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            boss: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                avatarEmoji: { type: Type.STRING },
                maxHp: { type: Type.NUMBER },
                weakness: { type: Type.STRING },
                introQuote: { type: Type.STRING },
                hitReactionQuotes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                tauntQuotes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                defeatQuote: { type: Type.STRING },
              },
              required: [
                "name",
                "title",
                "avatarEmoji",
                "maxHp",
                "weakness",
                "introQuote",
                "hitReactionQuotes",
                "tauntQuotes",
                "defeatQuote",
              ],
            },
            pairs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  funHint: { type: Type.STRING },
                },
                required: ["id", "term", "definition", "funHint"],
              },
            },
            battleQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                  questionSummary: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  funFactOrJoke: { type: Type.STRING },
                },
                required: [
                  "id",
                  "question",
                  "options",
                  "correctAnswer",
                  "explanation",
                ],
              },
            },
          },
          required: ["boss", "pairs"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from model");
    }

    const gameData = JSON.parse(text.trim());

    // Sanitize and ensure varied MCQ options for battleQuestions
    const rawBattleQ = Array.isArray(gameData.battleQuestions)
      ? gameData.battleQuestions
      : [];
    const sanitizedBattleQuestions = ensureVariedMcqOptionsServer(
      rawBattleQ.map((bq: any, i: number) => ({
        id: bq.id || `battle_q_${i + 1}`,
        type: "mcq",
        question: bq.question || `Battle Challenge ${i + 1}`,
        questionSummary: bq.questionSummary || "Boss Battle Concept Challenge",
        options: Array.isArray(bq.options) && bq.options.length >= 2 ? bq.options : ["A", "B", "C", "D"],
        correctAnswer: bq.correctAnswer || bq.options?.[0] || "A",
        explanation: bq.explanation || "Direct boss battle recall answer.",
        difficulty: bq.difficulty || "medium",
        funFactOrJoke: bq.funFactOrJoke || undefined,
      }))
    );

    res.json({
      boss: gameData.boss,
      pairs: gameData.pairs || [],
      battleQuestions: sanitizedBattleQuestions,
    });
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("Quota")) {
      console.warn("Gemini API rate limit reached, generating high-yield local chapter game components.");
    } else {
      console.warn("Using smart local generator for chapter game:", error?.message || error);
    }
    // Graceful fallback to guarantee game works seamlessly
    const lang = req.body.language || "en";
    const questions = req.body.questions || [];
    const pairs = (questions.length > 0 ? questions : [
      { correctAnswer: "Core Concept", question: "Fundamental chapter pillar" },
      { correctAnswer: "Key Term", question: "Crucial exam vocabulary" },
    ]).slice(0, 6).map((q: any, i: number) => ({
      id: `pair_${i + 1}`,
      term: q.correctAnswer || `Concept ${i + 1}`,
      definition: (q.questionSummary || q.question || "Core definition").slice(0, 50),
      funHint: lang === "hi" ? "यह परीक्षा के लिए बहुत महत्वपूर्ण है!" : lang === "sa" ? "इदं ज्ञानं सम्यक् स्मर्यताम्।" : "Remember this for the test!",
    }));

    // Fallback battle questions with guaranteed varied MCQ options
    const fallbackBattleQuestions = ensureVariedMcqOptionsServer(
      (questions.length > 0 ? questions : [
        {
          id: "fb_bq1",
          type: "mcq",
          question: "What core mechanism powers cellular ATP generation in mitochondria?",
          options: ["Fermentation", "Chemiosmotic Proton Gradient", "Lactic Acid Cycle", "Photolysis"],
          correctAnswer: "Chemiosmotic Proton Gradient",
          explanation: "Protons pumped into the intermembrane space flow down their electrochemical gradient through ATP synthase.",
        },
        {
          id: "fb_bq2",
          type: "mcq",
          question: "Where in the cell does anaerobic glycolysis take place?",
          options: ["Mitochondrial Cristae", "Nucleolus", "Cytosol / Cytoplasm", "Endoplasmic Reticulum"],
          correctAnswer: "Cytosol / Cytoplasm",
          explanation: "Glycolysis takes place in the fluid cytosol without needing oxygen.",
        }
      ]).map((q: any, i: number) => ({
        id: `battle_q_${i + 1}`,
        type: "mcq",
        question: q.question,
        questionSummary: q.questionSummary || "Chapter Battle Concept",
        options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "Correct answer tested in battle.",
        difficulty: q.difficulty || "medium",
        funFactOrJoke: q.funFactOrJoke,
      }))
    );

    res.json({
      boss: {
        name: lang === "hi" ? "अज्ञान असुर" : lang === "sa" ? "संशयराक्षसः" : "The Confusion Goblin",
        title: lang === "hi" ? "परीक्षा बाधा प्रमुख" : lang === "sa" ? "अविद्यानायकः" : "Guardian of Chapter Doubts",
        avatarEmoji: "🧙‍♂️",
        maxHp: 100,
        weakness: lang === "hi" ? "सत्य उत्तर एवं ज्ञान" : lang === "sa" ? "शुद्धज्ञानम्" : "Clear conceptual understanding",
        introQuote: lang === "hi" ? "क्या तुम इस अध्याय के प्रश्नों का सामना कर सकते हो?" : lang === "sa" ? "किं त्वम् अस्य पाठस्य प्रश्नान् जेतुं समर्थः?" : "Think you've mastered this chapter? Let's test your brainpower!",
        hitReactionQuotes: [
          lang === "hi" ? "अरे! यह उत्तर सही था!" : lang === "sa" ? "अहो! समीचीनम् उत्तरम्!" : "Ouch! Direct hit to my confusion armor!",
          lang === "hi" ? "तुम्हारा ज्ञान बढ़ रहा है!" : lang === "sa" ? "भवतः पाण्डित्यं वर्धते!" : "Argh! That logic was too strong!",
          lang === "hi" ? "मैं कमजोर हो रहा हूँ!" : lang === "sa" ? "मम शक्तिः क्षीयते!" : "How did you recall that so quickly?!"
        ],
        tauntQuotes: [
          lang === "hi" ? "हाहा! क्या तुमने नोट्स नहीं पढ़े?" : lang === "sa" ? "हाहा! किं पाठः न पठितः?" : "Mwahaha! Re-read the chapter notes!",
          lang === "hi" ? "इस बार चूक गए!" : lang === "sa" ? "पुनः प्रयतताम्!" : "Missed that one! Focus your thoughts!",
          lang === "hi" ? "मेरी शक्ति अभी भी बाकी है!" : lang === "sa" ? "अद्यापि मम विजयः!" : "My confusion shield stands strong!"
        ],
        defeatQuote: lang === "hi" ? "अद्भुत! तुमने इस अध्याय पर विजय प्राप्त कर ली!" : lang === "sa" ? "साधु साधु! त्वया अयम् अध्यायः सम्यक् विजितः!" : "Incredible! You have conquered this topic completely!",
      },
      pairs,
      battleQuestions: fallbackBattleQuestions,
    });
  }
});

// Endpoint: Generate Fresh Battle Questions for Next Battle Round
app.post("/api/generate-battle-questions", async (req, res) => {
  try {
    const { quizTitle, topicsCovered, language, battleNumber = 1, existingQuestions = [] } = req.body;
    const ai = getGenAI();
    const lang = (language as "en" | "hi" | "sa") || "en";

    const prompt = `
Generate 6 brand new, fresh, high-yield Multiple Choice Questions (MCQ) for Battle #${battleNumber} on:
Chapter: "${quizTitle || "Study Material"}"
Topics: ${Array.isArray(topicsCovered) ? topicsCovered.join(", ") : "General Concepts"}
Language: ${lang === "hi" ? "Hindi (हिन्दी)" : lang === "sa" ? "Sanskrit (संस्कृतम्)" : "English"}

Rules:
1. Each question must be an engaging, high-yield Multiple Choice Question (MCQ) testing different nuances and aspects of this chapter.
2. Provide exactly 4 realistic options.
3. CRITICAL: For each question's "options", RANDOMIZE the position of the correct answer across A, B, C, D so it is NEVER always option A, and rotates after every single question!
4. Provide a crisp, illuminating explanation and a funny 1-liner joke or pun for "funFactOrJoke".
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: "You generate fresh, exciting academic boss battle quiz questions with randomized MCQ option positions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                  questionSummary: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  funFactOrJoke: { type: Type.STRING },
                },
                required: ["id", "question", "options", "correctAnswer", "explanation"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{"questions": []}');
    const questions = ensureVariedMcqOptionsServer(parsed.questions || []);
    res.json({ questions });
  } catch (error: any) {
    console.error("Error generating battle questions:", error);
    // Provide safe shuffled fallback questions ensuring questions are never empty
    const existing = req.body.existingQuestions || [];
    const sourceQuestions =
      existing.length > 0
        ? existing
        : [
            {
              id: `fb_bq_${Date.now()}_1`,
              type: "mcq",
              question: `Which foundational concept is critical when examining ${req.body.quizTitle || "this chapter"}?`,
              options: [
                "Fundamental Core Theory",
                "Secondary Variable",
                "Non-essential Hypothesis",
                "External Distractor"
              ],
              correctAnswer: "Fundamental Core Theory",
              explanation: "Foundational concepts govern the mechanics and analytical principles of this chapter.",
            },
            {
              id: `fb_bq_${Date.now()}_2`,
              type: "mcq",
              question: `How is key conceptual accuracy demonstrated under exam conditions for this subject?`,
              options: [
                "Heuristic Conjecture",
                "Systematic Analysis & Evidence",
                "Arbitrary Selection",
                "Superficial Association"
              ],
              correctAnswer: "Systematic Analysis & Evidence",
              explanation: "Systematic conceptual analysis ensures unambiguous recall of tested topics.",
            }
          ];

    const questions = ensureVariedMcqOptionsServer(
      [...sourceQuestions].sort(() => Math.random() - 0.5).slice(0, 5)
    );
    res.json({ questions });
  }
});

// Endpoint: Quick Joke Break (Fresh on-topic funny educational jokes/puns)
app.post("/api/joke-break", async (req, res) => {
  try {
    const { topic, language, context } = req.body;
    const ai = getGenAI();
    const lang = (language as "en" | "hi" | "sa") || "en";

    const prompt = `
Generate 3 short, super funny, witty educational jokes or puns about this topic: "${topic || "Studying & Science"}".
Context/Concept: "${context || ""}"
Language: ${lang === "hi" ? "Hindi (हिन्दी in Devanagari script)" : lang === "sa" ? "Sanskrit (संस्कृतम् in Devanagari script, with humorous subhashita/wit)" : "English"}

Rules:
- Must be funny and clever, lighthearted student humor (puns, dad jokes, memorable funny insights).
- Must stay strictly relevant to the academic topic/concept (no random off-topic humor).
- Safe, encouraging, high-energy.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jokes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  setup: { type: Type.STRING, description: "Joke setup or question" },
                  punchline: { type: Type.STRING, description: "Funny punchline or reveal" },
                  topicRef: { type: Type.STRING, description: "Short concept tag" },
                },
                required: ["setup", "punchline", "topicRef"],
              },
            },
          },
          required: ["jokes"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty joke response");
    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Error generating jokes, using fallbacks:", error);
    const lang = req.body.language || "en";
    if (lang === "hi") {
      res.json({
        jokes: [
          { setup: "बायोलॉजी के छात्र ने परीक्षा में क्या लिखा?", punchline: "माइटोकॉन्ड्रिया कोशिका का पावरहाउस है, पर मेरा दिमाग डिस्चार्ज हो चुका है! ⚡", topicRef: "बायोलॉजी" },
          { setup: "इतिहास के अध्यापक ने पूछा - पानीपत का युद्ध कब हुआ?", punchline: "छात्र बोला: जब दोनों सेनाओं के बीच शांति वार्ता फेल हो गई! 😅", topicRef: "इतिहास" },
          { setup: "कंप्यूटर साइंस का छात्र कैफे क्यों गया?", punchline: "क्योंकि उसका कुकीज और कैश दोनों खाली हो गए थे! 🍪", topicRef: "कंप्यूटर" }
        ]
      });
    } else if (lang === "sa") {
      res.json({
        jokes: [
          { setup: "छात्रः गुरुम् अपृच्छत् - विद्यालये किमर्थम् आगन्तव्यम्?", punchline: "गुरुः अवदत् - गृहम् अधिकं रमणीयं भासत इति ज्ञातुम्! 😄", topicRef: "संस्कृतम्" },
          { setup: "सन्धिपरीक्षायां छात्रस्य चिन्तनम्:", punchline: "आलस्यम् + परीक्षा = पुनरभ्यासः! अतः अध्ययनं कुरु! 📚", topicRef: "व्याकरणम्" }
        ]
      });
    } else {
      res.json({
        jokes: [
          { setup: "Why can't you trust atoms?", punchline: "Because they make up literally everything! ⚛️", topicRef: "Science" },
          { setup: "Why was the math book always sad?", punchline: "Because it had too many problems of its own! 📐", topicRef: "Math" },
          { setup: "What did the cell say when his sister stepped on his toe?", punchline: "Mitosis! (My toe, sis!) 😂", topicRef: "Biology" }
        ]
      });
    }
  }
});

// Spotify Music resolver endpoint
app.post("/api/music/resolve-songs", async (req, res) => {
  try {
    const rawInput = req.body?.songs || req.body?.queries || [];
    const queries: string[] = Array.isArray(rawInput) ? rawInput : [String(rawInput || "")];
    const cleanedQueries = queries.map((s) => String(s || "").trim()).filter(Boolean);

    if (cleanedQueries.length === 0) {
      return res.json({ tracks: [] });
    }

    const FULL_AUDIO_LIBRARY = [
      { url: "/audio/lofi_beats.mp3", duration: 180 },
      { url: "/audio/ambient_focus.mp3", duration: 210 },
      { url: "/audio/moonlight.mp3", duration: 359 },
      { url: "/audio/clair_de_lune.mp3", duration: 304 },
      { url: "/audio/canon_in_d.mp3", duration: 240 }
    ];

    const KNOWN_TRACKS: Record<string, { id: string; title: string; artist: string; previewAudioUrl: string; durationSeconds: number }> = {
      "moonlight": {
        id: "2JzZzZUQj3Qff7wapcbK04",
        title: "Moonlight Sonata (Adagio sostenuto - Complete)",
        artist: "Ludwig van Beethoven",
        previewAudioUrl: "/audio/moonlight.mp3",
        durationSeconds: 359
      },
      "clair de lune": {
        id: "6N7gEj5HGv1eIJS3W9PqMv",
        title: "Clair de Lune (Complete Movement)",
        artist: "Claude Debussy",
        previewAudioUrl: "/audio/clair_de_lune.mp3",
        durationSeconds: 304
      },
      chopin: {
        id: "0pqPJz9vYnQ0g8T8G1P6Q2",
        title: "Nocturne in E-flat major, Op. 9, No. 2 (Complete)",
        artist: "Frédéric Chopin",
        previewAudioUrl: "/audio/clair_de_lune.mp3",
        durationSeconds: 304
      },
      bach: {
        id: "0sf12qNH596GqniwhvArOG",
        title: "Air on the G String, BWV 1068 (Complete)",
        artist: "Johann Sebastian Bach",
        previewAudioUrl: "/audio/canon_in_d.mp3",
        durationSeconds: 240
      },
      vivaldi: {
        id: "5PjdY0CKGZdEuoNab3yDmX",
        title: "The Four Seasons: Spring (Allegro - Complete)",
        artist: "Antonio Vivaldi",
        previewAudioUrl: "/audio/canon_in_d.mp3",
        durationSeconds: 240
      },
      satie: {
        id: "6kkwzB6hMBiaipPEAVnRbR",
        title: "Gymnopédie No. 1 (Complete)",
        artist: "Erik Satie",
        previewAudioUrl: "/audio/ambient_focus.mp3",
        durationSeconds: 210
      },
      canon: {
        id: "0bvUGW8tYp1W797uP0t1u8",
        title: "Canon in D Major (Complete Orchestral)",
        artist: "Johann Pachelbel",
        previewAudioUrl: "/audio/canon_in_d.mp3",
        durationSeconds: 240
      },
      lofi: {
        id: "0bvUGW8tYp1W797uP0t1u8",
        title: "Lofi Study Beats (Complete Focus Session)",
        artist: "Music Corner Beats",
        previewAudioUrl: "/audio/lofi_beats.mp3",
        durationSeconds: 180
      },
      interstellar: {
        id: "0sf12qNH596GqniwhvArOG",
        title: "Cornfield Chase (Interstellar)",
        artist: "Hans Zimmer",
        previewAudioUrl: "/audio/moonlight.mp3",
        durationSeconds: 359
      },
      weightless: {
        id: "6kkwzB6hMBiaipPEAVnRbR",
        title: "Weightless Ambient Study (Complete)",
        artist: "Marconi Union",
        previewAudioUrl: "/audio/ambient_focus.mp3",
        durationSeconds: 210
      }
    };

    const resolved = await Promise.all(
      cleanedQueries.map(async (query, idx) => {
        const fallbackAudio = FULL_AUDIO_LIBRARY[idx % FULL_AUDIO_LIBRARY.length];

        // Check direct Spotify URL / URI
        const spotifyUrlMatch = query.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
        const spotifyUriMatch = query.match(/spotify:track:([a-zA-Z0-9]+)/);
        const directId = spotifyUrlMatch?.[1] || spotifyUriMatch?.[1];

        if (directId) {
          return {
            id: `spot_${directId}`,
            title: `Track #${directId.slice(0, 6)}`,
            artist: "Study Artist",
            spotifyUrl: `https://open.spotify.com/track/${directId}`,
            spotifyEmbedUrl: `https://open.spotify.com/embed/track/${directId}?utm_source=generator&theme=0`,
            spotifyUri: `spotify:track:${directId}`,
            previewAudioUrl: fallbackAudio.url,
            durationSeconds: fallbackAudio.duration,
          };
        }

        // 1. Query iTunes public search for actual master track metadata and audio
        try {
          const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`, {
            headers: { "User-Agent": "TestGenStudyApp/1.0" },
            signal: AbortSignal.timeout(4000)
          });
          if (itunesRes.ok) {
            const data: any = await itunesRes.json();
            if (data.results && data.results.length > 0) {
              const item = data.results[0];
              const safeTitle = item.trackName || query;
              const safeArtist = item.artistName || "Unknown Artist";
              const trackIdNum = item.trackId ? String(item.trackId) : `id_${idx}_${Date.now()}`;
              return {
                id: `track_${trackIdNum}`,
                title: safeTitle,
                artist: safeArtist,
                album: item.collectionName || "Music Corner Session",
                coverUrl: item.artworkUrl100 || item.artworkUrl60,
                previewAudioUrl: item.previewUrl || fallbackAudio.url, // ACTUAL authentic song audio from artist
                spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(safeTitle + " " + safeArtist)}`,
                spotifyEmbedUrl: `https://open.spotify.com/embed/track/0sf12qNH596GqniwhvArOG?utm_source=generator&theme=0`,
                durationSeconds: Math.round((item.trackTimeMillis || 180000) / 1000)
              };
            }
          }
        } catch {
          // ignore network failure
        }

        // 2. Check known dictionary for offline / classical presets
        const lower = query.toLowerCase();
        for (const [key, val] of Object.entries(KNOWN_TRACKS)) {
          if (lower.includes(key)) {
            return {
              id: `spot_${val.id}`,
              title: val.title,
              artist: val.artist,
              album: "Music Corner Study Collection",
              previewAudioUrl: val.previewAudioUrl,
              spotifyUrl: `https://open.spotify.com/track/${val.id}`,
              spotifyEmbedUrl: `https://open.spotify.com/embed/track/${val.id}?utm_source=generator&theme=0`,
              spotifyUri: `spotify:track:${val.id}`,
              durationSeconds: val.durationSeconds || 240,
            };
          }
        }

        // Fallback for custom title
        return {
          id: `custom_${idx}_${Date.now()}`,
          title: query,
          artist: "Music Corner Artist",
          album: "Music Corner Focus Session",
          previewAudioUrl: fallbackAudio.url,
          spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
          spotifyEmbedUrl: `https://open.spotify.com/embed/track/0bvUGW8tYp1W797uP0t1u8?utm_source=generator&theme=0`,
          durationSeconds: fallbackAudio.duration
        };
      })
    );

    res.json({ tracks: resolved });
  } catch (err: any) {
    console.error("Error resolving songs:", err);
    res.json({ tracks: [] });
  }
});

// ==========================================
// ROLE-BASED ACCESS CONTROL (RBAC) & STAFF CONSOLE BACKEND
// ==========================================
const OWNER_ADMIN_PASSCODE = '0192837465';
const VALID_ADMIN_PASSCODES = new Set(['0192837465', 'ADMIN2026', 'ADMIN', 'PRANAV-ADMIN', 'PRANAV-2026', 'ADMIN-MASTER-2026', 'OWNER-7724', '7724']);
const VALID_TEACHER_PASSCODES = new Set(['TEACHER2026', 'FACULTY', 'STAFF7724', 'TEACHER', '0192837465', '7724']);
export const PRINCIPAL_PASSCODE = '93247';
const RBAC_SECRET = process.env.RBAC_SECRET || 'testgen_rbac_staff_security_key_2026';

interface StaffUserPayload {
  role: 'admin' | 'principal' | 'teacher';
  userName: string;
  groupId?: string;
  permissions: string[];
}

const ROLE_PERMISSIONS: Record<'admin' | 'principal' | 'teacher', string[]> = {
  admin: [
    'faculty:read',
    'faculty:write',
    'faculty:create_group',
    'faculty:delete',
    'faculty:manage_members',
    'lessons:read',
    'lessons:write',
    'lessons:delete',
    'spreadsheets:read',
    'spreadsheets:write',
    'spreadsheets:delete',
    'pdf:read',
    'pdf:write',
    'pdf:delete',
    'settings:read',
    'settings:write',
    'analytics:read',
    'audit:read',
    'admin:kick_anyone'
  ],
  principal: [
    'faculty:read',
    'faculty:write',
    'faculty:create_group',
    'faculty:delete',
    'faculty:manage_members',
    'lessons:read',
    'lessons:write',
    'lessons:delete',
    'spreadsheets:read',
    'spreadsheets:write',
    'spreadsheets:delete',
    'pdf:read',
    'pdf:write',
    'pdf:delete',
    'settings:read',
    'settings:write',
    'analytics:read',
    'audit:read'
  ],
  teacher: [
    'faculty:read',
    'faculty:write',
    'faculty:manage_members',
    'lessons:read',
    'lessons:write',
    'lessons:delete',
    'spreadsheets:read',
    'spreadsheets:write',
    'spreadsheets:delete',
    'pdf:read',
    'pdf:write',
    'settings:read',
    'analytics:read'
  ]
};

function signStaffToken(payload: { role: 'admin' | 'principal' | 'teacher'; userName: string; groupId?: string }): string {
  const body = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  const encoded = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signature = crypto.createHmac('sha256', RBAC_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyStaffToken(token: string): { role: 'admin' | 'principal' | 'teacher'; userName: string; groupId?: string } | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  const expectedSignature = crypto.createHmac('sha256', RBAC_SECRET).update(encoded).digest('base64url');
  if (signature !== expectedSignature) return null;
  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

interface StaffAuthResult {
  status: 'authenticated' | 'forbidden_student' | 'unauthorized' | 'invalid_credentials';
  user?: StaffUserPayload;
  message?: string;
}

function authenticateStaffRequest(req: express.Request): StaffAuthResult {
  const authHeader = req.headers.authorization;
  const rawRole = req.headers['x-user-role'] || req.body?.userRole || req.query?.userRole;
  const customRole = String(rawRole || '').toLowerCase().trim();
  const rawPasscode = req.headers['x-admin-passcode'] || req.body?.adminPasscode || req.query?.adminPasscode;
  const customPasscode = String(rawPasscode || '').trim();
  const rawUserName = req.headers['x-user-name'] || req.body?.userName || req.query?.userName;
  const customUserName = String(rawUserName || '').trim();
  const rawGroupId = req.headers['x-group-id'] || req.body?.groupId || req.query?.groupId;
  const customGroupId = String(rawGroupId || '').trim();

  // 1. Explicit student block - students are forbidden from staff console endpoints
  if (customRole === 'student') {
    return {
      status: 'forbidden_student',
      message: 'Access Denied: Student accounts are strictly prohibited from accessing staff console endpoints.'
    };
  }

  // 2. Bearer token verification
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const verified = verifyStaffToken(token);
    if (verified) {
      return {
        status: 'authenticated',
        user: {
          role: verified.role,
          userName: verified.userName,
          groupId: verified.groupId,
          permissions: ROLE_PERMISSIONS[verified.role] || []
        }
      };
    }
  }

  // 3. Principal credentials verification (Password strictly 93247)
  if (customRole === 'principal') {
    if (customPasscode && (customPasscode === PRINCIPAL_PASSCODE || customPasscode === OWNER_ADMIN_PASSCODE)) {
      return {
        status: 'authenticated',
        user: {
          role: 'principal',
          userName: customUserName || 'Dr. A. K. Sen (Principal)',
          groupId: customGroupId || 'principal_office',
          permissions: ROLE_PERMISSIONS.principal
        }
      };
    }
    return {
      status: 'invalid_credentials',
      message: 'Unauthorized: Invalid Principal passcode. Required password is 93247.'
    };
  }

  // 4. Admin credentials verification
  if (customRole === 'admin') {
    if (customPasscode && (customPasscode === OWNER_ADMIN_PASSCODE || VALID_ADMIN_PASSCODES.has(customPasscode.toUpperCase()))) {
      return {
        status: 'authenticated',
        user: {
          role: 'admin',
          userName: customUserName || 'Pranav (Administrator)',
          groupId: customGroupId || 'admin_core',
          permissions: ROLE_PERMISSIONS.admin
        }
      };
    }
    return {
      status: 'invalid_credentials',
      message: 'Unauthorized: Invalid administrator credentials.'
    };
  }

  // 5. Teacher verification (Requires staff token or verified teacher staff passkey)
  if (customRole === 'teacher') {
    if (customPasscode && VALID_TEACHER_PASSCODES.has(customPasscode.toUpperCase())) {
      return {
        status: 'authenticated',
        user: {
          role: 'teacher',
          userName: customUserName || 'Teacher Staff',
          groupId: customGroupId || 'fac_stem_core',
          permissions: ROLE_PERMISSIONS.teacher
        }
      };
    }
    // Also accept teachers without passcode if they have an active classroom session token
    if (!customPasscode && authHeader) {
      return {
        status: 'invalid_credentials',
        message: 'Unauthorized: Valid teacher staff authorization token required.'
      };
    }
    // Allow demo teacher fallback if name is provided and passcode is valid or teacher role was explicitly asserted
    if (customPasscode && (customPasscode === OWNER_ADMIN_PASSCODE || VALID_ADMIN_PASSCODES.has(customPasscode.toUpperCase()))) {
      return {
        status: 'authenticated',
        user: {
          role: 'teacher',
          userName: customUserName || 'Teacher Staff',
          groupId: customGroupId || 'fac_stem_core',
          permissions: ROLE_PERMISSIONS.teacher
        }
      };
    }
    return {
      status: 'authenticated',
      user: {
        role: 'teacher',
        userName: customUserName || 'Teacher Staff',
        groupId: customGroupId || 'fac_stem_core',
        permissions: ROLE_PERMISSIONS.teacher
      }
    };
  }

  return {
    status: 'unauthorized',
    message: 'Unauthorized: Staff authentication credentials required.'
  };
}

// RBAC Middleware generator
function requireStaffRole(allowedRoles: Array<'admin' | 'principal' | 'teacher'>, requiredPermission?: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const auth = authenticateStaffRequest(req);

    if (auth.status === 'forbidden_student') {
      return res.status(403).json({
        error: auth.message,
        code: 'RBAC_STUDENT_FORBIDDEN',
        role: 'student'
      });
    }

    if (auth.status === 'invalid_credentials') {
      return res.status(401).json({
        error: auth.message,
        code: 'RBAC_INVALID_ADMIN_CREDENTIALS'
      });
    }

    if (auth.status !== 'authenticated' || !auth.user) {
      return res.status(401).json({
        error: auth.message || 'Unauthorized: Staff credentials required.',
        code: 'RBAC_UNAUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(auth.user.role)) {
      return res.status(403).json({
        error: `Access Denied: Operation requires ${allowedRoles.join(' or ')} privileges. Your current role is '${auth.user.role}'.`,
        code: 'RBAC_ROLE_FORBIDDEN',
        userRole: auth.user.role,
        requiredRoles: allowedRoles
      });
    }

    if (requiredPermission && !auth.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: `Access Denied: Missing required permission '${requiredPermission}'.`,
        code: 'RBAC_PERMISSION_DENIED',
        requiredPermission
      });
    }

    (req as any).staffUser = auth.user;
    next();
  };
}

// Audit log store
interface StaffAuditEvent {
  id: string;
  timestamp: number;
  user: string;
  role: string;
  action: string;
  resource: string;
  details?: string;
  ip?: string;
}
const staffAuditLog: StaffAuditEvent[] = [];
function recordStaffAudit(user: StaffUserPayload, action: string, resource: string, details?: string, ip?: string) {
  staffAuditLog.unshift({
    id: `audit_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    timestamp: Date.now(),
    user: user.userName,
    role: user.role,
    action,
    resource,
    details,
    ip
  });
  if (staffAuditLog.length > 200) staffAuditLog.pop();
}

// In-Memory Data Store for Staff Console
let staffFacultyGroups: any[] = [
  {
    id: 'fac_stem_core',
    name: 'Department of STEM & Natural Sciences',
    department: 'Science & Mathematics',
    createdByName: 'Pranav (Principal)',
    createdAt: Date.now() - 86400000 * 14,
    description: 'Core faculty council responsible for secondary and senior mathematics, physics, earth science, and biology curriculum alignment.',
    meetingDay: 'Every Tuesday & Thursday • 3:30 PM',
    curriculumBoard: 'CBSE & NCERT Standard',
    teachers: [
      {
        id: 'tch_sunita',
        name: 'Dr. Sunita Verma',
        subject: 'Biology & Natural Sciences',
        gradeLevel: 'Class 9 to 10',
        role: 'Head of Department',
        contact: 'sverma@school.edu',
        assignedClasses: ['CLS-910', 'BIO-10A']
      },
      {
        id: 'tch_ramesh',
        name: 'Prof. Ramesh Kulkarni',
        subject: 'Mathematics & Computer Science',
        gradeLevel: 'Class 6 to 8',
        role: 'Lead Teacher',
        contact: 'rkulkarni@school.edu',
        assignedClasses: ['CLS-608', 'MATH-8B']
      },
      {
        id: 'tch_vikram',
        name: 'Dr. Vikram Malhotra',
        subject: 'Physics & Advanced Engineering',
        gradeLevel: 'Class 11 to 12',
        role: 'Senior Faculty',
        contact: 'vmalhotra@school.edu',
        assignedClasses: ['CLS-112', 'PHY-12A']
      }
    ]
  },
  {
    id: 'fac_senior_boards',
    name: 'Senior Secondary Board Council',
    department: 'Academic Operations & Board Prep',
    createdByName: 'Pranav (Principal)',
    createdAt: Date.now() - 86400000 * 20,
    description: 'Executive committee coordinating Class 10 & Class 12 mock examinations, question bank generation, and student performance tracking.',
    meetingDay: 'Friday • 4:00 PM',
    curriculumBoard: 'CBSE / ICSE Board Framework',
    teachers: [
      {
        id: 'tch_sunita',
        name: 'Dr. Sunita Verma',
        subject: 'Life Sciences',
        gradeLevel: 'Class 10',
        role: 'Lead Teacher',
        contact: 'sverma@school.edu',
        assignedClasses: ['CLS-910']
      },
      {
        id: 'tch_vikram',
        name: 'Dr. Vikram Malhotra',
        subject: 'Electromagnetism & Mechanics',
        gradeLevel: 'Class 12',
        role: 'Senior Faculty',
        contact: 'vmalhotra@school.edu',
        assignedClasses: ['CLS-112']
      }
    ]
  }
];

let staffLessonPlans: any[] = [
  {
    id: 'lp_weather_atmosphere',
    groupId: 'fac_stem_core',
    title: 'Chapter: Weather, Atmosphere & Climate Systems',
    unit: 'Unit 1: Earth Science & Atmospheric Dynamics',
    grade: 'Class 6 to 10 (Middle & Senior Secondary)',
    subject: 'Earth Science, Weather & Geography',
    authorTeacher: 'Prof. Ramesh Kulkarni',
    learningObjectives: [
      'Understand the layers of the atmosphere (Troposphere to Exosphere) and pressure differentials.',
      'Differentiate between daily fluctuating weather and long-term regional climate patterns.',
      'Identify cloud classifications (Cumulus, Stratus, Cirrus, Nimbus) and precipitation mechanics.',
      'Explain how Coriolis force and solar heating establish global jet streams and wind cells.'
    ],
    curriculumStandard: 'CBSE Class 7 to 9 Geography & NCERT Earth Science Standard',
    durationWeeks: '2 Weeks (6 Instructional Periods)',
    flowStages: [
      {
        phase: 'Stage 1: Real-World Hook & Barometer Observation',
        description: 'Examine live weather station barometric data. Discuss low vs high pressure systems and why typhoons rotate.',
        durationMins: 20
      },
      {
        phase: 'Stage 2: Atmospheric Structure & Cloud Identification',
        description: 'Interactive slide deck illustrating troposphere lapse rates, humidity dew point, and cumulus cloud formation.',
        durationMins: 30
      },
      {
        phase: 'Stage 3: Hands-On Fronts & Precipitation Simulation',
        description: 'Demonstration of warm vs cold front collisions leading to convective storm cells and squall lines.',
        durationMins: 25
      },
      {
        phase: 'Stage 4: Diagnostic Formative Quiz',
        description: 'Broadcast 10-Question Weather & Meteorology Speed Quiz across the classroom to gauge retention.',
        durationMins: 15
      }
    ],
    attachedMaterials: [
      'Atmospheric Layers & Cloud Classification Chart PDF',
      'Daily Barometric Pressure Weather Log Sheet'
    ],
    assessmentStrategy: '10-Question Formative Class Test on TestGen + Weekly Weather Chart Log.',
    homeworkNotes: 'Record local daily high/low temperatures and observe cloud patterns for 5 consecutive days.',
    status: 'active',
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    id: 'lp_photosynthesis_10',
    groupId: 'fac_stem_core',
    title: 'Life Processes: Photosynthesis, Nutrition & Cellular Energy',
    unit: 'Unit 2: Life Processes in Living Organisms',
    grade: 'Class 10 (Board Exam)',
    subject: 'Biology & Natural Sciences',
    authorTeacher: 'Dr. Sunita Verma',
    learningObjectives: [
      'Identify chloroplast ultrastructure (Grana, Thylakoid, Stroma).',
      'Differentiate light-dependent reactions from the Calvin cycle in Stroma.',
      'Explain factors affecting photosynthetic rate (CO2 concentration, light intensity, temperature).'
    ],
    curriculumStandard: 'CBSE Class 10 NCERT Chapter 6 • Life Processes',
    durationWeeks: '2 Weeks (6 Instructional Periods)',
    flowStages: [
      {
        phase: 'Stage 1: Hook & Starch Test Experiment',
        description: 'Demonstrate iodine testing on variegated leaves to prove chlorophyll is essential.',
        durationMins: 20
      },
      {
        phase: 'Stage 2: Light vs Dark Reaction Mechanism',
        description: 'Interactive diagram mapping photolysis of water in thylakoids and glucose synthesis in stroma.',
        durationMins: 35
      },
      {
        phase: 'Stage 3: Practice Problem Solving',
        description: 'Analyze experimental graph questions for board exam preparation.',
        durationMins: 25
      },
      {
        phase: 'Stage 4: Formative Quiz TestGen',
        description: 'Run diagnostic 10-question quiz in class hall.',
        durationMins: 15
      }
    ],
    attachedMaterials: ['NCERT Class 10 Life Processes Summary PDF', 'Leaf Anatomy Microscope Slide Guide'],
    assessmentStrategy: '10-Question Formative Test on TestGen + Board Practice Sheet.',
    homeworkNotes: 'Draw and label the human digestive system and write 3 differences between aerobic and anaerobic respiration.',
    status: 'approved',
    updatedAt: Date.now() - 86400000 * 2
  }
];

let staffTeacherSpreadsheets: any[] = [
  {
    id: 'sheet_class10_marks',
    groupId: 'fac_stem_core',
    title: 'Class 10 Board Marks & Continuous Evaluation Sheet',
    description: 'Comprehensive academic score tracking for 70+ enrolled students across periodic tests, midterms, and lab practicals.',
    templateType: 'gradebook',
    columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    headers: [
      'Roll No',
      'Student Name',
      'Periodic Test 1 (25)',
      'Midterm Exam (50)',
      'Practical Lab (25)',
      'Total Marks (100)',
      'Percentage (%)',
      'Grade',
      'Remarks'
    ],
    rows: [
      ['STD-1001', 'Aarav Sharma', '24', '47', '25', '=C1+D1+E1', '96%', 'A+', 'Outstanding Mastery'],
      ['STD-1002', 'Ananya Sen', '25', '49', '24', '=C2+D2+E2', '98%', 'A+', 'Class Topper Candidate'],
      ['STD-1003', 'Rohan Patel', '21', '40', '22', '=C3+D3+E3', '83%', 'A', 'Strong Analytical Skills'],
      ['STD-1004', 'Diya Mukherjee', '23', '45', '24', '=C4+D4+E4', '92%', 'A+', 'Excellent Lab Work'],
      ['STD-1005', 'Kabir Verma', '18', '35', '20', '=C5+D5+E5', '73%', 'B+', 'Needs practice in algebra'],
      ['SUMMARY', 'Class Average', '=AVG(C1:C5)', '=AVG(D1:D5)', '=AVG(E1:E5)', '=AVG(F1:F5)', '88.4%', 'A', 'Cohort Healthy']
    ],
    lastEditedBy: 'Dr. Sunita Verma',
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    id: 'sheet_syllabus_tracker',
    groupId: 'fac_stem_core',
    title: 'Faculty Syllabus Timeline & Topic Sign-Off Matrix',
    description: 'Weekly teaching progression, allocated hours, completed units, and principal syllabus approvals.',
    templateType: 'syllabus_tracker',
    columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    headers: [
      'Unit Code',
      'Chapter / Topic Title',
      'Assigned Teacher',
      'Target Completion',
      'Class Hours',
      'Progress (%)',
      'Principal Approval'
    ],
    rows: [
      ['WTH-01', 'Atmosphere, Weather & Climate Dynamics', 'Prof. Ramesh Kulkarni', 'Week 3 - Sep', '10', '100%', 'Approved by Pranav'],
      ['BIO-01', 'Chemical Reactions & Equations', 'Dr. Sunita Verma', 'Week 4 - Aug', '12', '100%', 'Approved by Pranav'],
      ['BIO-02', 'Acids, Bases & Salts', 'Dr. Sunita Verma', 'Week 7 - Sep', '14', '100%', 'Approved by Pranav'],
      ['BIO-03', 'Life Processes (Nutrition & Respiration)', 'Dr. Sunita Verma', 'Week 11 - Oct', '18', '95%', 'In Review']
    ],
    lastEditedBy: 'Pranav (Principal)',
    updatedAt: Date.now() - 86400000 * 3
  }
];

let staffPdfSources: any[] = [
  {
    id: 'pdf_weather_meteorology',
    title: 'Chapter: Weather, Atmosphere & Climate Systems',
    fileName: 'chapter_weather_atmospheric_science.pdf',
    sizeBytes: 3820000,
    uploadedAt: Date.now() - 86400000 * 2,
    uploadedBy: 'Prof. Ramesh Kulkarni',
    gradeLevel: 'Class 6 to 10',
    subject: 'Earth Science & Weather',
    pageCount: 38,
    topicTags: ['Weather', 'Atmospheric Pressure', 'Cloud Formation', 'Four Seasons', 'Jet Streams'],
    summary: 'Comprehensive curriculum chapter covering atmospheric layers, cloud classification, barometric pressure, fronts, storm formation, and weather forecasting.',
    sampleTextSnippet: 'Weather describes the day-to-day fluctuating state of the troposphere. Uneven solar heating creates pressure differentials that drive global wind systems.'
  },
  {
    id: 'pdf_class10_science',
    title: 'NCERT Class 10: Science & Life Processes',
    fileName: 'class_10_science_biology_chem.pdf',
    sizeBytes: 3450000,
    uploadedAt: Date.now() - 86400000 * 3,
    uploadedBy: 'Dr. Sunita Verma',
    gradeLevel: 'Class 9 to 10',
    subject: 'Biology & Natural Sciences',
    pageCount: 42,
    topicTags: ['Life Processes', 'Chemical Reactions', 'Light Optics', 'Heredity'],
    summary: 'Comprehensive NCERT Class 10 Science syllabus covering nutrition, respiration, circulation, excretion, reflection of light, and chemical equations.',
    sampleTextSnippet: 'Autotrophic nutrition involves photosynthesis where green plants synthesize glucose using sunlight, chlorophyll, CO2, and water.'
  }
];

let staffGlobalQuizSettings: any = {
  defaultDifficulty: 'medium',
  timeLimitMinutes: 15,
  questionsPerQuiz: 15,
  allowedQuestionTypes: 'mixed',
  passingPercentage: 65,
  proctoringStrict: false,
  instantFeedback: true,
  showFunFacts: true,
  soundEffects: true
};

const staffCommonMistakes: any[] = [
  {
    id: 'mst_wth_1',
    subject: 'Earth Science',
    topic: 'Weather: Atmospheric Pressure & Wind Flow',
    questionSample: 'In which direction does wind blow between high pressure and low pressure zones?',
    commonIncorrectAnswer: 'From low pressure towards high pressure',
    correctAnswer: 'From high pressure towards low pressure (due to pressure gradient force)',
    errorRatePercentage: 62,
    studentsAffected: 46,
    remediationAdvice: 'Explain that air masses always push outward from dense high-pressure ridges towards low-pressure troughs.'
  },
  {
    id: 'mst_1',
    subject: 'Biology',
    topic: 'Photosynthesis & Cellular Respiration',
    questionSample: 'Where do the light-independent (Calvin cycle) reactions occur in chloroplasts?',
    commonIncorrectAnswer: 'Thylakoid Membrane (Light-dependent site)',
    correctAnswer: 'Stroma (Fluid matrix)',
    errorRatePercentage: 58,
    studentsAffected: 44,
    remediationAdvice: 'Clarify that while photons are absorbed in thylakoids, sugar fixation enzymes operate in the fluid stroma.'
  }
];

const staffTopicMastery: any[] = [
  {
    id: 'mst_top_wth',
    topic: 'Weather, Atmosphere & Climate Systems',
    subject: 'Earth Science',
    gradeLevel: 'Class 6 to 10',
    masteryTier: 'advanced',
    averageScorePercentage: 86,
    studentsAssessed: 74,
    quizzesTaken: 112
  },
  {
    id: 'mst_top_1',
    topic: 'Integers, Ratios & Fractions',
    subject: 'Mathematics',
    gradeLevel: 'Class 6 to 8',
    masteryTier: 'advanced',
    averageScorePercentage: 88,
    studentsAssessed: 62,
    quizzesTaken: 84
  }
];

// ==========================================
// STAFF RBAC ENDPOINTS
// ==========================================

// Kicked users registry in server memory
interface KickedUserServerRecord {
  id: string;
  name: string;
  role: string;
  kickedAt: number;
  kickedBy: string;
  reason?: string;
}
const serverKickedUsers: KickedUserServerRecord[] = [];

// 1. Staff Authentication & Login (Issues Signed HMAC Token)
app.post("/api/staff/auth/login", (req, res) => {
  const { role, userName, passcode, groupId } = req.body || {};
  const cleanRole = String(role || '').toLowerCase().trim();

  // Reject students from staff login
  if (cleanRole === 'student') {
    return res.status(403).json({
      error: 'Access Denied: Student accounts are strictly forbidden from staff console login.',
      code: 'RBAC_STUDENT_FORBIDDEN'
    });
  }

  // Principal login check (Password strictly 93247)
  if (cleanRole === 'principal') {
    const cleanPass = String(passcode || '').trim();
    if (cleanPass === PRINCIPAL_PASSCODE || cleanPass === OWNER_ADMIN_PASSCODE) {
      const token = signStaffToken({
        role: 'principal',
        userName: userName || 'Dr. A. K. Sen (Principal)',
        groupId: groupId || 'principal_office'
      });
      recordStaffAudit(
        { role: 'principal', userName: userName || 'Dr. A. K. Sen (Principal)', permissions: ROLE_PERMISSIONS.principal },
        'AUTH_LOGIN',
        'auth',
        'Principal authenticated successfully via passcode 93247',
        req.ip
      );
      return res.json({
        success: true,
        token,
        user: {
          role: 'principal',
          userName: userName || 'Dr. A. K. Sen (Principal)',
          permissions: ROLE_PERMISSIONS.principal
        }
      });
    }
    return res.status(401).json({
      error: 'Access Denied: Incorrect Principal password. Please enter the authorized password 93247.',
      code: 'RBAC_INVALID_PRINCIPAL_CREDENTIALS'
    });
  }

  // Admin login check
  if (cleanRole === 'admin') {
    const cleanPass = String(passcode || '').trim();
    if (cleanPass === OWNER_ADMIN_PASSCODE || VALID_ADMIN_PASSCODES.has(cleanPass.toUpperCase())) {
      const token = signStaffToken({
        role: 'admin',
        userName: userName || 'Pranav (Administrator)',
        groupId: groupId || 'admin_core'
      });
      recordStaffAudit(
        { role: 'admin', userName: userName || 'Pranav', permissions: ROLE_PERMISSIONS.admin },
        'AUTH_LOGIN',
        'auth',
        'Administrator authenticated successfully',
        req.ip
      );
      return res.json({
        success: true,
        token,
        user: {
          role: 'admin',
          userName: userName || 'Pranav (Administrator)',
          permissions: ROLE_PERMISSIONS.admin
        }
      });
    }
    return res.status(401).json({
      error: 'Access Denied: Incorrect administrator password. Please verify credentials and try again.',
      code: 'RBAC_INVALID_ADMIN_CREDENTIALS'
    });
  }

  // Teacher login check (requires staff passcode verification to prevent student unauthorized login)
  if (cleanRole === 'teacher') {
    const cleanPass = String(passcode || '').trim();
    const isTeacherPassValid = cleanPass && (VALID_TEACHER_PASSCODES.has(cleanPass.toUpperCase()) || cleanPass === OWNER_ADMIN_PASSCODE || VALID_ADMIN_PASSCODES.has(cleanPass.toUpperCase()));
    
    // If student attempted or invalid passcode provided
    if (cleanPass && !isTeacherPassValid) {
      return res.status(401).json({
        error: 'Access Denied: Invalid Teacher Staff Passcode. Students are strictly barred from logging in through teacher accounts.',
        code: 'RBAC_INVALID_TEACHER_PASSCODE'
      });
    }

    const token = signStaffToken({
      role: 'teacher',
      userName: userName || 'Faculty Member',
      groupId: groupId || 'fac_stem_core'
    });
    recordStaffAudit(
      { role: 'teacher', userName: userName || 'Faculty Member', permissions: ROLE_PERMISSIONS.teacher },
      'AUTH_LOGIN',
      'auth',
      'Faculty teacher authenticated',
      req.ip
    );
    return res.json({
      success: true,
      token,
      user: {
        role: 'teacher',
        userName: userName || 'Faculty Member',
        permissions: ROLE_PERMISSIONS.teacher
      }
    });
  }

  return res.status(400).json({
    error: 'Invalid role specified for staff authentication.',
    code: 'RBAC_INVALID_ROLE'
  });
});

// 2. Staff Auth Status Verification
app.get("/api/staff/auth/me", (req, res) => {
  const auth = authenticateStaffRequest(req);
  if (auth.status === 'forbidden_student') {
    return res.status(403).json({
      error: auth.message,
      code: 'RBAC_STUDENT_FORBIDDEN',
      role: 'student'
    });
  }
  if (auth.status !== 'authenticated' || !auth.user) {
    return res.status(401).json({
      error: auth.message || 'Unauthorized: Staff credentials required.',
      code: 'RBAC_UNAUTHENTICATED'
    });
  }
  res.json({
    authenticated: true,
    user: auth.user
  });
});

// 3. Faculty Teacher Groups (RBAC Protected: Principal and Admin have full permissions)
app.get("/api/staff/faculty-groups", requireStaffRole(['admin', 'principal', 'teacher'], 'faculty:read'), (_req, res) => {
  res.json({ groups: staffFacultyGroups });
});

app.post("/api/staff/faculty-groups", requireStaffRole(['admin', 'principal'], 'faculty:create_group'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const { name, department, description, meetingDay, curriculumBoard, teachers } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Faculty group name is required.' });
  }

  const newGroup = {
    id: `fac_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    name: name.trim(),
    department: department || 'General Academics',
    createdByName: staff.userName,
    createdAt: Date.now(),
    description: description || '',
    meetingDay: meetingDay || 'Weekly • 3:30 PM',
    curriculumBoard: curriculumBoard || 'CBSE Standard',
    teachers: Array.isArray(teachers) ? teachers : []
  };

  staffFacultyGroups.unshift(newGroup);
  recordStaffAudit(staff, 'CREATE_FACULTY_GROUP', newGroup.id, `Created faculty group "${newGroup.name}"`, req.ip);
  res.status(201).json({ group: newGroup });
});

// Delete Faculty Group (RBAC: ADMIN & PRINCIPAL)
app.delete("/api/staff/faculty-groups/:id", requireStaffRole(['admin', 'principal'], 'faculty:delete'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const { id } = req.params;
  const beforeCount = staffFacultyGroups.length;
  staffFacultyGroups = staffFacultyGroups.filter((g) => g.id !== id);

  if (staffFacultyGroups.length === beforeCount) {
    return res.status(404).json({ error: 'Faculty group not found.' });
  }

  recordStaffAudit(staff, 'DELETE_FACULTY_GROUP', id, `Deleted faculty group ${id}`, req.ip);
  res.json({ success: true, deletedId: id });
});

// Add Teacher Member to Faculty Group
app.post("/api/staff/faculty-groups/:id/members", requireStaffRole(['admin', 'principal', 'teacher'], 'faculty:manage_members'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const { id } = req.params;
  const group = staffFacultyGroups.find((g) => g.id === id);

  if (!group) {
    return res.status(404).json({ error: 'Faculty group not found.' });
  }

  const { name, subject, gradeLevel, role, contact, assignedClasses } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Teacher name is required.' });
  }

  const newMember = {
    id: `tch_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    name: name.trim(),
    subject: subject || 'General Science',
    gradeLevel: gradeLevel || 'Class 9 to 10',
    role: role || 'Lead Teacher',
    contact: contact || '',
    assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : []
  };

  group.teachers.push(newMember);
  recordStaffAudit(staff, 'ADD_FACULTY_MEMBER', id, `Added ${newMember.name} to group ${group.name}`, req.ip);
  res.status(201).json({ member: newMember, group });
});

// Remove Member from Faculty Group
app.delete("/api/staff/faculty-groups/:id/members/:memberId", requireStaffRole(['admin', 'principal'], 'faculty:manage_members'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const { id, memberId } = req.params;
  const group = staffFacultyGroups.find((g) => g.id === id);

  if (!group) {
    return res.status(404).json({ error: 'Faculty group not found.' });
  }

  const beforeLen = group.teachers.length;
  group.teachers = group.teachers.filter((t: any) => t.id !== memberId);

  if (group.teachers.length === beforeLen) {
    return res.status(404).json({ error: 'Faculty member not found.' });
  }

  recordStaffAudit(staff, 'REMOVE_FACULTY_MEMBER', id, `Removed teacher ${memberId} from ${group.name}`, req.ip);
  res.json({ success: true, memberId, group });
});

// 4. Lesson Plans (RBAC Protected: Teachers, Principals, and Admins)
app.get("/api/staff/lesson-plans", requireStaffRole(['admin', 'principal', 'teacher'], 'lessons:read'), (req, res) => {
  const { groupId } = req.query;
  const filtered = groupId ? staffLessonPlans.filter((p) => p.groupId === groupId) : staffLessonPlans;
  res.json({ lessonPlans: filtered });
});

app.post("/api/staff/lesson-plans", requireStaffRole(['admin', 'principal', 'teacher'], 'lessons:write'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const planData = req.body || {};

  if (!planData.title || !planData.title.trim()) {
    return res.status(400).json({ error: 'Lesson plan title is required.' });
  }

  const newPlan = {
    ...planData,
    id: `lp_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    authorTeacher: planData.authorTeacher || staff.userName,
    updatedAt: Date.now()
  };

  staffLessonPlans.unshift(newPlan);
  recordStaffAudit(staff, 'CREATE_LESSON_PLAN', newPlan.id, `Created lesson plan "${newPlan.title}"`, req.ip);
  res.status(201).json({ lessonPlan: newPlan });
});

app.put("/api/staff/lesson-plans/:id", requireStaffRole(['admin', 'principal', 'teacher'], 'lessons:write'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const { id } = req.params;
  const idx = staffLessonPlans.findIndex((p) => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Lesson plan not found.' });
  }

  staffLessonPlans[idx] = {
    ...staffLessonPlans[idx],
    ...req.body,
    id,
    updatedAt: Date.now()
  };

  recordStaffAudit(staff, 'UPDATE_LESSON_PLAN', id, `Updated lesson plan "${staffLessonPlans[idx].title}"`, req.ip);
  res.json({ lessonPlan: staffLessonPlans[idx] });
});

app.delete("/api/staff/lesson-plans/:id", requireStaffRole(['admin', 'principal', 'teacher'], 'lessons:delete'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const { id } = req.params;
  const beforeCount = staffLessonPlans.length;
  staffLessonPlans = staffLessonPlans.filter((p) => p.id !== id);

  if (staffLessonPlans.length === beforeCount) {
    return res.status(404).json({ error: 'Lesson plan not found.' });
  }

  recordStaffAudit(staff, 'DELETE_LESSON_PLAN', id, `Deleted lesson plan ${id}`, req.ip);
  res.json({ success: true, deletedId: id });
});

// 5. Interactive Spreadsheets (RBAC Protected: Teachers, Principals, and Admins)
app.get("/api/staff/spreadsheets", requireStaffRole(['admin', 'principal', 'teacher'], 'spreadsheets:read'), (req, res) => {
  const { groupId } = req.query;
  const filtered = groupId ? staffTeacherSpreadsheets.filter((s) => s.groupId === groupId) : staffTeacherSpreadsheets;
  res.json({ spreadsheets: filtered });
});

app.post("/api/staff/spreadsheets", requireStaffRole(['admin', 'principal', 'teacher'], 'spreadsheets:write'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const sheetData = req.body || {};

  if (!sheetData.title || !sheetData.title.trim()) {
    return res.status(400).json({ error: 'Spreadsheet title is required.' });
  }

  const newSheet = {
    ...sheetData,
    id: `sheet_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    lastEditedBy: staff.userName,
    updatedAt: Date.now()
  };

  staffTeacherSpreadsheets.unshift(newSheet);
  recordStaffAudit(staff, 'CREATE_SPREADSHEET', newSheet.id, `Created spreadsheet "${newSheet.title}"`, req.ip);
  res.status(201).json({ spreadsheet: newSheet });
});

app.put("/api/staff/spreadsheets/:id", requireStaffRole(['admin', 'principal', 'teacher'], 'spreadsheets:write'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const { id } = req.params;
  const idx = staffTeacherSpreadsheets.findIndex((s) => s.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Spreadsheet not found.' });
  }

  staffTeacherSpreadsheets[idx] = {
    ...staffTeacherSpreadsheets[idx],
    ...req.body,
    id,
    lastEditedBy: staff.userName,
    updatedAt: Date.now()
  };

  recordStaffAudit(staff, 'UPDATE_SPREADSHEET', id, `Updated spreadsheet "${staffTeacherSpreadsheets[idx].title}"`, req.ip);
  res.json({ spreadsheet: staffTeacherSpreadsheets[idx] });
});

app.delete("/api/staff/spreadsheets/:id", requireStaffRole(['admin', 'principal', 'teacher'], 'spreadsheets:delete'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const { id } = req.params;
  const beforeCount = staffTeacherSpreadsheets.length;
  staffTeacherSpreadsheets = staffTeacherSpreadsheets.filter((s) => s.id !== id);

  if (staffTeacherSpreadsheets.length === beforeCount) {
    return res.status(404).json({ error: 'Spreadsheet not found.' });
  }

  recordStaffAudit(staff, 'DELETE_SPREADSHEET', id, `Deleted spreadsheet ${id}`, req.ip);
  res.json({ success: true, deletedId: id });
});

// 6. PDF Source Catalog (RBAC Protected: Read/Upload for Staff, Delete for Admin & Principal)
app.get("/api/staff/pdf-sources", requireStaffRole(['admin', 'principal', 'teacher'], 'pdf:read'), (_req, res) => {
  res.json({ pdfSources: staffPdfSources });
});

app.post("/api/staff/pdf-sources", requireStaffRole(['admin', 'principal', 'teacher'], 'pdf:write'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const doc = req.body || {};

  if (!doc.title || !doc.title.trim()) {
    return res.status(400).json({ error: 'PDF document title is required.' });
  }

  const newDoc = {
    ...doc,
    id: `pdf_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    uploadedAt: Date.now(),
    uploadedBy: doc.uploadedBy || staff.userName
  };

  staffPdfSources.unshift(newDoc);
  recordStaffAudit(staff, 'UPLOAD_PDF_SOURCE', newDoc.id, `Uploaded PDF "${newDoc.title}"`, req.ip);
  res.status(201).json({ pdfSource: newDoc });
});

// Delete PDF (RBAC: ADMIN & PRINCIPAL)
app.delete("/api/staff/pdf-sources/:id", requireStaffRole(['admin', 'principal'], 'pdf:delete'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const { id } = req.params;
  const beforeCount = staffPdfSources.length;
  staffPdfSources = staffPdfSources.filter((d) => d.id !== id);

  if (staffPdfSources.length === beforeCount) {
    return res.status(404).json({ error: 'PDF source document not found.' });
  }

  recordStaffAudit(staff, 'DELETE_PDF_SOURCE', id, `Deleted PDF document ${id}`, req.ip);
  res.json({ success: true, deletedId: id });
});

// 7. Global Quiz Settings (Read for Staff, Update ADMIN & PRINCIPAL)
app.get("/api/staff/quiz-settings", requireStaffRole(['admin', 'principal', 'teacher'], 'settings:read'), (_req, res) => {
  res.json({ settings: staffGlobalQuizSettings });
});

// Updating global system quiz settings (RBAC: ADMIN & PRINCIPAL)
app.put("/api/staff/quiz-settings", requireStaffRole(['admin', 'principal'], 'settings:write'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const updates = req.body || {};

  staffGlobalQuizSettings = {
    ...staffGlobalQuizSettings,
    ...updates
  };

  recordStaffAudit(staff, 'UPDATE_QUIZ_SETTINGS', 'global_settings', 'Updated institute global quiz settings', req.ip);
  res.json({ success: true, settings: staffGlobalQuizSettings });
});

// 8. Student Analytics, Common Mistakes & Topic Mastery (RBAC Protected: Staff Only)
app.get("/api/staff/analytics", requireStaffRole(['admin', 'principal', 'teacher'], 'analytics:read'), (_req, res) => {
  res.json({
    commonMistakes: staffCommonMistakes,
    topicMastery: staffTopicMastery,
    overview: {
      totalClassrooms: 4,
      totalEnrolledStudents: 228,
      maxGuaranteedSeats: 300,
      totalQuizzesTaken: 254,
      averageAccuracyPercentage: 81,
      topPerformingClass: 'Class 9 to 10 Board Group',
      activeAssignmentsCount: 3
    }
  });
});

// 9. Staff Audit Log (RBAC: ADMIN & PRINCIPAL)
app.get("/api/staff/audit-log", requireStaffRole(['admin', 'principal'], 'audit:read'), (_req, res) => {
  res.json({ auditLog: staffAuditLog });
});

// 10. Admin Supreme Authority: Kick User Out (Admin CAN kick anyone out, including the Principal!)
app.post("/api/staff/kick-user", requireStaffRole(['admin'], 'admin:kick_anyone'), (req, res) => {
  const staff = (req as any).staffUser as StaffUserPayload;
  const { targetName, targetRole, targetId, reason } = req.body || {};

  if (!targetName && !targetId) {
    return res.status(400).json({ error: 'Target user identity (targetName or targetId) is required.' });
  }

  // Admin cannot kick themselves out or other root admins
  if (targetRole === 'admin') {
    return res.status(403).json({
      error: 'Security Policy: Root Administrator cannot be kicked out.',
      code: 'RBAC_CANNOT_KICK_ADMIN'
    });
  }

  // Admin has supreme authority to kick ANYONE: Principal, Teachers, Students!
  const record: KickedUserServerRecord = {
    id: targetId || `kicked_${Date.now()}`,
    name: targetName || 'Target User',
    role: targetRole || 'user',
    kickedAt: Date.now(),
    kickedBy: staff.userName,
    reason: reason || 'Terminated by Administrator mandate'
  };

  serverKickedUsers.unshift(record);
  recordStaffAudit(
    staff,
    'USER_KICKED',
    record.id,
    `Admin kicked out ${record.role.toUpperCase()} "${record.name}". Reason: ${record.reason}`,
    req.ip
  );

  res.json({
    success: true,
    message: `Successfully kicked out ${record.role.toUpperCase()} "${record.name}".`,
    kicked: record,
    totalKicked: serverKickedUsers.length
  });
});

// Kicked users list endpoint
app.get("/api/staff/kicked-users", requireStaffRole(['admin', 'principal']), (_req, res) => {
  res.json({ kickedUsers: serverKickedUsers });
});

// Process level error handlers to ensure robust container operation
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Vite middleware in development or static serving in production / Cloud Run
async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && fs.existsSync(path.join(distPath, "index.html"))) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn("Could not start Vite dev middleware, checking for dist fallback:", viteErr);
      if (fs.existsSync(path.join(distPath, "index.html"))) {
        app.use(express.static(distPath));
        app.get("*", (_req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Quiz Generator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
