import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@shared/constants/routeConstants";
import { getSafeLoginRoute, RECOVERY_STORAGE_KEYS } from "../utils/recoveryNavigation";

export default function ForgotPasswordLink({ className = "", returnTo: explicitReturnTo }) {
  const location = useLocation();
  const navigate = useNavigate();

  const openRecovery = () => {
    const returnTo = getSafeLoginRoute(explicitReturnTo || location.pathname);
    sessionStorage.setItem(RECOVERY_STORAGE_KEYS.returnTo, returnTo);
    navigate(ROUTES.AUTH.FORGOT_PASSWORD, { state: { returnTo } });
  };

  return (
    <button type="button" onClick={openRecovery} className={className}>
      Forgot Password?
    </button>
  );
}

ForgotPasswordLink.propTypes = {
  className: PropTypes.string,
  returnTo: PropTypes.string,
};
