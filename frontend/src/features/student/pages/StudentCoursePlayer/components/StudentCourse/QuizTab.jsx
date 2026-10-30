import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaArrowRight,
  FaTrophy,
} from "react-icons/fa";

const QuizQuestion = memo(function QuizQuestion({
  question,
  index,
  total,
  selectedAnswer,
  onAnswer,
  submitted,
  correctAnswer,
}) {
  const getOptionClass = (optIndex) => {
    if (!submitted) {
      return selectedAnswer === optIndex
        ? "border-[#0f55f7] bg-[#0f55f7]/10"
        : "border-[#1F2937] hover:border-[#2A3A4E]";
    }
    if (optIndex === correctAnswer)
      return "border-[#22C55E] bg-[#22C55E]/10";
    if (selectedAnswer === optIndex && optIndex !== correctAnswer)
      return "border-[#EF4444] bg-[#EF4444]/10";
    return "border-[#1F2937] opacity-60";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">
          Question {index + 1} of {total}
        </span>
        {submitted && (
          <span
            className={`text-[10px] font-semibold ${
              selectedAnswer === correctAnswer
                ? "text-[#22C55E]"
                : "text-[#EF4444]"
            }`}
          >
            {selectedAnswer === correctAnswer ? "Correct" : "Incorrect"}
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-white">{question.question}</p>

      <div className="space-y-1.5">
        {question.options.map((opt, optIndex) => (
          <button
            key={optIndex}
            onClick={() => !submitted && onAnswer(question.id, optIndex)}
            disabled={submitted}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-all duration-200 text-xs cursor-pointer ${
              submitted ? "cursor-default" : "cursor-pointer"
            } ${getOptionClass(optIndex)}`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-medium ${
                  !submitted && selectedAnswer === optIndex
                    ? "border-[#0f55f7] bg-[#0f55f7] text-white"
                    : submitted && optIndex === correctAnswer
                    ? "border-[#22C55E] bg-[#22C55E] text-white"
                    : submitted &&
                      selectedAnswer === optIndex &&
                      optIndex !== correctAnswer
                    ? "border-[#EF4444] bg-[#EF4444] text-white"
                    : "border-[#374151] text-[#6B7280]"
                }`}
              >
                {String.fromCharCode(65 + optIndex)}
              </span>
              {opt}
              {submitted && optIndex === correctAnswer && (
                <FaCheckCircle className="text-[10px] text-[#22C55E] ml-auto" />
              )}
              {submitted &&
                selectedAnswer === optIndex &&
                optIndex !== correctAnswer && (
                  <FaTimesCircle className="text-[10px] text-[#EF4444] ml-auto" />
                )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});

const QuizTab = memo(function QuizTab({ quiz, onAnswer, answers, onSubmit, score, submitted, onReset }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz?.timeLimit * 60 || 0);

  useEffect(() => {
    if (!submitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [submitted, timeLeft, onSubmit]);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#6B7280]">No quiz available</p>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;
  const question = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;

  if (submitted) {
    const passing = score >= quiz.passingScore;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 text-center"
      >
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            passing ? "bg-[#22C55E]/20" : "bg-[#EF4444]/20"
          }`}
        >
          {passing ? (
            <FaTrophy className="text-2xl text-[#22C55E]" />
          ) : (
            <FaTimesCircle className="text-2xl text-[#EF4444]" />
          )}
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          {passing ? "Congratulations!" : "Keep Learning"}
        </h3>
        <p className="text-sm text-[#9CA3AF] mb-4">
          {passing
            ? "You passed the quiz!"
            : "You didn't pass this time. Try again."}
        </p>
        <div className="inline-flex items-center gap-3 bg-[#1E293B] rounded-xl px-6 py-3 mb-4">
          <span className="text-2xl font-bold text-white">{score}%</span>
          <span className="text-xs text-[#6B7280]">
            Passing: {quiz.passingScore}%
          </span>
        </div>
        <div className="w-full bg-[#1F2937] rounded-full h-2 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            className={`h-full rounded-full ${
              passing ? "bg-[#22C55E]" : "bg-[#EF4444]"
            }`}
          />
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-[#0f55f7] text-white text-xs font-medium hover:bg-[#0b3fc4] transition-colors cursor-pointer"
        >
          <FaRedo className="text-[10px]" />
          Retry Quiz
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#111827] border border-[#1F2937] rounded-xl p-3">
        <div className="flex items-center gap-2">
          <FaClock
            className={`text-xs ${
              timeLeft < 60 ? "text-[#EF4444] animate-pulse" : "text-[#6B7280]"
            }`}
          />
          <span
            className={`text-xs font-mono font-medium ${
              timeLeft < 60 ? "text-[#EF4444]" : "text-white"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#6B7280]">
            {answeredCount}/{quiz.questions.length} answered
          </span>
          <div className="w-20 h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(answeredCount / quiz.questions.length) * 100}%`,
              }}
              className="h-full bg-[#0f55f7] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[#111827] border border-[#1F2937] rounded-xl p-4"
        >
          <QuizQuestion
            question={question}
            index={currentIndex}
            total={quiz.questions.length}
            selectedAnswer={answers[question.id]}
            onAnswer={onAnswer}
            submitted={false}
            correctAnswer={question.correctAnswer}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-3 py-1.5 rounded-lg bg-[#1E293B] text-xs text-[#9CA3AF] hover:bg-[#2A3A4E] transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {isLast ? (
          <button
            onClick={onSubmit}
            className="px-4 py-1.5 rounded-lg bg-[#0f55f7] text-xs text-white font-medium hover:bg-[#0b3fc4] transition-all cursor-pointer"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0f55f7] text-xs text-white font-medium hover:bg-[#0b3fc4] transition-all cursor-pointer"
          >
            Next
            <FaArrowRight className="text-[9px]" />
          </button>
        )}
      </div>
    </div>
  );
});

export default QuizTab;

