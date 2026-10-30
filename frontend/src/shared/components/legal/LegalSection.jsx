import { useState } from "react";
import AgreementCheckbox from "./AgreementCheckbox";
import TermsModal from "./TermsModal";
import PrivacyModal from "./PrivacyModal";

/**
 * LegalSection — Combined Terms & Conditions + Privacy Policy experience
 *
 * Integrates the agreement checkbox, Terms modal, and Privacy modal
 * into a single self-contained component.
 *
 * Props:
 *   register  → react-hook-form register function for "agreeTerms"
 *   errors    → react-hook-form errors object
 */
const LegalSection = ({ register, errors }) => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <AgreementCheckbox
        register={register("agreeTerms", {
          required: "You must accept the Terms & Conditions",
        })}
        error={errors.agreeTerms?.message}
        onOpenTerms={() => setShowTerms(true)}
        onOpenPrivacy={() => setShowPrivacy(true)}
      />

      {/* Terms & Conditions Modal */}
      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
    </>
  );
};

export default LegalSection;
