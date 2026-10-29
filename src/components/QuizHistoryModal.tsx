import React from "react";
import {
  History,
  X,
  BookOpen,
  Trash2,
  Calendar,
  CheckCircle2,
  Play,
  Award
} from "lucide-react";
import { GeneratedQuiz } from "../types";
import { getSavedQuizzes, deleteQuiz } from "../utils/storage";

interface QuizHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuiz: (quiz: GeneratedQuiz) => void;
  currentQuizId?: string;
  onRefreshList?: () => void;
}

export const QuizHistoryModal: React.FC<QuizHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectQuiz,
  currentQuizId
}) => {
  const [quizzes, setQuizzes] = React.useState<GeneratedQuiz[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setQuizzes(getSavedQuizzes());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, quizId: string) => {
    e.stopPropagation();
    deleteQuiz(quizId);
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  return (
    <div
      id="history-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Saved Tests & Quiz History
              </h2>
              <p className="text-xs text-slate-500">
                Revisit previously generated practice tests or review questions
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

        {/* Content List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {quizzes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No saved quizzes found yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Upload a PDF or choose a sample guide to generate your first test!
              </p>
            </div>
          ) : (
            quizzes.map((quiz) => {
              const isCurrent = quiz.id === currentQuizId;
              const mcqCount = quiz.questions.filter((q) => q.type === "mcq").length;
              const tfCount = quiz.questions.filter((q) => q.type === "true_false").length;

              return (
                <div
                  key={quiz.id}
                  onClick={() => {
                    onSelectQuiz(quiz);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between gap-4 ${
                    isCurrent
                      ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          Active Test
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {quiz.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {quiz.summary}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">
                        {quiz.questions.length} Questions
                      </span>
                      <span>•</span>
                      <span>{mcqCount} MCQ</span>
                      <span>•</span>
                      <span>{tfCount} True/False</span>
                      {quiz.documentName && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{quiz.documentName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <button
                      onClick={(e) => handleDelete(e, quiz.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
