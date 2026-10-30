import { personNameError } from "@shared/utils/personName";
import { useState } from "react";
import { Loader2, Mail, Phone, Plus, Users } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@shared/components/Modal";
import { Button, Input, Select } from "@shared/components/FormElements";
import { HR_ROLE_IDS } from "@shared/constants/roles";
import { getApiErrorMessage } from "@shared/services/apiServices";
import { employeeService } from "@shared/services/employeeService";
import { upsertHrUser } from "@features/hr/services/hrUserStore";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  employmentType: "Full-time",
  status: "active",
};
const ROLE_OPTIONS = [
  { value: "mentor", label: "Mentor" },
  { value: "employee", label: "Employee" },
  { value: "hr", label: "HR" },
];
const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Intern", label: "Intern" },
];

export default function EmployeeFormModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const close = () => {
    if (!saving) {
      setForm(EMPTY_FORM);
      setErrors({});
      onClose?.();
    }
  };
  const change = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "phone") {
      setErrors((current) => ({
        ...current,
        phone: value && !/^[6-9]\d{0,9}$/.test(value)
          ? "Indian mobile numbers must start with 6, 7, 8, or 9"
          : value.length === 10 && !/^[6-9]\d{9}$/.test(value)
            ? "Enter exactly 10 digits"
            : "",
      }));
    }
  };
  const save = async () => {
    const next = {};
    if (personNameError(form.firstName, "First name")) next.firstName = personNameError(form.firstName, "First name");
    if (personNameError(form.lastName, "Last name")) next.lastName = personNameError(form.lastName, "Last name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    if (!/^[6-9]\d{9}$/.test(form.phone)) next.phone = "Enter a valid Indian mobile number starting with 6, 7, 8, or 9";
    if (!form.role) next.role = "Role is required";
    if (!form.employmentType) next.employmentType = "Employment type is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const isHrRole = String(form.role).toLowerCase() === "hr";
      await employeeService.createEmployee({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        designation: form.role,
        employeeType: form.employmentType,
        isActive: form.status === "active",
        createLogin: true,
        sendCredentialsEmail: true,
        hrRole: isHrRole ? HR_ROLE_IDS.EXECUTIVE : undefined,
      });
      if (isHrRole) {
        upsertHrUser({
          name: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          mobile: form.phone.trim(),
          designation: "HR",
          status: form.status,
          role: "HR",
          hrRole: HR_ROLE_IDS.EXECUTIVE,
          permissions: {},
        });
      }
      toast.success(`${isHrRole ? "HR user" : "Employee"} ${form.firstName.trim()} ${form.lastName.trim()} was added successfully.`, {
        duration: 3500,
        style: {
          background: "#047857",
          color: "#ffffff",
          fontWeight: 700,
          border: "1px solid #065f46",
        },
        iconTheme: { primary: "#ffffff", secondary: "#047857" },
      });
      onClose?.();
      onCreated?.();
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to create employee.");
      setErrors((current) => ({ ...current, form: message }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add Employee" description="Create an employee profile and assign their initial access role." size="lg"
      className="!rounded-3xl !border-white/70 shadow-[0_32px_90px_-24px_rgba(115,76,35,0.28)] ring-1 ring-[#d99a52]/20"
      headerClassName="relative overflow-hidden !flex !items-start !justify-between !gap-4 !border-0 !px-6 !py-5 !bg-gradient-to-r !from-[#9b5d2e] !via-[#b96f32] !to-[#d98b3d] [&>div:first-child]:!m-0 [&>div:first-child]:!min-w-0 [&>div:first-child]:!flex-1 [&>div:first-child]:!p-0 [&>button]:!m-0 [&>button]:!grid [&>button]:!h-10 [&>button]:!w-10 [&>button]:!shrink-0 [&>button]:!place-items-center [&>button]:!rounded-xl [&>button]:!p-0 [&_h2]:!text-white [&_p]:!text-[#fff3df] [&>button]:!bg-white/15 [&>button]:hover:!bg-white/25 [&_button_svg]:!text-white before:pointer-events-none after:pointer-events-none"
      bodyClassName="!bg-white !p-6 sm:!p-7"
      footerClassName="!border-[#ead8bd] !bg-white !px-7"
      footer={<div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={close} disabled={saving}>Cancel</Button><Button type="button" icon={saving ? Loader2 : Plus} onClick={save} loading={saving}>Create Employee</Button></div>}
    >
      <div className="employee-form grid grid-cols-1 gap-x-6 gap-y-5 rounded-[26px] border border-[#ead8bd] bg-white/95 p-5 shadow-[0_20px_55px_-32px_rgba(115,76,35,0.28)] md:grid-cols-2 sm:p-7">
        <div className="flex items-center justify-between rounded-2xl border border-[#ead8bd] bg-gradient-to-r from-[#fff4e2] via-[#fffaf2] to-[#f8e7cf] px-5 py-4 md:col-span-2">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#b76527] to-[#e39a45] text-white shadow-lg shadow-[#b76527]/20"><Users className="h-5 w-5" /></span><div><p className="font-extrabold text-slate-900">Personal Information</p><p className="text-xs text-slate-500">Basic identity and employment details</p></div></div>
          <span className="hidden text-[10px] font-bold uppercase text-[#a85f22] sm:block">* Required fields</span>
        </div>
        <Input label="First Name" required value={form.firstName} onChange={(e) => change("firstName", e.target.value)} error={errors.firstName} />
        <Input label="Last Name" required value={form.lastName} onChange={(e) => change("lastName", e.target.value)} error={errors.lastName} />
        <Input label="Email" type="email" required icon={Mail} value={form.email} onChange={(e) => change("email", e.target.value)} error={errors.email} />
        <Input label="Phone" type="tel" required icon={Phone} inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => change("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} error={errors.phone} />
        <Select label="Role" required value={form.role} onChange={(e) => change("role", e.target.value)} options={ROLE_OPTIONS} placeholder="Select Role" error={errors.role} />
        <p className="md:col-span-2 -mt-2 text-xs text-slate-500">
          HR is treated as an employee record here. After creation, the HR profile can be managed in HR Settings.
        </p>
        <Select label="Employment Type" required value={form.employmentType} onChange={(e) => change("employmentType", e.target.value)} options={EMPLOYMENT_TYPE_OPTIONS} error={errors.employmentType} />
        <Select label="Status" required value={form.status} onChange={(e) => change("status", e.target.value)} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
        {errors.form && <p role="alert" className="text-sm font-semibold text-red-600 md:col-span-2">{errors.form}</p>}
      </div>
    </Modal>
  );
}
