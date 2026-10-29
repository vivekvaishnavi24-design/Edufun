import React, { useState } from "react";
import {
  Printer,
  Copy,
  Check,
  X,
  FileText,
  Key,
  BookOpen
} from "lucide-react";
import { GeneratedQuiz } from "../types";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: GeneratedQuiz;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  quiz
}) => {
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    let md = `# ${quiz.title}\n\n`;
    if (quiz.subjectName) md += `**Academic Discipline:** ${quiz.subjectName}${quiz.educationLevel ? ` (${quiz.educationLevel.replace("_", " ")})` : ""}\n\n`;
    if (quiz.documentName) md += `**Source:** ${quiz.documentName}\n\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
    md += `## Practice Questions\n\n`;

    quiz.questions.forEach((q, idx) => {
      md += `### ${idx + 1}. [${q.type === "mcq" ? "MCQ" : "True/False"}] ${q.question}\n\n`;
      q.options.forEach((opt, optIdx) => {
        const letter = q.type === "mcq" ? `${String.fromCharCode(65 + optIdx)}.` : "-";
        md += `  ${letter} [ ] ${opt}\n`;
      });
      md += `\n`;
    });

    if (includeAnswerKey) {
      md += `\n---\n\n## Answer Key & Explanations\n\n`;
      quiz.questions.forEach((q, idx) => {
        md += `**Question ${idx + 1}:** ${q.correctAnswer}\n`;
        md += `*Explanation:* ${q.explanation}\n\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="print-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Print & Export Practice Test
              </h2>
              <p className="text-xs text-slate-500">
                Generate a printable paper test sheet or copy formatted questions
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

        {/* Modal Controls */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeAnswerKey}
              onChange={(e) => setIncludeAnswerKey(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="font-semibold text-slate-700">
              Append Answer Key & Explanations to bottom
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* Printable Preview Sheet */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 print:p-0 print:space-y-4">
          {/* Header of Test Sheet */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {quiz.title}
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Source Material: {quiz.documentName || "Class Study Notes"} • Total Questions: {quiz.questions.length}
                </p>
              </div>
              <div className="text-right text-xs space-y-1 text-slate-600 border border-slate-300 p-2 rounded-md">
                <div>Name: ______________________</div>
                <div>Date: ______________________</div>
                <div>Score: _______ / {quiz.questions.length}</div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-5">
            {quiz.questions.map((q, idx) => {
              const isTrueFalse = q.type === "true_false" || (q.options?.length === 2 && (q.options.includes("True") || q.options.includes("False")));
              const isTyped = q.type === "typed";
              const printOptions = isTrueFalse
                ? ["True", "False"]
                : (q.options || []).filter((o) => !o.toLowerCase().startsWith("alternative"));

              return (
                <div key={q.id} className="text-sm">
                  <div className="font-semibold text-slate-900 mb-2">
                    {idx + 1}. {q.question}
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      [{isTrueFalse ? "True / False" : isTyped ? "Short Answer" : "Multiple Choice"}]
                    </span>
                  </div>

                  {isTyped ? (
                    <div className="pl-4 py-2 text-xs text-slate-600 font-mono">
                      Answer: _________________________________________________
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                      {printOptions.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 text-xs text-slate-800">
                          <div className="w-4 h-4 rounded-full border border-slate-400 shrink-0" />
                          <span>
                            {!isTrueFalse ? `${String.fromCharCode(65 + optIdx)}. ` : ""}
                            {opt}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Answer Key */}
          {includeAnswerKey && (
            <div className="pt-8 mt-8 border-t-2 border-dashed border-slate-300">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Answer Key & Conceptual Explanations
                </h3>
              </div>

              <div className="space-y-4">
                {quiz.questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900">
                      Question {idx + 1}: <span className="text-emerald-700 font-extrabold">{q.correctAnswer}</span>
                    </div>
                    <div className="text-slate-700 mt-1">
                      {q.explanation}
                    </div>
                    {q.sourceReference && (
                      <div className="text-slate-500 mt-1 italic">
                        Reference: {q.sourceReference}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
