import PropTypes from "prop-types";
import { Check, CheckCheck, Clock3 } from "lucide-react";

export default function MessageStatus({ status }) {
  if (status === "pending") {
    return <Clock3 className="h-3 w-3" />;
  }

  if (status === "sent") {
    return <Check className="h-3 w-3" />;
  }

  return (
    <CheckCheck
      className={`h-3.5 w-3.5 ${status === "read" ? "text-cyan-200" : "text-current"}`}
    />
  );
}

MessageStatus.propTypes = {
  status: PropTypes.string,
};

