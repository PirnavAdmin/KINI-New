import { AssistantProvider } from "../contexts/AssistantContext";
import { useKiniAssistantState } from "../hooks/useKiniAssistant";
import ChatWindow from "./ChatWindow";
import { useAuth } from '@shared/hooks/useAuth';

function AssistantSession() {
  const assistant = useKiniAssistantState();

  return (
    <AssistantProvider value={assistant}>
      <ChatWindow />
    </AssistantProvider>
  );
}

export default function KiniAssistant() {
  const { user, role, isAuthenticated, loading } = useAuth();
  const identity = isAuthenticated && !loading ? `${role}:${user?.userId ?? user?.id ?? user?.email}` : 'guest';
  return <AssistantSession key={identity} />;
}
