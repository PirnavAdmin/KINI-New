import Login from "./Login";

export default function EmployeeLogin() {
  return (
    <Login
      forcedRole="employee"
      title="Employee Login"
      subtitle="Sign in to access your workspace."
    />
  );
}
