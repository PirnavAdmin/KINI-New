/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

export const AssistantContext = createContext(null);

export function AssistantProvider({ value, children }) {
  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistantContext() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistantContext must be used within an AssistantProvider.");
  }
  return context;
}

export default AssistantContext;
