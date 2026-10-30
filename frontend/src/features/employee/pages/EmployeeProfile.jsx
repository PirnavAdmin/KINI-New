import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmployeeProfileWizard from "@shared/components/EmployeeProfileWizard";
import { employeeProfileService } from "@shared/services/employeeProfileService";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    Promise.all([
      employeeProfileService.getProfile().catch(() => null),
      employeeProfileService.getDepartments().catch(() => []),
      employeeProfileService.getDocumentTypes().catch(() => []),
    ])
      .then(([data, departments, documentTypeList]) => {
        if (!active) return;
        setProfile(data?.data ?? data ?? {});
        setDepartmentOptions(Array.isArray(departments) ? departments : departments?.data ?? []);
        setDocumentTypes(Array.isArray(documentTypeList) ? documentTypeList : documentTypeList?.data ?? []);
      })
      .catch(() => active && setProfile({}))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);
  const save = async (payload, section) => {
    try {
      const normalizedSection = String(section || "").toLowerCase();
      let result = null;
      if (normalizedSection === "personal info") result = await employeeProfileService.updatePersonal(payload);
      else if (normalizedSection === "bank info") result = await employeeProfileService.updateBank(payload);
      else if (normalizedSection === "education") result = await employeeProfileService.updateEducation({ education: payload.education || [] });
      else if (normalizedSection === "experience") result = await employeeProfileService.updateExperience({ experience: payload.experience || [] });
      else if (normalizedSection === "documents") {
        const uploads = (payload.documents || []).filter((doc) => doc?.file);
        if (uploads.length) {
          result = await Promise.all(uploads.map((doc) => employeeProfileService.uploadDocument({
            file: doc.file,
            documentTypeId: doc.type,
            documentName: doc.name,
          })));
        }
      } else {
        result = await employeeProfileService.updatePersonal(payload);
      }
      const merged = Array.isArray(result) ? result[result.length - 1] : (result?.data ?? result ?? {});
      setProfile((current) => ({ ...current, ...merged, ...payload }));
      toast.success("Profile section saved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save profile section");
      throw error;
    }
  };
  const downloadDocument = async (document) => {
    const documentId = document?.documentId ?? document?.id;
    if (!documentId) return toast.error("Document ID is unavailable.");
    try {
      const response = await employeeProfileService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(response.data);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.name || document.documentName || "employee-document";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to download document.");
    }
  };
  const deleteDocument = async (document) => {
    const documentId = document?.documentId ?? document?.id;
    if (!documentId || !window.confirm("Delete this document?")) return;
    try {
      await employeeProfileService.deleteDocument(documentId);
      setProfile((current) => ({ ...current, documents: (current?.documents || []).filter((item) => (item.documentId ?? item.id) !== documentId) }));
      toast.success("Document deleted successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete document.");
    }
  };
  if (loading) return <div className="mx-auto max-w-5xl p-6"><div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /></div>;
  return <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6"><EmployeeProfileWizard initialData={profile || {}} onSave={save} onDownloadDocument={downloadDocument} onDeleteDocument={deleteDocument} title="My Profile" departmentOptions={departmentOptions} documentTypes={documentTypes} /></div>;
}
