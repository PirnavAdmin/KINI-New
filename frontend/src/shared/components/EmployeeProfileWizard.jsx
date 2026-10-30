import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, FileText, Trash2, Upload, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";

const steps = ["Personal Info", "Bank Info", "Education", "Experience", "Documents", "Review"];
const personalFields = [
  ["First name", "firstName"], ["Middle name", "middleName"], ["Last name", "lastName"],
  ["Gender", "gender"], ["Marital status", "maritalStatus"], ["Date of birth", "dateOfBirth", "date"],
  ["Phone", "phone"], ["Email", "email", "email"], ["Aadhaar number", "aadhaarNumber"], ["PAN number", "panNumber"],
  ["Department", "department"], ["Designation", "designation"], ["Date of joining", "joiningDate", "date"], ["Blood group", "bloodGroup"],
  ["House number", "houseNumber"], ["Street / Area", "streetArea"], ["City / Village", "city"], ["District", "district"],
  ["State", "state"], ["Country", "country"], ["Pincode", "pincode"],
];
const bankFields = [["Customer ID", "customerId"], ["Bank name", "bankName"], ["Account holder name", "accountHolderName"], ["Account number", "accountNumber"], ["IFSC code", "ifscCode"], ["Branch name", "branchName"], ["UAN number", "uanNumber"], ["PF account number", "pfAccountNumber"], ["Annual CTC", "annualCtc", "number"], ["Basic salary (monthly)", "basicSalary", "number"], ["HRA (monthly)", "hra", "number"], ["Conveyance allowance", "conveyanceAllowance", "number"], ["Medical allowance", "medicalAllowance", "number"], ["Special allowance", "specialAllowance", "number"], ["Employee PF", "employeePf", "number"], ["Employer PF", "employerPf", "number"], ["Professional tax", "professionalTax", "number"], ["TDS", "tds", "number"], ["Other deduction", "otherDeduction", "number"]];
const cappedAllowanceFields = ["medicalAllowance", "employeePf"];
const currencyFields = [
  "annualCtc", "basicSalary", "hra", "conveyanceAllowance", "medicalAllowance",
  "specialAllowance", "employeePf", "employerPf", "professionalTax", "tds", "otherDeduction",
];
const nonNegativeCurrencyFields = currencyFields.filter((key) => key !== "basicSalary");
const emptyEntry = { qualification: "", institution: "", year: "", percentage: "", specialization: "" };
const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0F55F7] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
const REQUIRED_PERSONAL_FIELDS = personalFields
  .map(([, key]) => key)
  .filter((key) => key !== "middleName");
const REQUIRED_BANK_FIELDS = ["bankName", "accountHolderName", "accountNumber", "ifscCode", "branchName"];
const PERSONAL_SELECT_OPTIONS = {
  gender: ["Male", "Female", "Non-binary", "Prefer not to say"],
  maritalStatus: ["Single", "Married", "Divorced", "Widowed"],
  bloodGroup: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  state: [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  ],
  district: [
    "Alluri Sitharama Raju", "Anakapalli", "Anantapur", "Bapatla", "Chittoor",
    "East Godavari", "Eluru", "Guntur", "Kakinada", "Krishna", "Kurnool",
    "Nandyal", "Nellore", "Palnadu", "Prakasam", "Sri Sathya Sai", "Srikakulam",
    "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa",
    "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial",
    "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy",
    "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahbubnagar",
    "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool",
    "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla",
    "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy",
    "Warangal", "Yadadri Bhuvanagiri",
  ],
  country: ["India", "United States", "United Kingdom", "United Arab Emirates", "Australia", "Canada", "Singapore"],
};
const DEFAULT_DESIGNATIONS = [
  "HR Executive", "HR Manager", "Recruiter", "Accountant", "Developer",
  "Designer", "Operations Executive", "Support Executive", "Team Lead",
];
const DEFAULT_DEPARTMENTS = [
  "Human Resources", "Administration", "Finance", "Operations", "Academic",
  "Sales", "Marketing", "Information Technology", "Support",
];

const value = (record, key) => {
  if (!record) return "";
  const matchingKey = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
  return [record[key], record[key[0].toUpperCase() + key.slice(1)], matchingKey ? record[matchingKey] : undefined]
    .find((candidate) => candidate !== undefined && candidate !== null && candidate !== "") ?? "";
};
const personalValidation = (record) => {
  const errors = {};
  REQUIRED_PERSONAL_FIELDS.forEach((key) => {
    if (!String(value(record, key)).trim()) errors[key] = "This field is required.";
  });
  if (record.phone && !/^\d{10}$/.test(String(record.phone))) errors.phone = "Enter exactly 10 digits.";
  if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(record.email))) errors.email = "Enter a valid email address.";
  if (record.aadhaarNumber && !/^\d{12}$/.test(String(record.aadhaarNumber))) errors.aadhaarNumber = "Aadhaar must contain exactly 12 digits.";
  if (record.panNumber && !/^[A-Z]{5}\d{4}[A-Z]$/.test(String(record.panNumber).toUpperCase())) errors.panNumber = "PAN format must be ABCDE1234F.";
  if (record.pincode && !/^\d{6}$/.test(String(record.pincode))) errors.pincode = "Pincode must contain exactly 6 digits.";
  return errors;
};
const bankValidation = (record) => {
  const errors = {};
  REQUIRED_BANK_FIELDS.forEach((key) => {
    if (!String(value(record, key)).trim()) errors[key] = "This field is required.";
  });
  if (record.accountNumber && !/^\d{9,18}$/.test(String(record.accountNumber))) errors.accountNumber = "Account number must contain 9 to 18 digits.";
  if (record.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(record.ifscCode).toUpperCase())) errors.ifscCode = "IFSC format must be ABCD0123456.";
  if (record.uanNumber && !/^\d{12}$/.test(String(record.uanNumber))) errors.uanNumber = "UAN must contain exactly 12 digits.";
  if (record.pfAccountNumber && !/^[A-Z]{2}\/?[A-Z]{3}\/?\d{7}\/?\d{3}\/?\d{7}$/i.test(String(record.pfAccountNumber))) {
    errors.pfAccountNumber = "Enter a valid EPF/PF member ID.";
  }
  if (record.branchName && !/^[A-Za-z0-9 .&'()\-]{1,100}$/.test(String(record.branchName))) {
    errors.branchName = "Use letters, numbers, spaces and - . & ' ( ) only.";
  }
  currencyFields.forEach((key) => {
    const amount = String(value(record, key)).trim();
    if (!amount) return;
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || (key === "basicSalary" ? Number(amount) <= 0 : Number(amount) < 0)) {
      errors[key] = key === "basicSalary" ? "Basic salary must be greater than zero." : "Enter a valid non-negative amount.";
    }
    if (cappedAllowanceFields.includes(key) && !/^\d{1,7}(\.\d{1,2})?$/.test(amount)) {
      errors[key] = "Enter a non-negative amount up to 7 digits.";
    }
  });
  return errors;
};
const meaningfulText = (text) => {
  const normalized = String(text || "").trim();
  return normalized.length >= 2 && /[A-Za-z]/.test(normalized) && !/^(.)\1+$/.test(normalized);
};
const educationValidation = (entries = []) => {
  const errors = {};
  entries.forEach((entry, index) => {
    ["qualification", "institution", "specialization"].forEach((key) => {
      if (entry[key] && !meaningfulText(entry[key])) errors[`education.${index}.${key}`] = "Enter meaningful text.";
    });
    if (entry.year && !/^\d{4}$/.test(String(entry.year))) errors[`education.${index}.year`] = "Year must contain 4 digits.";
    if (entry.percentage !== "" && entry.percentage != null && (!/^\d+(\.\d{1,2})?$/.test(String(entry.percentage)) || Number(entry.percentage) > 100)) {
      errors[`education.${index}.percentage`] = "Percentage must be between 0 and 100.";
    }
  });
  return errors;
};
const experienceValidation = (entries = []) => {
  const errors = {};
  entries.forEach((entry, index) => {
    ["companyName", "designation", "reasonForLeaving", "description"].forEach((key) => {
      if (entry[key] && !meaningfulText(entry[key])) errors[`experience.${index}.${key}`] = "Enter meaningful text.";
    });
    if (entry.fromDate && entry.toDate && entry.toDate < entry.fromDate) errors[`experience.${index}.toDate`] = "To date must be on or after From date.";
    if (entry.yearsOfExperience !== "" && Number(entry.yearsOfExperience) < 0) errors[`experience.${index}.yearsOfExperience`] = "Years cannot be negative.";
  });
  return errors;
};
const validationForStep = (record, stepIndex) => (
  stepIndex === 0 ? personalValidation(record)
    : stepIndex === 1 ? bankValidation(record)
      : stepIndex === 2 ? educationValidation(record.education)
        : stepIndex === 3 ? experienceValidation(record.experience)
          : {}
);
const sanitizeFieldValue = (key, raw) => {
  let next = String(raw ?? "");
  if (["phone", "aadhaarNumber", "pincode", "accountNumber", "uanNumber"].includes(key)) {
    next = next.replace(/\D/g, "").slice(0, key === "phone" ? 10 : key === "aadhaarNumber" ? 12 : key === "pincode" ? 6 : key === "uanNumber" ? 12 : 18);
  }
  if (currencyFields.includes(key)) {
    next = next.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    const [whole, decimal] = next.split(".");
    next = `${whole.slice(0, cappedAllowanceFields.includes(key) ? 7 : 12)}${decimal === undefined ? "" : `.${decimal.slice(0, 2)}`}`;
  }
  if (key === "customerId") next = next.replace(/[^a-z0-9\-/]/gi, "").slice(0, 30);
  if (key === "pfAccountNumber") next = next.replace(/[^a-z0-9\-/]/gi, "").toUpperCase().slice(0, 22);
  if (key === "ifscCode") {
    const characters = next.toUpperCase().replace(/[^A-Z0-9]/g, "").split("");
    const bankCode = characters.slice(0, 4).filter((character) => /[A-Z]/.test(character)).join("");
    const branchCode = characters.slice(4).filter((character) => /[A-Z0-9]/.test(character)).slice(1, 7).join("");
    next = `${bankCode}${bankCode.length === 4 && characters.length >= 5 ? "0" : ""}${branchCode}`.slice(0, 11);
  }
  if (key === "panNumber") next = next.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 10);
  if (key === "accountHolderName") next = next.replace(/[^a-z\s.'-]/gi, "").slice(0, 100);
  if (key === "branchName") next = next.replace(/[^a-z0-9 .&'()\-]/gi, "").slice(0, 100);
  if (key === "bankName") next = next.slice(0, 100);
  if (key === "email") next = next.slice(0, 254);
  return next;
};
const normalizeOption = (item) => {
  if (typeof item === "string") return { label: item, value: item };
  if (!item || typeof item !== "object") return null;
  const label = item.label ?? item.name ?? item.value ?? "";
  return { label, value: item.value ?? item.id ?? label };
};

export default function EmployeeProfileWizard({
  initialData = {},
  onSave,
  onComplete,
  title = "Complete your profile",
  readOnly = false,
  departmentOptions = [],
  documentTypes = [],
  onDownloadDocument,
  onDeleteDocument,
}) {
  const [step, setStep] = useState(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(() => ({
    ...initialData,
    ...Object.fromEntries([...personalFields, ...bankFields].map(([, key]) => [key, sanitizeFieldValue(key, value(initialData, key))])),
    education: initialData.education || [],
    experience: initialData.experience || [],
    documents: initialData.documents || [],
  }));
  const [newFile, setNewFile] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const fileInputRef = useRef(null);
  const current = steps[step];
  const name = useMemo(() => [form.firstName, form.lastName].filter(Boolean).join(" ") || "Employee profile", [form.firstName, form.lastName]);
  const normalizedDepartments = useMemo(() => departmentOptions.map(normalizeOption).filter(Boolean), [departmentOptions]);
  const normalizedDocumentTypes = useMemo(() => documentTypes.map(normalizeOption).filter(Boolean), [documentTypes]);

  const setField = (key, next) => {
    setForm((old) => {
      const updated = { ...old, [key]: next };
      if (key !== "middleName") {
        const fieldErrors = step === 1 ? bankValidation(updated) : personalValidation(updated);
        setErrors((current) => ({ ...current, [key]: fieldErrors[key] }));
        if (maxUnlockedStep > 0 && Object.keys(personalValidation(updated)).length > 0) {
          setMaxUnlockedStep(0);
        }
      }
      return updated;
    });
  };

  useEffect(() => {
    if (!selectedDocumentType && normalizedDocumentTypes[0]?.value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDocumentType(normalizedDocumentTypes[0].value);
    }
  }, [normalizedDocumentTypes, selectedDocumentType]);

  const saveAndNext = async () => {
    const validationErrors = validationForStep(form, step);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error(`Please complete the highlighted ${current.toLowerCase()} fields.`);
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      await onSave?.(form, current, step);
      if (step === steps.length - 1) {
        if (onComplete) await onComplete(form);
        else setStep(0);
        return;
      }
      setStep((old) => {
        const nextStep = Math.min(old + 1, steps.length - 1);
        setMaxUnlockedStep((currentMax) => Math.max(currentMax, nextStep));
        return nextStep;
      });
    } catch (error) {
      setErrors((currentErrors) => ({ ...currentErrors, save: error?.message || "Unable to save profile. Please try again." }));
    } finally {
      setSaving(false);
    }
  };

  const downloadProfilePdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const labelFor = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
    let y = 18;
    const ensureSpace = (height = 8) => {
      if (y + height > 282) { doc.addPage(); y = 18; }
    };
    const addHeading = (heading) => {
      ensureSpace(14);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 85, 247);
      doc.text(heading, 15, y);
      y += 7;
    };
    const addRow = (rowLabel, rowValue) => {
      const text = String(rowValue ?? "").trim();
      if (!text) return;
      const lines = doc.splitTextToSize(`${rowLabel}: ${text}`, 175);
      ensureSpace(lines.length * 5 + 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(lines, 18, y);
      y += lines.length * 5 + 1;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 42, 74);
    doc.text("EMPLOYEE PROFILE", 15, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(name, 15, y);
    y += 6;

    addHeading("Personal Information");
    personalFields.forEach(([fieldLabel, key]) => addRow(fieldLabel, value(form, key)));

    addHeading("Education");
    if (!(form.education || []).length) addRow("Status", "No education details provided");
    (form.education || []).forEach((entry, index) => {
      addRow(`Education ${index + 1}`, [entry.qualification, entry.specialization, entry.institution, entry.year, entry.percentage ? `${entry.percentage}%` : ""].filter(Boolean).join(" | "));
    });

    addHeading("Experience");
    if (!(form.experience || []).length) addRow("Status", "No experience details provided");
    (form.experience || []).forEach((entry, index) => {
      addRow(`Experience ${index + 1}`, [entry.companyName, entry.designation, entry.fromDate && `From ${entry.fromDate}`, entry.currentlyWorking ? "Present" : entry.toDate && `To ${entry.toDate}`, entry.yearsOfExperience && `${entry.yearsOfExperience} years`, entry.description].filter(Boolean).join(" | "));
    });

    addHeading("Documents");
    if (!(form.documents || []).length) addRow("Status", "No documents provided");
    (form.documents || []).forEach((document, index) => {
      addRow(`Document ${index + 1}`, [document.name, document.type, document.status, document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString("en-IN") : ""].filter(Boolean).join(" | "));
    });

    doc.save(`${name.replace(/\s+/g, "-").toLowerCase()}-profile.pdf`);
  };

  const addFile = () => {
    if (!newFile) return toast.error("Choose a document before uploading.");
    if (!selectedDocumentType && normalizedDocumentTypes.length) return toast.error("Select a document type.");
    if (!/^\.(pdf|png|jpg|jpeg)$/i.test(newFile.name.slice(newFile.name.lastIndexOf(".")))) {
      return toast.error("Upload a PDF, PNG or JPG file.");
    }
    if (newFile.size > 3 * 1024 * 1024) {
      toast.error("File size must be 3 MB or less.");
      return;
    }
    setForm((old) => ({
      ...old,
      documents: [
        ...(old.documents || []),
        {
          name: newFile.name,
          type: selectedDocumentType || newFile.type,
          size: newFile.size,
          uploadedAt: new Date().toISOString(),
          file: newFile,
        },
      ],
    }));
    setNewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateEducation = (index, key, rawValue) => {
    const nextValue = key === "year" ? String(rawValue).replace(/\D/g, "").slice(0, 4)
      : key === "percentage" ? String(rawValue).replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").slice(0, 6)
        : String(rawValue).slice(0, 150);
    setForm((old) => ({ ...old, education: old.education.map((item, i) => (i === index ? { ...item, [key]: nextValue } : item)) }));
  };

  const updateExperience = (index, key, rawValue) => {
    setForm((old) => {
      const experience = old.experience.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [key]: rawValue };
        if (key === "currentlyWorking" && rawValue) updated.toDate = "";
        if (key === "fromDate" || key === "toDate") {
          const from = new Date(updated.fromDate);
          const to = new Date(updated.toDate || new Date());
          updated.yearsOfExperience = updated.fromDate && !Number.isNaN(from.getTime()) && to >= from
            ? ((to - from) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1)
            : "";
        }
        if (key === "currentlyWorking" && rawValue && updated.fromDate) {
          const from = new Date(updated.fromDate);
          updated.yearsOfExperience = !Number.isNaN(from.getTime())
            ? ((new Date() - from) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1)
            : "";
        }
        return updated;
      });
      return { ...old, experience };
    });
  };

  const renderFields = (fields) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([label, key, type = "text"]) => {
        const selectOptions = key === "department"
          ? (normalizedDepartments.length ? normalizedDepartments : DEFAULT_DEPARTMENTS.map(normalizeOption))
          : PERSONAL_SELECT_OPTIONS[key]?.map(normalizeOption)
            || (key === "designation" ? DEFAULT_DESIGNATIONS.map(normalizeOption) : []);
        const fieldValue = value(form, key);
        const required = REQUIRED_PERSONAL_FIELDS.includes(key) || (fields === bankFields && REQUIRED_BANK_FIELDS.includes(key));
        const fieldError = errors[key];
        return (
          <label key={key} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {label}{required && <span className="ml-1 text-rose-500">*</span>}
            {selectOptions.length ? (
              <select
                disabled={readOnly}
                value={fieldValue}
                onChange={(e) => setField(key, e.target.value)}
                className={`${inputClass} ${fieldError ? "border-rose-400 ring-2 ring-rose-100" : ""}`}
              >
                <option value="">Select {label.toLowerCase()}</option>
                {fieldValue && !selectOptions.some((option) => String(option.value) === String(fieldValue)) && (
                  <option value={fieldValue}>{fieldValue}</option>
                )}
                {selectOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <div className={currencyFields.includes(key) ? "relative" : undefined}>
                {currencyFields.includes(key) && (
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-slate-500" aria-hidden="true">
                    ₹
                  </span>
                )}
                <input
                  disabled={readOnly}
                  type={currencyFields.includes(key) ? "text" : type}
                  value={fieldValue}
                  maxLength={currencyFields.includes(key) ? (cappedAllowanceFields.includes(key) ? 10 : 15) : key === "email" ? 254 : key === "customerId" ? 30 : ["accountHolderName", "bankName", "branchName"].includes(key) ? 100 : key === "pfAccountNumber" ? 28 : key === "ifscCode" ? 11 : undefined}
                  inputMode={currencyFields.includes(key) || ["phone", "aadhaarNumber", "pincode", "accountNumber", "uanNumber"].includes(key) ? "decimal" : undefined}
                  onChange={(e) => setField(key, sanitizeFieldValue(key, e.target.value))}
                  className={`${inputClass} ${currencyFields.includes(key) ? "pl-8" : ""} ${fieldError ? "border-rose-400 ring-2 ring-rose-100" : ""}`}
                />
              </div>
            )}
            {fieldError && <span className="mt-1 block text-xs font-medium text-rose-600">{fieldError}</span>}
          </label>
        );
      })}
    </div>
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0F55F7]">Employee profile</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{name} · Step {step + 1} of {steps.length}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-3 dark:border-slate-800">
        {steps.map((item, index) => (
          <button
            type="button"
            key={item}
            onClick={() => setStep(index)}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${
                index === step
                  ? "bg-[#0F55F7] text-white"
                  : index < step
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600 transition hover:bg-blue-50 hover:text-[#0F55F7] dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {index < step ? <Check className="mr-1 inline h-3 w-3" /> : `${index + 1}. `}{item}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6">
        {current === "Personal Info" && (
          <>
            <div className="mb-5 flex items-center gap-3">
              <UserRound className="h-5 w-5 text-[#0F55F7]" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Personal information</h3>
                <p className="text-sm text-slate-500">Contact, identity, employment and address details.</p>
              </div>
            </div>
            {renderFields(personalFields)}
          </>
        )}

        {current === "Bank Info" && (
          <>
            <h3 className="mb-5 font-bold text-slate-900 dark:text-white">Bank and salary information</h3>
            {renderFields(bankFields)}
          </>
        )}

        {current === "Education" && (
          <>
            <h3 className="mb-5 font-bold text-slate-900 dark:text-white">Educational qualifications</h3>
            {(form.education || []).map((entry, index) => (
              <div className="mb-4 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-700" key={index}>
                {[
                  ["Qualification", "qualification"],
                  ["University / Institution", "institution"],
                  ["Year", "year"],
                  ["Percentage", "percentage"],
                  ["Specialization", "specialization"],
                ].map(([label, key]) => (
                  <label key={key} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {label}
                    <input
                      disabled={readOnly}
                      className={inputClass}
                      value={entry[key] || ""}
                      maxLength={key === "year" ? 4 : key === "percentage" ? 6 : 150}
                      inputMode={key === "year" || key === "percentage" ? "decimal" : undefined}
                      onChange={(e) => updateEducation(index, key, e.target.value)}
                    />
                    {errors[`education.${index}.${key}`] && <span className="mt-1 block text-xs font-medium text-rose-600">{errors[`education.${index}.${key}`]}</span>}
                  </label>
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setForm((old) => ({ ...old, education: [...(old.education || []), { ...emptyEntry }] }))}
              className="rounded-xl bg-[#0F55F7] px-4 py-2 text-sm font-bold text-white"
            >
              + Add Education
            </button>
          </>
        )}

        {current === "Experience" && (
          <>
            <h3 className="mb-5 font-bold text-slate-900 dark:text-white">Previous work experience</h3>
            {(form.experience || []).map((entry, index) => (
              <div className="mb-4 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2" key={index}>
                {[
                  ["Company name", "companyName"],
                  ["Designation", "designation"],
                  ["From date", "fromDate", "date"],
                  ["To date", "toDate", "date"],
                  ["Years of experience", "yearsOfExperience", "text"],
                  ["Reason for leaving", "reasonForLeaving"],
                ].map(([label, key, type = "text"]) => (
                  <label key={key} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {label}
                    {key === "toDate" && (
                      <span className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                        <input type="checkbox" checked={Boolean(entry.currentlyWorking)} disabled={readOnly} onChange={(e) => updateExperience(index, "currentlyWorking", e.target.checked)} />
                        Currently working here
                      </span>
                    )}
                    <input
                      disabled={readOnly || (key === "toDate" && entry.currentlyWorking)}
                      type={type}
                      className={inputClass}
                      value={entry[key] || ""}
                      min={key === "toDate" ? entry.fromDate || undefined : undefined}
                      readOnly={key === "yearsOfExperience"}
                      onChange={(e) => updateExperience(index, key, e.target.value)}
                    />
                    {errors[`experience.${index}.${key}`] && <span className="mt-1 block text-xs font-medium text-rose-600">{errors[`experience.${index}.${key}`]}</span>}
                  </label>
                ))}
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 sm:col-span-2">
                  Description
                  <textarea
                    disabled={readOnly}
                    className={inputClass}
                    value={entry.description || ""}
                    onChange={(e) => updateExperience(index, "description", e.target.value)}
                  />
                  {errors[`experience.${index}.description`] && <span className="mt-1 block text-xs font-medium text-rose-600">{errors[`experience.${index}.description`]}</span>}
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setForm((old) => ({ ...old, experience: [...(old.experience || []), {}] }))}
              className="rounded-xl bg-[#0F55F7] px-4 py-2 text-sm font-bold text-white"
            >
              + Add Experience
            </button>
          </>
        )}

        {current === "Documents" && (
          <>
            <h3 className="mb-5 font-bold text-slate-900 dark:text-white">Employee documents</h3>
            {!readOnly && (
              <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
                {normalizedDocumentTypes.length ? (
                  <select
                    value={selectedDocumentType}
                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                    className={inputClass}
                  >
                    {normalizedDocumentTypes.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : null}
                <button
                  type="button"
                  onClick={addFile}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F55F7] px-4 py-2 text-sm font-bold text-white"
                >
                  <Upload className="h-4 w-4" /> Upload document
                </button>
                <span className="text-xs text-slate-500 sm:col-span-3">Maximum file size: 3 MB</span>
              </div>
            )}
            <div className="space-y-3">
              {(form.documents || []).map((doc, index) => (
                <div key={`${doc.name}-${index}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <FileText className="h-5 w-5 text-[#0F55F7]" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.name || doc.documentName || "Document"}</p>
                    <p className="text-xs text-slate-500">{doc.type || "File"} · {doc.status || "Saved"}</p>
                  </div>
                  {(doc.documentId || doc.id) && (
                    <div className="ml-auto flex items-center gap-2">
                      <button type="button" onClick={() => onDownloadDocument?.(doc)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-[#0F55F7]" aria-label="Download document"><Download className="h-4 w-4" /></button>
                      {!readOnly && <button type="button" onClick={() => onDeleteDocument?.(doc)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-rose-600" aria-label="Delete document"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  )}
                </div>
              ))}
              {!(form.documents || []).length && (
                <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-800">No documents uploaded yet.</p>
              )}
            </div>
          </>
        )}

        {current === "Review" && (
          <>
            <h3 className="mb-5 font-bold text-slate-900 dark:text-white">Review and submit</h3>
            {steps.slice(0, 5).map((section) => (
              <div key={section} className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{section}</p>
                  <p className="text-xs text-slate-500">Information saved in this section</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(steps.indexOf(section))}
                  className="text-sm font-bold text-[#0F55F7]"
                >
                  Edit
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={downloadProfilePdf}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#0F55F7]/30 bg-blue-50 px-4 py-2.5 text-sm font-bold text-[#0F55F7] transition hover:bg-blue-100"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
          </>
        )}

        {errors.save && <p role="alert" className="mt-4 text-sm text-red-600">{errors.save}</p>}
        {!readOnly && (
          <div className="mt-6 flex justify-between border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="button"
              disabled={step === 0 || saving}
              onClick={() => setStep((old) => old - 1)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              Back
            </button>
            {step === steps.length - 1 && (
              <button
                type="button"
                disabled={saving}
                onClick={saveAndNext}
                className="rounded-xl bg-[#0F55F7] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
