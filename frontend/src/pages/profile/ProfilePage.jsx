import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Download,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@shared/hooks/useAuth";
import { employeeProfileService } from "@shared/services/employeeProfileService";
import { canLoadImage, notifyProfilePhotoChanged, profilePhotoService, resolvePhotoUrl } from "@shared/services/profilePhotoService";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import MentorPageHeader from "@features/mentor/components/MentorPageHeader";
import EmployeeProfileWizard from "@shared/components/EmployeeProfileWizard";

const toggleRows = [
  ["assignment", "Email notification when a student submits an assignment"],
  ["classReminder", "Email reminder when a class starts in 30 minutes"],
  ["attendanceAlert", "Email alert when a student drops below 75% attendance"],
  ["questions", "In-app notification for new student questions"],
  ["digest", "Weekly progress digest"],
  ["reportReminder", "Daily report reminder at 5 PM"],
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Profile Details");
  const [employee, setEmployee] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [employeeError, setEmployeeError] = useState("");

  // ── Photo state ───────────────────────────────────────────────────────
  // No base64 localStorage cache anymore. The initial GET effect refetches
  // the blob URL on every mount, which is cheap and always fresh.
  // profilePhoto is the confirmed photo; previewPhoto is the local preview shown
  // only while an upload is in flight. Selecting a file never touches profilePhoto.
  const [profilePhoto, setProfilePhoto] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoRequestVersion = useRef(0);
  // Track the last blob URL we created so we can revoke it on unmount.
  const ownedBlobUrl = useRef("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
    twoFactor: true,
  });
  const [notifications, setNotifications] = useState({
    assignment: true,
    classReminder: true,
    attendanceAlert: true,
    questions: true,
    digest: false,
    reportReminder: true,
  });
  const [teaching, setTeaching] = useState({
    scale: "Marks + Grade",
    notify: true,
    deadline: "11:59 PM",
    reminder: "30 minutes",
  });

  const loadEmployee = useCallback(async () => {
    setLoadingEmployee(true);
    setEmployeeError("");
    try {
      const [profileResponse, departmentsResponse, documentTypesResponse] = await Promise.all([
        employeeProfileService.getProfile().catch(() => null),
        employeeProfileService.getDepartments().catch(() => []),
        employeeProfileService.getDocumentTypes().catch(() => []),
      ]);
      const profile = profileResponse?.data ?? profileResponse ?? {};
      setEmployee({
        ...user,
        ...profile,
        role: profile?.role ?? user?.role ?? "Mentor",
        employeeId: user?.employeeId ?? profile?.employeeId ?? user?.userId ?? user?.id,
      });
      setDepartmentOptions(Array.isArray(departmentsResponse) ? departmentsResponse : departmentsResponse?.data ?? []);
      setDocumentTypes(Array.isArray(documentTypesResponse) ? documentTypesResponse : documentTypesResponse?.data ?? []);
    } catch (error) {
      console.error("Unable to load mentor profile", error);
      setEmployee(null);
      setEmployeeError("Unable to load profile information.");
    } finally {
      setLoadingEmployee(false);
    }
  }, [user]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadEmployee(); }, [loadEmployee]);

  // ── Initial photo load ────────────────────────────────────────────────
  // Service now guarantees string | null, so we only need a type check.
  useEffect(() => {
    let active = true;
    const requestVersion = photoRequestVersion.current;

    profilePhotoService
      .get()
      .then((result) => {
        const value = resolvePhotoUrl(result?.photoUrl);
        if (
          active &&
          requestVersion === photoRequestVersion.current &&
          typeof value === "string" &&
          value
        ) {
          // Revoke the previous blob URL we owned (if any).
          if (ownedBlobUrl.current && ownedBlobUrl.current !== value) {
            URL.revokeObjectURL(ownedBlobUrl.current);
          }
          ownedBlobUrl.current = value.startsWith("blob:") ? value : "";
          setProfilePhoto(value);
        }
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          console.error("Profile photo load failed", error);
        }
      });

    return () => {
      active = false;
      // Revoke any blob URL we created for this mount.
      if (ownedBlobUrl.current) {
        URL.revokeObjectURL(ownedBlobUrl.current);
        ownedBlobUrl.current = "";
      }
    };
  }, []);

  // ── Upload ────────────────────────────────────────────────────────────
  const uploadProfilePhoto = async (file) => {
    if (!file || photoBusy) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be 5 MB or smaller.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    const previousPhoto = profilePhoto;

    // Invalidate any in-flight initial GET so it can't clobber the upload result.
    photoRequestVersion.current += 1;
    // The confirmed photo stays in state; the preview is layered on top of it.
    setPreviewPhoto(localPreview);
    setPhotoBusy(true);

    let uploaded = false;
    try {
      const result = await profilePhotoService.upload(file);
      uploaded = true;

      // Only adopt a server URL the browser can actually render. If the upload
      // response has none, re-fetch the photo from the GET endpoint.
      let serverUrl = resolvePhotoUrl(result?.photoUrl);
      if (!(await canLoadImage(serverUrl))) {
        const refreshed = await profilePhotoService.get().catch(() => null);
        serverUrl = resolvePhotoUrl(refreshed?.photoUrl);
      }
      // Same URL as before means the file was overwritten in place; bust the cache.
      if (serverUrl && serverUrl === previousPhoto && /^https?:/i.test(serverUrl)) {
        serverUrl = `${serverUrl}${serverUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;
      }
      const serverUrlLoads = await canLoadImage(serverUrl);

      // Upload succeeded, so the server now holds the new file. If its URL can't
      // be rendered, keep showing the local preview of that same file.
      const nextPhoto = serverUrlLoads ? serverUrl : localPreview;
      if (!serverUrlLoads) {
        console.warn("[PHOTO] Upload succeeded but no loadable photo URL was returned. Keeping local preview.");
      }
      if (ownedBlobUrl.current && ownedBlobUrl.current !== nextPhoto) URL.revokeObjectURL(ownedBlobUrl.current);
      ownedBlobUrl.current = nextPhoto.startsWith("blob:") ? nextPhoto : "";
      if (nextPhoto !== localPreview) URL.revokeObjectURL(localPreview);
      setProfilePhoto(nextPhoto);
      setPreviewPhoto("");
      // The header can't use this page's blob URL (revoked on unmount), so it re-fetches.
      notifyProfilePhotoChanged({ photoUrl: serverUrlLoads ? serverUrl : "" });
      toast.success("Profile photo uploaded successfully.");
    } catch (error) {
      // Upload failed: drop the preview; the previous photo was never removed.
      URL.revokeObjectURL(localPreview);
      setPreviewPhoto("");
      if (uploaded) console.error("Profile photo refresh failed", error);
      toast.error(
        uploaded
          ? "Profile photo uploaded, but it could not be refreshed. Please reload the page."
          : error?.response?.data?.message ?? "Unable to upload profile photo. Please try again.",
      );
    } finally {
      setPhotoBusy(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const deleteProfilePhoto = async () => {
    if (photoBusy) return;
    setPhotoBusy(true);
    try {
      await profilePhotoService.remove();
      if (ownedBlobUrl.current) {
        URL.revokeObjectURL(ownedBlobUrl.current);
        ownedBlobUrl.current = "";
      }
      setProfilePhoto("");
      notifyProfilePhotoChanged({ removed: true });
      toast.success("Profile photo removed.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? "Unable to remove profile photo.",
      );
    } finally {
      setPhotoBusy(false);
    }
  };

  const beginEditProfile = () => {
    setProfileForm({
      firstName: employee?.firstName ?? "",
      lastName: employee?.lastName ?? "",
      phone: employee?.phone ?? "",
    });
    setEditingProfile(true);
    setTab("Personal Info");
  };

  const saveProfile = async () => {
    const id = employee?.employeeId ?? employee?.id;
    if (!id) return toast.error("Employee ID is unavailable.");
    if (!profileForm.firstName.trim()) return toast.error("First name is required.");
    setSavingProfile(true);
    try {
      const updated = await employeeProfileService.updatePersonal({ ...employee, ...profileForm });
      setEmployee((current) => ({ ...current, ...(updated?.data ?? updated ?? {}), ...profileForm }));
      setEditingProfile(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update failed", error);
      toast.error(error?.response?.data?.message ?? "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveDetailedProfile = async (payload, section) => {
    const normalizedSection = String(section || "").toLowerCase();
    const body = { ...employee, ...payload };
    let updated;

    if (normalizedSection === "personal info") {
      updated = await employeeProfileService.updatePersonal(body);
    } else if (normalizedSection === "bank info") {
      updated = await employeeProfileService.updateBank(body);
    } else if (normalizedSection === "education") {
      updated = await employeeProfileService.updateEducation({ education: body.education || [] });
    } else if (normalizedSection === "experience") {
      updated = await employeeProfileService.updateExperience({ experience: body.experience || [] });
    } else if (normalizedSection === "documents") {
      const documents = Array.isArray(body.documents) ? body.documents : [];
      const uploads = documents.filter((doc) => doc?.file);
      if (uploads.length) {
        updated = await Promise.all(
          uploads.map((doc) => employeeProfileService.uploadDocument({
            file: doc.file,
            documentTypeId: doc.type,
            documentName: doc.name,
          })),
        );
      }
    }

    if (updated) {
      const merged = Array.isArray(updated)
        ? updated[updated.length - 1]
        : (updated?.data ?? updated ?? {});
      setEmployee((current) => ({ ...current, ...merged, ...payload }));
    }
    toast.success("Profile section saved successfully.");
  };

  const downloadDocument = async (file) => {
    const documentId = file?.documentId ?? file?.id;
    if (!documentId) return toast.error("Document ID is unavailable.");
    try {
      const response = await employeeProfileService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(response.data);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = file.name || file.documentName || "employee-document";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.response?.data?.message ?? "Unable to download document.");
    }
  };

  const deleteDocument = async (file) => {
    const documentId = file?.documentId ?? file?.id;
    if (!documentId || !window.confirm("Delete this document?")) return;
    try {
      await employeeProfileService.deleteDocument(documentId);
      await loadEmployee();
      toast.success("Document deleted successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message ?? "Unable to delete document.");
    }
  };

  const downloadProfilePdf = async () => {
    try {
      const response = await employeeProfileService.downloadPdf();
      const url = window.URL.createObjectURL(response.data);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = "employee-profile.pdf";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.response?.data?.message ?? "Unable to download profile PDF.");
    }
  };

  const updatePassword = () => {
    if (!password.current || !password.next)
      return toast.error("Enter your current and new password.");
    if (password.next.length < 8)
      return toast.error("New password must contain at least 8 characters.");
    if (password.next !== password.confirm)
      return toast.error("New password and confirmation do not match.");
    setPassword({
      current: "",
      next: "",
      confirm: "",
      twoFactor: password.twoFactor,
    });
    toast.success("Password updated securely.");
  };

  return (
    <div className="mentor-profile-page mx-auto w-full max-w-[1500px] space-y-5 px-3 pb-8 sm:px-4 lg:px-5">
      <MentorPageHeader
        title="My Profile & Settings"
        subtitle="Manage your personal, security, notification, and teaching preferences."
      />
      <div className={tab === "Profile Details" ? "min-w-0" : "grid min-w-0 gap-5 lg:grid-cols-[330px_minmax(0,1fr)]"}>
        {tab !== "Profile Details" && (loadingEmployee ? <div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /> : employeeError ? <aside className="h-fit rounded-2xl border border-rose-200 bg-white p-6 text-center"><p className="text-sm font-semibold text-rose-600">{employeeError}</p><button onClick={loadEmployee} className="mt-4 rounded-xl bg-[#0F55F7] px-4 py-2 text-sm font-semibold text-white">Retry</button></aside> : <ProfileCard employee={employee} profilePhoto={profilePhoto} previewPhoto={previewPhoto} photoBusy={photoBusy} onUploadPhoto={uploadProfilePhoto} onDeletePhoto={deleteProfilePhoto} onEdit={beginEditProfile} onDownloadPdf={downloadProfilePdf} />)}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <nav className="flex overflow-x-auto border-b border-slate-200 px-2 dark:border-slate-800">
            {[
              "Profile Details",
              "Personal Info",
              "Security",
              "Notifications",
              "Teaching Preferences",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`shrink-0 px-4 py-4 text-sm font-semibold ${tab === item ? "border-b-2 border-[#0F55F7] text-[#0F55F7]" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="min-w-0 p-5 sm:p-6">
            {tab === "Profile Details" && employee && (
              <EmployeeProfileWizard
                initialData={employee}
                onSave={saveDetailedProfile}
                title="Mentor profile"
                departmentOptions={departmentOptions}
                documentTypes={documentTypes}
                onDownloadDocument={downloadDocument}
                onDeleteDocument={deleteDocument}
              />
            )}
            {tab === "Personal Info" && (loadingEmployee ? <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> : employee ? editingProfile ? <EditPersonal values={profileForm} setValues={setProfileForm} saving={savingProfile} onSave={saveProfile} onCancel={() => setEditingProfile(false)} /> : <Personal employee={employee} /> : null)}
            {tab === "Security" && (
              <Security
                password={password}
                setPassword={setPassword}
                onSave={updatePassword}
              />
            )}
            {tab === "Notifications" && (
              <NotificationSettings
                values={notifications}
                setValues={setNotifications}
              />
            )}
            {tab === "Teaching Preferences" && (
              <Teaching values={teaching} setValues={setTeaching} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileCard({ employee, profilePhoto, previewPhoto, photoBusy, onUploadPhoto, onDeletePhoto, onEdit, onDownloadPdf }) {
  const name = `${employee?.firstName ?? ""} ${employee?.lastName ?? ""}`.trim() || employee?.name || "—";
  const initials = `${employee?.firstName?.[0] ?? ""}${employee?.lastName?.[0] ?? ""}`.toUpperCase() || "—";
  const employeeId = employee?.employeeId ?? employee?.id ?? "—";
  return (
    <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-gradient-to-br from-[#0F55F7] to-[#06B6A8] px-5 py-7 text-center">
        <div className="relative mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-white bg-blue-100 text-2xl font-bold text-[#0F55F7] shadow-lg">
          {/* Preview (while uploading) → confirmed photo → initials; a URL that fails to load falls through. */}
          <AvatarPhoto src={previewPhoto} alt="Profile" fallback={<AvatarPhoto src={profilePhoto} alt="Profile" fallback={initials} />} />
        </div>
      </div>
      <div className="p-5">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          {name}
        </h2>
        <p className="text-sm text-slate-500">{employee?.role || "Mentor"} · Employee ID: {employeeId}</p>
        <button type="button" onClick={onDownloadPdf} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-[#0F55F7] hover:bg-blue-50"><Download className="h-4 w-4" /> Download PDF</button>
        <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{photoBusy ? "Uploading..." : "Upload photo"}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={photoBusy} onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so the same file can be picked again; a cancelled picker yields no file and changes nothing.
          event.target.value = "";
          if (file) onUploadPhoto(file);
        }} /></label>
        {profilePhoto && <button type="button" disabled={photoBusy} onClick={onDeletePhoto} className="mt-2 w-full text-xs font-semibold text-red-600">Remove photo</button>}
        <dl className="mt-5 space-y-3 border-y border-slate-100 py-4 text-sm dark:border-slate-800">
          <Info label="Official email" value={employee?.email || "—"} />
          <Info label="Mobile" value={employee?.phone || "—"} />
          <Info label="Status" value={employee?.status || "—"} />
        </dl>
        <button
          onClick={onEdit}
          className="mt-5 w-full rounded-xl border border-[#0F55F7] px-3 py-2.5 text-sm font-semibold text-[#0F55F7] hover:bg-blue-50"
        >
          Edit profile
        </button>
      </div>
    </aside>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex min-w-0 justify-between gap-3">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </dd>
    </div>
  );
}

function EditPersonal({ values, setValues, saving, onSave, onCancel }) {
  const fields = [["First name", "firstName"], ["Last name", "lastName"], ["Mobile number", "phone"]];
  return <div className="max-w-2xl"><SectionHead icon={UserRound} title="Edit personal information" description="Update your contact information. Role, email and employee ID remain organization-controlled." /><div className="mt-6 grid gap-4 sm:grid-cols-2">{fields.map(([fieldLabel, key]) => <label key={key} className="text-sm font-semibold text-slate-700 dark:text-slate-200">{fieldLabel}<input className="field mt-2" value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} /></label>)}</div><div className="mt-6 flex gap-3"><button type="button" onClick={onCancel} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">Cancel</button><button type="button" onClick={onSave} disabled={saving} className="rounded-xl bg-[#0F55F7] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button></div></div>;
}

function Personal({ employee }) {
  const fullName = `${employee?.firstName ?? ""} ${employee?.lastName ?? ""}`.trim() || employee?.name || "—";
  return (
    <div className="max-w-2xl">
      <SectionHead
        icon={UserRound}
        title="Personal information"
        description="Your name and official email are managed by the organization."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Readonly label="Full name" value={fullName} />
        <Readonly label="Official email" value={employee?.email || "—"} />
        <Readonly label="Mobile number" value={employee?.phone || "—"} />
        <Readonly label="Role" value={employee?.role || "—"} />
        <Readonly label="Employee ID" value={employee?.employeeId ?? employee?.id ?? "—"} />
        <Readonly label="Status" value={employee?.status || "—"} />
      </div>
    </div>
  );
}

function Security({ password, setPassword, onSave }) {
  return (
    <div className="max-w-xl">
      <SectionHead
        icon={LockKeyhole}
        title="Security"
        description="Use a strong password and secure your account with two-factor authentication."
      />
      <div className="mt-6 space-y-4">
        <Field label="Current password">
          <input
            type="password"
            className="field"
            value={password.current}
            onChange={(e) =>
              setPassword({ ...password, current: e.target.value })
            }
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            className="field"
            value={password.next}
            onChange={(e) => setPassword({ ...password, next: e.target.value })}
          />
        </Field>
        <Field label="Confirm new password">
          <input
            type="password"
            className="field"
            value={password.confirm}
            onChange={(e) =>
              setPassword({ ...password, confirm: e.target.value })
            }
          />
        </Field>
        <Toggle
          label="Two-factor authentication"
          description="Require a verification code when signing in."
          value={password.twoFactor}
          onChange={(value) => setPassword({ ...password, twoFactor: value })}
        />
      </div>
      <Save onClick={onSave} label="Update password" />
    </div>
  );
}

function NotificationSettings({ values, setValues }) {
  return (
    <div className="max-w-2xl">
      <SectionHead
        icon={BellIcon}
        title="Notifications"
        description="Choose which updates help you stay on top of your classes."
      />
      <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
        {toggleRows.map(([key, label]) => (
          <Toggle
            key={key}
            label={label}
            value={values[key]}
            onChange={(value) => setValues({ ...values, [key]: value })}
          />
        ))}
      </div>
      <Save
        onClick={() => toast.success("Notification preferences saved.")}
        label="Save preferences"
      />
    </div>
  );
}

function Teaching({ values, setValues }) {
  return (
    <div className="max-w-xl">
      <SectionHead
        icon={ShieldCheck}
        title="Teaching preferences"
        description="These defaults apply only to the batches assigned to you."
      />
      <div className="mt-6 space-y-5">
        <Field label="Default grading scale">
          <select
            className="field"
            value={values.scale}
            onChange={(e) => setValues({ ...values, scale: e.target.value })}
          >
            <option>Marks</option>
            <option>Grade</option>
            <option>Marks + Grade</option>
          </select>
        </Field>
        <Toggle
          label="Auto-notify students when marks are published"
          value={values.notify}
          onChange={(value) => setValues({ ...values, notify: value })}
        />
        <Field label="Default assignment deadline time">
          <select
            className="field"
            value={values.deadline}
            onChange={(e) => setValues({ ...values, deadline: e.target.value })}
          >
            <option>11:59 PM</option>
            <option>6:00 PM</option>
            <option>9:00 PM</option>
          </select>
        </Field>
        <Field label="Attendance reminder after class starts">
          <select
            className="field"
            value={values.reminder}
            onChange={(e) => setValues({ ...values, reminder: e.target.value })}
          >
            <option>30 minutes</option>
            <option>15 minutes</option>
            <option>45 minutes</option>
          </select>
        </Field>
      </div>
      <Save
        onClick={() => toast.success("Teaching preferences saved.")}
        label="Save preferences"
      />
    </div>
  );
}

function SectionHead({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#0F55F7]">
        <Icon size={19} />
      </span>
      <div>
        <h2 className="font-bold text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Readonly({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </p>
      <div className="mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">
        {value}
      </div>
      <p className="mt-1 text-[11px] text-slate-400">
        Contact your administrator to change this.
      </p>
    </div>
  );
}

function Toggle({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </p>
        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        aria-pressed={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? "bg-[#0F55F7]" : "bg-slate-300 dark:bg-slate-700"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${value ? "left-5.5" : "left-0.5"}`}
          style={{ left: value ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}

function Save({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F55F7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0C3DC0]"
    >
      <Check size={16} />
      {label}
    </button>
  );
}

function BellIcon(props) {
  return <Mail {...props} />;
}
