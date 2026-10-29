import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Sparkles,
  X,
  Languages,
  BookOpen,
  Send,
  Loader2,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Copy,
  Check
} from "lucide-react";
import { AppLanguage, AskQuestionResponse, QuizQuestion } from "../types";

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  contextQuestion?: QuizQuestion;
  documentContext?: string;
  defaultLanguage?: AppLanguage;
  onOpenImagineCreativity?: (questionPrompt?: string) => void;
}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  initialQuestion = "",
  contextQuestion,
  documentContext = "",
  defaultLanguage = "en",
  onOpenImagineCreativity
}) => {
  const [questionText, setQuestionText] = useState<string>(initialQuestion);
  const [language, setLanguage] = useState<AppLanguage>(defaultLanguage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<AskQuestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (initialQuestion) {
        setQuestionText(initialQuestion);
      } else if (contextQuestion) {
        setQuestionText(`Can you summarize and explain this question: "${contextQuestion.question}"?`);
      }
      setError(null);
    }
  }, [isOpen, initialQuestion, contextQuestion]);

  if (!isOpen) return null;

  const handleAsk = async (langOverride?: AppLanguage) => {
    const targetLang = langOverride || language;
    const query = questionText.trim();
    if (!query) return;

    setIsLoading(true);
    setError(null);

    let fullContext = documentContext ? `Source document: ${documentContext}\n` : "";
    if (contextQuestion) {
      fullContext += `Current Test Question: "${contextQuestion.question}"\nOptions: ${contextQuestion.options.join(", ")}\nCorrect Answer: ${contextQuestion.correctAnswer}\nProvided Explanation: ${contextQuestion.explanation}\n`;
    }

    try {
      const res = await fetch("/api/ask-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          context: fullContext,
          language: targetLang
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data: AskQuestionResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.error("Ask question error:", err);
      setError(err?.message || "Failed to process your question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!response) return;
    const textToCopy = `Question Summary: ${response.questionSummary}\n\nAnswer: ${response.answer}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePrompts = [
    {
      en: "Summarize this question and explain why the correct answer is right",
      hi: "इस प्रश्न का सारांश दें और समझाएं कि सही उत्तर क्यों सही है",
      sa: "अस्य प्रश्नस्य संक्षेपसारं दत्त्वा शुद्धमुत्तरं विवृणोतु"
    },
    {
      en: "Explain the fundamental concept behind this in simple terms",
      hi: "इसके पीछे की मूल संकल्पना को सरल शब्दों में समझाएं",
      sa: "अस्य पृष्ठभूमौ विद्यमानां मूलसंकल्पनां सरलसंस्कृतेन प्रतिपादयतु"
    },
    {
      en: "What common mistakes or misconceptions do students make here?",
      hi: "छात्र यहाँ आमतौर पर क्या गलतियाँ या भ्रम करते हैं?",
      sa: "अत्र छात्राः सामान्यान् कान् भ्रमान् कुर्वन्ति?"
    }
  ];

  return (
    <div
      id="ask-question-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/50 via-white to-amber-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Ask AI Tutor & Question Summarizer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                  Multilingual
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Get an instant question summary, deep pedagogical answer, and key takeaways in English, Hindi, or Sanskrit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Language Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Languages className="w-4 h-4 text-indigo-600" />
              <span>Response Language / भाषा चयन:</span>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setLanguage("en");
                  if (response) handleAsk("en");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === "en"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage("hi");
                  if (response) handleAsk("hi");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === "hi"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                🇮🇳 हिन्दी (Hindi)
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage("sa");
                  if (response) handleAsk("sa");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === "sa"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                🕉️ संस्कृतम् (Sanskrit)
              </button>
            </div>
          </div>

          {/* Context Banner if asking about a specific question */}
          {contextQuestion && (
            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-start gap-3 text-xs">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-indigo-900 uppercase tracking-wider text-[10px]">
                  Attached Test Question Context
                </div>
                <div className="font-semibold text-slate-800 mt-0.5 line-clamp-2">
                  {contextQuestion.question}
                </div>
                <div className="text-slate-500 mt-1">
                  Correct Answer: <span className="font-bold text-emerald-700">{contextQuestion.correctAnswer}</span>
                </div>
              </div>
            </div>
          )}

          {/* Question Input Form */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {language === "hi"
                ? "अपना प्रश्न अथवा जिज्ञासा यहाँ लिखें:"
                : language === "sa"
                ? "स्वकीयं प्रश्नं जिज्ञासां वा अत्र लिखतु:"
                : "Type your question or concept doubt:"}
            </label>
            <div className="relative">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder={
                  language === "hi"
                    ? "उदा. इस प्रश्न का मुख्य सारांश क्या है और यह क्या सिखाता है?"
                    : language === "sa"
                    ? "उदा. अस्य प्रश्नस्य मुख्यसारः कः? अत्र किं प्रतिपाद्यते?"
                    : "e.g., Explain the core dilemma in this question and summarize the underlying principle..."
                }
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm text-slate-900 placeholder:text-slate-400 resize-none transition-all"
              />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {samplePrompts.map((p, idx) => {
                const text = language === "hi" ? p.hi : language === "sa" ? p.sa : p.en;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestionText(text);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors border border-slate-200/80"
                  >
                    + {text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              {language === "hi"
                ? "💡 प्रश्न सारांश, विस्तृत उत्तर तथा मुख्य सूत्र प्राप्त होंगे"
                : language === "sa"
                ? "💡 प्रश्नसारः, विस्तृतमुत्तरं तथा मुख्यसूत्राणि लभ्यन्ते"
                : "💡 Returns question summary, pedagogical answer & core takeaways"}
            </div>

            <div className="flex items-center gap-2">
              {onOpenImagineCreativity && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenImagineCreativity(questionText.trim() || contextQuestion?.question || "");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer"
                  title="Animate and simulate this question visually in Imagine Ur Creativity"
                >
                  <Sparkles className="w-4 h-4 fill-current text-slate-950" />
                  <span>Animate Visually ✨</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={isLoading || !questionText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm transition-all"
              >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {language === "hi"
                      ? "विश्लेषण हो रहा है..."
                      : language === "sa"
                      ? "विश्लेषणं क्रियते..."
                      : "Analyzing..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {language === "hi"
                      ? "प्रश्न पूछें और सारांश प्राप्त करें"
                      : language === "sa"
                      ? "प्रश्नं पृच्छतु सारांशं च प्राप्नोतु"
                      : "Ask & Get Question Summary"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Response Container */}
          {response && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Highlighted Question Summary Card */}
              <div className="p-4.5 bg-gradient-to-r from-amber-50 via-amber-50/50 to-orange-50/30 rounded-2xl border-2 border-amber-200/80 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-amber-900 text-sm">
                      {response.language === "hi"
                        ? "प्रश्न का मुख्य सारांश (Question Summary)"
                        : response.language === "sa"
                        ? "प्रश्नस्य संक्षेपसारः (Question Summary)"
                        : "Summary of the Question"}
                    </span>
                  </div>

                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-100/80 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm font-medium text-amber-950 leading-relaxed pl-9">
                  {response.questionSummary}
                </p>
              </div>

              {/* Comprehensive Pedagogical Answer */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>
                    {response.language === "hi"
                      ? "विस्तृत उत्तर एवं व्याख्या"
                      : response.language === "sa"
                      ? "विस्तृतमुत्तरं व्याख्या च"
                      : "Detailed Answer & Explanation"}
                  </span>
                </div>
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {response.answer}
                </div>
              </div>

              {/* Key Takeaways */}
              {response.keyTakeaways && response.keyTakeaways.length > 0 && (
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {response.language === "hi"
                        ? "मुख्य निष्कर्ष एवं सूत्र"
                        : response.language === "sa"
                        ? "मुख्यसूत्राणि निष्कर्षाः च"
                        : "Key Principles & Takeaways"}
                    </span>
                  </div>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-emerald-950">
                    {response.keyTakeaways.map((point, i) => (
                      <li key={i} className="leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Concepts */}
              {response.relatedConcepts && response.relatedConcepts.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-500 mr-1">
                    {response.language === "hi"
                      ? "सम्बद्ध संकल्पनाएँ:"
                      : response.language === "sa"
                      ? "सम्बद्धाः विषयाः:"
                      : "Related Concepts:"}
                  </span>
                  {response.relatedConcepts.map((concept, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              )}

              {/* Visualize in Imagine Ur Creativity Action Banner */}
              {onOpenImagineCreativity && (
                <div className="p-4 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 rounded-2xl border border-indigo-700/80 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                        Interactive Visual Simulation Lab
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Watch this exact question animated through an interactive, realistic physics & science lab!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenImagineCreativity(response.questionSummary || questionText.trim());
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:scale-[1.03] shadow-md shadow-amber-400/25 transition-all cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Animate in Imagine Ur Creativity ✨</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
