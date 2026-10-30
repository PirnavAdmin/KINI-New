import { ROUTES } from "@shared/constants/routeConstants";
import Login from "./Login";

export default function OrganizationLogin() {
  return (
    <Login
      forcedRole="org-admin"
      title="Organization Login"
      subtitle="Sign in to continue your organization journey"
      showFooter={false}
      redirectPath={ROUTES.ORG_ADMIN.DASHBOARD}
      useOrganizationLoginEndpoint
    />
  );
}
