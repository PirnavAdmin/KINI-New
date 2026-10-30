import SuggestionCards from "./SuggestionCards";

export default function QuickActions({ items = [], onPick }) {
  return <SuggestionCards suggestions={items} onPick={onPick} />;
}
