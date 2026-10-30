import { BookOpen } from "lucide-react";
import { FaJava } from "react-icons/fa";
import {
  SiAngular,
  SiDocker,
  SiDotnet,
  SiFigma,
  SiJavascript,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTypescript,
} from "react-icons/si";

// Keyword → brand icon. Order matters: the first match wins.
const TECH = [
  { test: /react/i, icon: SiReact, color: "#149ECA", soft: "#E6F6FC" },
  { test: /angular/i, icon: SiAngular, color: "#DD0031", soft: "#FDE8EC" },
  { test: /node/i, icon: SiNodedotjs, color: "#5FA04E", soft: "#EDF7EA" },
  { test: /typescript/i, icon: SiTypescript, color: "#3178C6", soft: "#E8F0FB" },
  { test: /javascript|\bjs\b/i, icon: SiJavascript, color: "#E0B400", soft: "#FFF8DC" },
  { test: /python|data science|machine learning|\bai\b/i, icon: SiPython, color: "#3776AB", soft: "#E9F1F9" },
  { test: /\.net|dotnet|c#/i, icon: SiDotnet, color: "#512BD4", soft: "#EEE9FC" },
  { test: /java/i, icon: FaJava, color: "#E76F00", soft: "#FFF1E3" },
  { test: /ui\/?ux|design|figma/i, icon: SiFigma, color: "#F24E1E", soft: "#FFEDE8" },
  { test: /devops|docker|cloud/i, icon: SiDocker, color: "#2496ED", soft: "#E7F3FD" },
];

const FALLBACK = { icon: BookOpen, color: "#133B5D", soft: "#EAF1F8" };

export const resolveCourseTech = (name = "") =>
  TECH.find((item) => item.test.test(String(name))) || FALLBACK;

