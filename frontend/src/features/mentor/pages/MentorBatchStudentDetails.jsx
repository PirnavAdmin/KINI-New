import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { batchService } from "@shared/services/batchService";
import { toMentorBatchStudent } from "../utils/mentorBatchStudent";
import ProfileImage from "@/components/common/ProfileImage";
import { PROFILE_TYPE } from "@shared/services/profilePhotoService";

export default function MentorBatchStudentDetails() {
  const { batchId, studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.allSettled([batchService.getStudents(batchId), batchService.getById(batchId)])
      .then(([studentsResult, batchResult]) => {
        if (!active) return;
        if (studentsResult.status !== "fulfilled") {
          throw studentsResult.reason;
        }

        const studentsResponse = studentsResult.value || {};
        const rows = Array.isArray(studentsResponse.students) ? studentsResponse.students : [];
        const matchedStudent = rows.find((item) => String(item.studentId ?? item.id) === String(studentId)) || null;
        const batchResponse = batchResult.status === "fulfilled" ? batchResult.value || {} : {};

        // Mentors may not have permission for the organization batch-detail
        // endpoint. The assigned batch roster is enough to render the student.
        // Mentor view model only: no email/phone/personal profile fields.
        setStudent(matchedStudent ? toMentorBatchStudent(matchedStudent) : null);
        setBatch({
          ...batchResponse,
          batchId: batchResponse.batchId ?? studentsResponse.batchId ?? batchId,
          batchName: batchResponse.batchName ?? studentsResponse.batchName ?? `Batch ${batchId}`,
          courseName: batchResponse.courseName ?? studentsResponse.courseName ?? "Assigned course",
        });
        if (!matchedStudent) setError("Student was not found in this batch.");
      })
      .catch(() => active && setError("Unable to load student details."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [batchId, studentId]);

  const fields = useMemo(() => student ? [["Course", batch?.courseName], ["Batch", batch?.batchName], ["Mentor", batch?.mentorName], ["Attendance", `${student.attendance}%`], ["Assessments Cleared", student.assessmentsCleared], ...(student.progress != null ? [["Progress", `${student.progress}%`]] : []), ...(student.studentCode ? [["Student ID", student.studentCode]] : [])] : [], [batch, student]);
  if (loading) return <div className="p-6 text-sm text-slate-500">Loading student details...</div>;
  if (!student) return <div className="mx-auto max-w-xl p-8 text-center"><UserRound className="mx-auto h-10 w-10 text-slate-400" /><h1 className="mt-3 text-lg font-bold">{error || "Student not found"}</h1><button onClick={() => navigate(`/mentor/batches/${batchId}?tab=students`)} className="mt-4 text-sm font-semibold text-blue-600">Back to batch</button></div>;
  return <main className="min-h-full bg-slate-50 p-4 sm:p-6"><div className="mx-auto max-w-4xl space-y-4"><p className="text-xs text-slate-500">My Batches › {batch?.batchName || "Batch"} › Students › {student.name}</p><button onClick={() => navigate(`/mentor/batches/${batchId}?tab=students`)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4" /> Back to batch</button><section className="rounded-xl border bg-white p-5"><div className="flex items-center gap-3"><ProfileImage profileType={PROFILE_TYPE.STUDENT} profileId={student.studentId} name={student.name} size="lg" fallbackClassName="bg-blue-50 text-blue-700" /><div><h1 className="text-xl font-bold">{student.name}</h1><span className="text-sm text-slate-500">{student.status || "—"}</span></div></div><dl className="mt-6 grid gap-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold">{value || "—"}</dd></div>)}</dl></section></div></main>;
}
