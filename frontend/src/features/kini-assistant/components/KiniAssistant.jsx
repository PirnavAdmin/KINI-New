import { AssistantProvider } from "../contexts/AssistantContext";
import { useKiniAssistantState } from "../hooks/useKiniAssistant";
import ChatWindow from "./ChatWindow";

export default function KiniAssistant() {
  const assistant = useKiniAssistantState();

  return (
    <AssistantProvider value={assistant}>
      <ChatWindow />
    </AssistantProvider>
  );
}
