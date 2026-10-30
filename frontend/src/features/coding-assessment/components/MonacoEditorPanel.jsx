import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { Type, Grid3X3, Code2 } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

const MonacoEditorPanel = ({
  language = "javascript",
  onLanguageChange,
  value,
  onChange,
}) => {
  const [fontSize, setFontSize] = useState(14);
  const [showMinimap, setShowMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState("on");

  const handleEditorDidMount = useCallback((editor, monaco) => {
    monaco.editor.defineTheme("kini-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "085FA7" },
        { token: "string", foreground: "5CA347" },
        { token: "number", foreground: "F0765B" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#0F172A",
        "editor.lineHighlightBackground": "#F0F7FF",
        "editor.selectionBackground": "#085FA720",
        "editorCursor.foreground": "#085FA7",
        "editorLineNumber.foreground": "#CBD5E1",
        "editorLineNumber.activeForeground": "#085FA7",
      },
    });
    monaco.editor.setTheme("kini-light");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col bg-white"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2">
          <LanguageSelector selected={language} onSelect={onLanguageChange} />
          <div className="h-4 w-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontSize((s) => Math.max(10, s - 1))}
              className="p-1 rounded hover:bg-[#F0F7FF] text-slate-400 hover:text-[#085FA7] transition-all"
            >
              <Type className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono text-slate-500 w-6 text-center">{fontSize}</span>
            <button
              onClick={() => setFontSize((s) => Math.min(24, s + 1))}
              className="p-1 rounded hover:bg-[#F0F7FF] text-slate-400 hover:text-[#085FA7] transition-all"
            >
              <Type className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={`p-1.5 rounded transition-all ${showMinimap ? "text-[#085FA7] bg-[#F0F7FF]" : "text-slate-400 hover:text-[#085FA7]"}`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWordWrap(wordWrap === "on" ? "off" : "on")}
            className={`p-1.5 rounded transition-all ${wordWrap === "on" ? "text-[#085FA7] bg-[#F0F7FF]" : "text-slate-400 hover:text-[#085FA7]"}`}
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            minimap: { enabled: showMinimap, scale: 1 },
            wordWrap,
            lineNumbers: "on",
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            formatOnPaste: true,
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            renderLineHighlight: "line",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            folding: true,
            foldingHighlight: true,
            guides: { indentation: true, bracketPairs: true },
          }}
        />
      </div>
    </motion.div>
  );
};

export default MonacoEditorPanel;
