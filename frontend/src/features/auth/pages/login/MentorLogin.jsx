import { ROUTES } from "@shared/constants/routeConstants";
import Login from "./Login";

export default function MentorLogin() {
  return (
    <Login
      forcedRole="mentor"
      title="Mentor Login"
      subtitle="Sign in to continue mentoring students."
      redirectPath={ROUTES.MENTOR.DASHBOARD}
    />
  );
}
