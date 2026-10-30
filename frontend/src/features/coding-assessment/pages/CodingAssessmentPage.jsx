import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRightOpen, PanelRightClose } from "lucide-react";

import AssessmentNavbar from "../components/AssessmentNavbar";
import QuestionSidebar from "../components/QuestionSidebar";
import QuestionPanel from "../components/QuestionPanel";
import MonacoEditorPanel from "../components/MonacoEditorPanel";
import TestCases from "../components/TestCases";
import OutputConsole from "../components/OutputConsole";
import ActionBar from "../components/ActionBar";
import { CODING_QUESTIONS } from "../data/codingQuestions";
import { aiApi, getApiErrorMessage } from "@shared/services/apiServices";

const CodingAssessmentPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState({});
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [outputStatus, setOutputStatus] = useState("idle");
  const [outputText, setOutputText] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [leftWidth, setLeftWidth] = useState(40);
  const splitRef = useRef(null);

  const currentQ = CODING_QUESTIONS[currentIndex];
  const totalQuestions = CODING_QUESTIONS.length;

  const currentCode = code[currentQ?.id] || currentQ?.starterCode?.[language] || "";

  const handleCodeChange = useCallback((newCode) => {
    setCode((prev) => ({ ...prev, [currentQ.id]: newCode }));
  }, [currentQ.id]);

  const handleLanguageChange = useCallback((newLang) => {
    setLanguage(newLang);
    if (!code[currentQ.id]) {
      setCode((prev) => ({
        ...prev,
        [currentQ.id]: currentQ?.starterCode?.[newLang] || "",
      }));
    }
  }, [currentQ, code]);

  const toggleReview = useCallback(() => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  }, [currentQ.id]);

  const evaluateCode = useCallback(async (isSubmission = false) => {
    setIsRunning(true);
    setOutputStatus("running");
    setOutputText("");
    try {
      const response = await aiApi.chat(`Evaluate this ${language} solution against every supplied test case. Return JSON only in this exact shape: {"results":[{"passed":true,"output":"actual output"}]}. Do not include markdown.\nProblem: ${currentQ.title}\nCode:\n${currentCode}\nTest cases:\n${JSON.stringify(currentQ.testCases.map(({ input, expected }) => ({ input, expected })))}`);
      const raw = response?.response ?? response?.message ?? response?.answer ?? response?.text ?? response;
      const parsed = typeof raw === "string"
        ? JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""))
        : raw;
      const results = currentQ.testCases.map((testCase, index) => ({
        passed: Boolean(parsed?.results?.[index]?.passed),
        output: String(parsed?.results?.[index]?.output ?? "No output"),
        runtime: testCase.runtime,
        memory: testCase.memory,
      }));
      const allPassed = results.length > 0 && results.every((result) => result.passed);
      setTestResults(results);
      setOutputStatus(allPassed ? "accepted" : "wrong");
      setOutputText(allPassed ? "All test cases passed by API evaluation." : "Some test cases failed. Check the test case results.");
      if (isSubmission) setAnswers((prev) => ({ ...prev, [currentQ.id]: allPassed }));
    } catch (error) {
      setOutputStatus("wrong");
      setOutputText(getApiErrorMessage(error, "Code evaluation is currently unavailable."));
      setTestResults(null);
    } finally {
      setIsRunning(false);
    }
  }, [currentQ, currentCode, language]);

  const handleRun = useCallback(() => evaluateCode(false), [evaluateCode]);
  const handleSubmit = useCallback(() => evaluateCode(true), [evaluateCode]);

  const handleReset = useCallback(() => {
    setCode((prev) => ({
      ...prev,
      [currentQ.id]: currentQ?.starterCode?.[language] || "",
    }));
    setOutputStatus("idle");
    setOutputText("");
    setTestResults(null);
  }, [currentQ, language]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setOutputStatus("idle");
      setOutputText("");
      setTestResults(null);
    }
  }, [currentIndex, totalQuestions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setOutputStatus("idle");
      setOutputText("");
      setTestResults(null);
    }
  }, [currentIndex]);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    const onMove = (me) => {
      if (!splitRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const newWidth = ((me.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.max(20, Math.min(60, newWidth)));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] overflow-hidden">
      <AssessmentNavbar
        assessmentName="Coding Assessment"
        questionCount={totalQuestions}
        answeredCount={Object.keys(answers).length}
        timeMinutes={45}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleReview={toggleReview}
        isReviewing={markedForReview.has(currentQ?.id)}
        onSubmit={handleSubmit}
        onTimeUp={handleSubmit}
      />

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 overflow-hidden"
            >
              <QuestionSidebar
                questions={CODING_QUESTIONS}
                currentIndex={currentIndex}
                onSelect={(idx) => {
                  setCurrentIndex(idx);
                  setOutputStatus("idle");
                  setOutputText("");
                  setTestResults(null);
                }}
                answers={answers}
                markedForReview={markedForReview}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="flex items-center justify-center w-5 bg-white border-r border-[#E5E7EB] hover:bg-blue-50 transition-colors text-slate-400 hover:text-[#085FA7] shrink-0"
        >
          {showSidebar ? <PanelRightClose className="w-3 h-3" /> : <PanelRightOpen className="w-3 h-3" />}
        </button>

        <div ref={splitRef} className="flex-1 flex overflow-hidden">
          <div
            className="overflow-hidden border-r border-[#E5E7EB] bg-white"
            style={{ width: `${leftWidth}%` }}
          >
            <QuestionPanel question={currentQ} />
          </div>

          <div
            onMouseDown={handleResizeStart}
            className="w-1 bg-transparent hover:bg-[#085FA7]/30 cursor-col-resize transition-colors shrink-0 relative group"
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 group-hover:bg-[#085FA7]/10 transition-colors" />
          </div>

          <div
            className="flex flex-col overflow-hidden bg-white"
            style={{ width: `${100 - leftWidth}%` }}
          >
            <div className="flex-1 overflow-hidden">
              <MonacoEditorPanel
                language={language}
                onLanguageChange={handleLanguageChange}
                value={currentCode}
                onChange={handleCodeChange}
              />
            </div>

            <div className="h-56 border-t border-[#E5E7EB] flex bg-white">
              <div className="flex-1 border-r border-[#E5E7EB] overflow-hidden">
                <TestCases testCases={currentQ?.testCases} results={testResults} />
              </div>
              <div className="flex-1 overflow-hidden">
                <OutputConsole
                  status={outputStatus}
                  output={outputText}
                  runtime={currentQ?.testCases?.[0]?.runtime}
                  memory={currentQ?.testCases?.[0]?.memory}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActionBar
        onRun={handleRun}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onPrev={handlePrev}
        onNext={handleNext}
        onToggleReview={toggleReview}
        isReviewing={markedForReview.has(currentQ?.id)}
        canGoPrev={currentIndex > 0}
        canGoNext={currentIndex < totalQuestions - 1}
        isRunning={isRunning}
      />
    </div>
  );
};

export default CodingAssessmentPage;
