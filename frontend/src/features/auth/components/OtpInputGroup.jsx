import { forwardRef, useImperativeHandle, useRef } from "react";
import PropTypes from "prop-types";

const OTP_LENGTH = 6;

const OtpInputGroup = forwardRef(function OtpInputGroup(
  { value, onChange, hasError = false, disabled = false },
  forwardedRef
) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => String(value[index] || "").slice(-1));

  useImperativeHandle(forwardedRef, () => ({
    focusFirst: () => inputRefs.current[0]?.focus(),
  }));

  const updateAt = (index, rawValue) => {
    const numericValue = rawValue.replace(/\D/g, "");
    if (numericValue.length > 1) {
      const next = Array(OTP_LENGTH).fill("");
      numericValue.slice(0, OTP_LENGTH).split("").forEach((digit, digitIndex) => {
        next[digitIndex] = digit;
      });
      onChange(next);
      inputRefs.current[Math.min(numericValue.length, OTP_LENGTH) - 1]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = numericValue.slice(-1);
    onChange(next);
    if (numericValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        onChange(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      event.preventDefault();
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => { next[index] = digit; });
    onChange(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  return (
    <div className="grid w-full grid-cols-6 gap-2 sm:gap-2.5" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => { inputRefs.current[index] = element; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => updateAt(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onFocus={(event) => event.target.select()}
          aria-label={`Verification code digit ${index + 1}`}
          aria-invalid={hasError}
          className={`aspect-square min-w-0 w-full rounded-xl border bg-white text-center text-lg font-extrabold text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950 dark:text-white ${
            hasError
              ? "border-red-400 ring-1 ring-red-200 focus:border-red-500 focus:ring-red-200 dark:ring-red-500/20"
              : digit
                ? "border-blue-500 bg-blue-50/60 focus:ring-blue-200 dark:bg-blue-500/10 dark:focus:ring-blue-500/30"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-200 dark:border-slate-700 dark:focus:ring-blue-500/30"
          }`}
        />
      ))}
    </div>
  );
});

OtpInputGroup.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  hasError: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default OtpInputGroup;
