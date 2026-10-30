import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Award, BarChart3, BookOpen, Calendar, Camera, ClipboardCheck, Edit3, GraduationCap, Info, Mail, MapPin, Phone, RefreshCw, Save, ShieldCheck, User, Users, X } from "lucide-react";
import StudentPageBanner from "@features/student/components/StudentPageBanner";
import { STUDENT_BANNERS } from "@features/student/constants/studentBanners";
import { courseService } from "@/services/courseService";
import assessmentService from "@/services/assessmentService";
import { dashboardApi } from "@shared/services/apiServices";
import { useAuth } from "@shared/hooks/useAuth";
import { useAssignedMentor } from "@features/student/hooks/useAssignedMentor";
import {
  buildProfilePayload,
  getProfileErrorMessage,
  getUserProfile,
  resolveUserId,
  updateUserProfile,
} from "@/services/profileService";

const editableFieldConfig = [
  { key: "fullName", label: "Full Name", icon: User, sourceKeys: ["fullName", "name", "firstName", "lastName"] },
  { key: "phoneNumber", label: "Phone Number", icon: Phone, sourceKeys: ["phoneNumber", "phone", "mobile"] },
  { key: "profileImage", label: "Profile Image", icon: Camera, sourceKeys: ["profileImage", "profileImageUrl", "avatar", "avatarUrl"] },
  { key: "address", label: "Address", icon: MapPin, sourceKeys: ["address", "location"] },
  { key: "dateOfBirth", label: "Date of Birth", icon: Calendar, sourceKeys: ["dateOfBirth", "dob", "birthDate"] },
  { key: "gender", label: "Gender", icon: Users, sourceKeys: ["gender"] },
];

const hasSupportedField = (raw, sourceKeys) =>
  sourceKeys.some((key) => Object.prototype.hasOwnProperty.call(raw || {}, key));

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  // Same assigned-mentor source as Mentor Chat / My Batch.
  const { mentor, loading: mentorLoading } = useAssignedMentor();
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [learning, setLearning] = useState({ courses: null, certificates: null, assessments: null });

  const loadProfile = useCallback(async () => {
    const resolvedId = resolveUserId(user);
    setUserId(resolvedId);

    if (!resolvedId) {
      setLoading(false);
      setError("User ID is required to load your profile.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const loadedProfile = await getUserProfile(resolvedId);
      setProfile(loadedProfile);
      setForm({
        fullName: loadedProfile.fullName || "",
        email: loadedProfile.email || "",
        phoneNumber: loadedProfile.phoneNumber || "",
        profileImage: loadedProfile.profileImage || "",
        address: loadedProfile.address || "",
        dateOfBirth: loadedProfile.dateOfBirth || "",
        gender: loadedProfile.gender || "",
      });
    } catch (err) {
      console.error("Unable to load user profile", err);
      setError(getProfileErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Profile loading intentionally synchronizes this view with the backend user record.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      courseService.getStudentCourses(),
      dashboardApi.studentDashboard(),
      assessmentService.getAvailableAssessments(),
    ]).then(([coursesResult, dashboardResult, assessmentsResult]) => {
      if (!active) return;
      const list = (result) => (result.status === "fulfilled" && Array.isArray(result.value) ? result.value : null);
      const dashboard = dashboardResult.status === "fulfilled" ? dashboardResult.value : null;
      const certificates = dashboard?.certificates ?? dashboard?.certifications;
      const assessments = list(assessmentsResult);
      setLearning({
        courses: list(coursesResult)?.length ?? null,
        certificates: Array.isArray(certificates) ? certificates.length : null,
        assessments: assessments ? assessments.filter((row) => ["completed", "passed", "results published"].includes(String(row?.status ?? "").toLowerCase())).length : null,
      });
    });
    return () => { active = false; };
  }, []);

  const supportedFields = useMemo(() => {
    const raw = profile?.raw || {};
    return editableFieldConfig.filter((field) => hasSupportedField(raw, field.sourceKeys));
  }, [profile]);

  const initials = useMemo(() => {
    const name = form.fullName || user?.firstName || user?.email || "Student";
    return String(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [form.fullName, user]);

  const profileCompletion = useMemo(() => {
    const fields = [form.fullName, form.email, form.phoneNumber, form.address];
    return Math.round((fields.filter((value) => String(value || "").trim()).length / fields.length) * 100);
  }, [form.address, form.email, form.fullName, form.phoneNumber]);

  const handleCancel = () => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phoneNumber: profile.phoneNumber || "",
      profileImage: profile.profileImage || "",
      address: profile.address || "",
      dateOfBirth: profile.dateOfBirth || "",
      gender: profile.gender || "",
    });
    setEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (!userId || !profile) return;
    const payload = buildProfilePayload(form, profile.raw);

    if (Object.keys(payload).length === 0) {
      toast.error("No editable backend-supported fields found.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updatedProfile = await updateUserProfile(userId, payload);
      setProfile(updatedProfile);
      setForm({
        fullName: updatedProfile.fullName || "",
        email: updatedProfile.email || "",
        phoneNumber: updatedProfile.phoneNumber || "",
        profileImage: updatedProfile.profileImage || "",
        address: updatedProfile.address || "",
        dateOfBirth: updatedProfile.dateOfBirth || "",
        gender: updatedProfile.gender || "",
      });
      updateUser?.({
        ...updatedProfile.raw,
        name: updatedProfile.fullName,
        email: updatedProfile.email,
      });
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      const message = getProfileErrorMessage(err);
      console.error("Unable to update user profile", err);
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const handleProfilePhoto = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be 5 MB or smaller."); return; }
    const reader = new FileReader();
    reader.onload = () => { handleChange("profileImage", String(reader.result)); setEditing(true); };
    reader.readAsDataURL(file);
  };

  const fieldByKey = Object.fromEntries(supportedFields.map((field) => [field.key, field]));
  const extraFields = supportedFields.filter((field) => !["fullName", "phoneNumber", "profileImage"].includes(field.key));
  const stat = (value) => (value === null || value === undefined ? "—" : value);

  const renderInput = (field) => (
    <div key={field.key}>
      <label htmlFor={`profile-${field.key}`}>{field.label}</label>
      <div className="ksx-input">
        <field.icon aria-hidden="true" />
        <input
          id={`profile-${field.key}`}
          type={field.key === "dateOfBirth" ? "date" : "text"}
          value={form[field.key] || ""}
          onChange={(event) => handleChange(field.key, event.target.value)}
          readOnly={!editing}
        />
      </div>
    </div>
  );

  return (
    <main className="ksl-page w-full px-2 py-2 sm:px-3">
      <StudentPageBanner
        banner={STUDENT_BANNERS.profile}
        icon={User}
        eyebrow="Student Profile"
        title="Your Profile,"
        highlight="Your Learning Journey!"
        highlightBreak
        description={<>Manage your personal details, track your progress<br className="ksl-hide-sm" /> and keep your profile up to date.</>}
      />

      <div className="ksx-stack">
        {error && (
          <div className="ksx-alert">
            <span>{error}</span>
            <button type="button" onClick={loadProfile} className="ksl-btn ksl-btn--orange"><RefreshCw />Retry</button>
          </div>
        )}

        {loading ? (
          <div className="ksx-split ksx-split--half">
            <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        ) : (
          <div className="ksx-split ksx-split--half">
            <section className="ksl-card ksx-profile-card">
              <label className="ksx-btn-outline ksx-profile-card__upload" style={{ padding: "0.5rem 0.9rem" }}>
                <Camera /> Upload Photo
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => handleProfilePhoto(event.target.files?.[0])} />
              </label>
              <div className="ksx-avatar">
                {form.profileImage ? <img src={form.profileImage} alt={form.fullName || "Profile"} /> : initials}
                <label className="ksx-avatar__cam" aria-label="Change photo">
                  <Camera />
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => handleProfilePhoto(event.target.files?.[0])} />
                </label>
              </div>
              <h2 className="ksx-profile-card__name">{form.fullName || "Student"}</h2>
              {form.email && <p className="ksx-profile-card__email">{form.email}</p>}
              <span className="ksx-role-pill">Student Account</span>

              <div className="ksx-complete">
                <div className="ksx-complete__head"><span>Profile completeness</span><span>{profileCompletion}%</span></div>
                <div className="ksx-bar"><div style={{ width: `${profileCompletion}%` }} /></div>
              </div>

              <div className="ksx-mini-stats">
                <div className="ksx-mini-stat"><span className="ksl-tile-icon ksl-tone--blue"><BookOpen /></span><div><strong>{stat(learning.courses)}</strong><span>Courses Enrolled</span></div></div>
                <div className="ksx-mini-stat"><span className="ksl-tile-icon ksl-tone--navy"><User /></span><div><strong title={mentor?.name || undefined}>{mentor?.name || (mentorLoading ? "—" : "Not assigned")}</strong><span>Mentor</span></div></div>
                <div className="ksx-mini-stat"><span className="ksl-tile-icon ksl-tone--green"><Award /></span><div><strong>{stat(learning.certificates)}</strong><span>Certificates Earned</span></div></div>
                <div className="ksx-mini-stat"><span className="ksl-tile-icon ksl-tone--orange"><ClipboardCheck /></span><div><strong>{stat(learning.assessments)}</strong><span>Assessments Completed</span></div></div>
                <div className="ksx-mini-stat"><span className="ksl-tile-icon ksl-tone--violet"><BarChart3 /></span><div><strong>{profileCompletion}%</strong><span>Profile Complete</span></div></div>
              </div>
            </section>

            <section className="ksl-card">
              <div className="ksx-head">
                <div className="ksx-head__main">
                  <span className="ksx-head__icon ksl-tone--blue"><User /></span>
                  <div><h2 className="ksx-head__title">Personal Information</h2><p className="ksx-head__sub">Your account and contact details</p></div>
                </div>
                {editing ? (
                  <div className="ksx-head__main">
                    <button type="button" onClick={handleCancel} disabled={saving} className="ksx-btn-outline"><X />Cancel</button>
                    <button type="button" onClick={handleSave} disabled={saving} className="ksl-btn ksl-btn--orange"><Save />{saving ? "Saving..." : "Save Changes"}</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setEditing(true)} disabled={!profile} className="ksl-btn ksl-btn--orange"><Edit3 />Edit Profile</button>
                )}
              </div>

              {!profile ? (
                <div className="ksx-empty" style={{ marginTop: "1rem" }}><span className="ksx-empty__icon"><User /></span><h3>Profile data is not available</h3><p>Please retry in a moment.</p></div>
              ) : (
                <div className="ksx-form">
                  {fieldByKey.fullName ? renderInput(fieldByKey.fullName) : (
                    <div><label>Full Name</label><div className="ksx-input"><User aria-hidden="true" /><input value={form.fullName || ""} readOnly /></div></div>
                  )}
                  <div><label htmlFor="profile-email">Email Address</label><div className="ksx-input"><Mail aria-hidden="true" /><input id="profile-email" type="email" value={form.email || ""} readOnly /></div></div>
                  {fieldByKey.phoneNumber ? renderInput(fieldByKey.phoneNumber) : (
                    <div><label>Phone Number</label><div className="ksx-input"><Phone aria-hidden="true" /><input value={form.phoneNumber || ""} readOnly /></div></div>
                  )}
                  <div><label htmlFor="profile-account">Account Type</label><div className="ksx-input"><GraduationCap aria-hidden="true" /><input id="profile-account" value="Student" readOnly /></div></div>
                  {extraFields.map(renderInput)}
                </div>
              )}

              <div className="ksx-note">
                <Info className="h-7 w-7 shrink-0 text-blue-600" />
                <div><h3>Keep your profile updated</h3><p>Your information helps us provide a better learning experience and keep you informed about important updates.</p></div>
                <span className="ksx-note__art"><ShieldCheck /></span>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
