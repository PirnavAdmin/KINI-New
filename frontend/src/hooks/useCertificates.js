import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const people = [
  [
    "Anjali Sharma",
    "STU-2026-0847",
    "Full Stack Web Development",
    "React Morning Batch",
    "Rahul Sharma",
    82,
    78,
    false,
  ],
  [
    "Kiran Mehta",
    "STU-2026-0848",
    "Data Science & ML",
    "Data Science Weekend",
    "Ankit Singh",
    91,
    86,
    true,
  ],
  [
    "Rohan Verma",
    "STU-2026-0849",
    "UI/UX Design",
    "UI/UX Evening",
    "Kavya Reddy",
    88,
    81,
    true,
  ],
  [
    "Pooja Singh",
    "STU-2026-0850",
    "Full Stack Web Development",
    "Node.js Afternoon",
    "Priya Nair",
    84,
    77,
    true,
  ],
  [
    "Arjun Kumar",
    "STU-2026-0851",
    "Data Science & ML",
    "Data Science Weekend",
    "Ankit Singh",
    93,
    89,
    true,
  ],
  [
    "Meera Nair",
    "STU-2026-0852",
    "React Advanced",
    "React Advanced",
    "Riya Joshi",
    86,
    79,
    false,
  ],
  [
    "Vikram Patel",
    "STU-2026-0853",
    "Node.js Backend",
    "Node.js Afternoon",
    "Priya Nair",
    90,
    83,
    true,
  ],
  [
    "Sneha Reddy",
    "STU-2026-0854",
    "UI/UX Design",
    "UI/UX Evening",
    "Kavya Reddy",
    81,
    76,
    true,
  ],
  [
    "Aditya Joshi",
    "STU-2026-0855",
    "Python Programming",
    "Python Beginners",
    "Suresh Kumar",
    89,
    84,
    true,
  ],
  [
    "Neha Kulkarni",
    "STU-2026-0856",
    "Full Stack Web Development",
    "React Morning Batch",
    "Rahul Sharma",
    95,
    92,
    true,
  ],
  [
    "Sana Khan",
    "STU-2026-0857",
    "Digital Marketing",
    "Marketing Evening",
    "Deepa Menon",
    83,
    78,
    true,
  ],
  [
    "Kabir Shah",
    "STU-2026-0858",
    "DevOps & Cloud",
    "Cloud Weekend",
    "Arun Patel",
    87,
    80,
    false,
  ],
];

export const CERTIFICATE_RECORDS = people.map((item, index) => ({
  id: index + 1,
  name: item[0],
  studentId: item[1],
  course: item[2],
  batch: item[3],
  trainer: item[4],
  completion: item[5],
  attendance: item[6],
  identityVerified: item[7],
  assignments: "15/15",
  assessmentPassed: true,
  score: index === 0 ? 72 : 74 + (index % 5) * 4,
  feePaid: true,
  enrolledDate: "February 1, 2026",
  completionDate: index < 4 ? "August 4, 2026" : "August 2, 2026",
  status: "Pending Review",
  certificateNo: null,
}));

const approved = [
  { ...CERTIFICATE_RECORDS[1], id: 101, status: "Approved" },
  { ...CERTIFICATE_RECORDS[2], id: 102, status: "Approved" },
  { ...CERTIFICATE_RECORDS[3], id: 103, status: "Approved" },
  { ...CERTIFICATE_RECORDS[4], id: 104, status: "Approved" },
  { ...CERTIFICATE_RECORDS[6], id: 105, status: "Approved" },
];

const issued = [
  {
    ...CERTIFICATE_RECORDS[9],
    id: 201,
    status: "Issued",
    certificateNo: "CERT-2026-001847",
    issuedDate: "August 4, 2026",
  },
  {
    ...CERTIFICATE_RECORDS[6],
    id: 202,
    status: "Issued",
    certificateNo: "CERT-2026-001846",
    issuedDate: "August 3, 2026",
  },
  {
    ...CERTIFICATE_RECORDS[4],
    id: 203,
    status: "Issued",
    certificateNo: "CERT-2026-001845",
    issuedDate: "August 2, 2026",
  },
  {
    ...CERTIFICATE_RECORDS[2],
    id: 204,
    status: "Issued",
    certificateNo: "CERT-2026-001844",
    issuedDate: "August 1, 2026",
  },
  {
    ...CERTIFICATE_RECORDS[7],
    id: 205,
    status: "Issued",
    certificateNo: "CERT-2026-001843",
    issuedDate: "July 31, 2026",
  },
  {
    ...CERTIFICATE_RECORDS[8],
    id: 206,
    status: "Issued",
    certificateNo: "CERT-2026-001842",
    issuedDate: "July 30, 2026",
  },
  {
    ...CERTIFICATE_RECORDS[10],
    id: 207,
    status: "Issued",
    certificateNo: "CERT-2026-001841",
    issuedDate: "July 28, 2026",
  },
  {
    ...CERTIFICATE_RECORDS[11],
    id: 208,
    status: "Issued",
    certificateNo: "CERT-2026-001840",
    issuedDate: "July 26, 2026",
  },
];

const revoked = [
  {
    ...CERTIFICATE_RECORDS[5],
    id: 301,
    status: "Revoked",
    certificateNo: "CERT-2026-001612",
    revokeReason: "Issued against an incorrect student record",
  },
  {
    ...CERTIFICATE_RECORDS[8],
    id: 302,
    status: "Revoked",
    certificateNo: "CERT-2026-001590",
    revokeReason: "Academic record was amended after issue",
  },
];

export default function useCertificates() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLog, setAuditLog] = useState([]);
  const nextCertificateNumber = useRef(1848);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRecords([...CERTIFICATE_RECORDS, ...approved, ...issued, ...revoked]);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const updateRecord = useCallback((id, changes, action) => {
    setRecords((items) =>
      items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
    setAuditLog((items) => [
      {
        id: Date.now(),
        recordId: id,
        action,
        by: "Rahul Sharma",
        at: new Date().toISOString(),
      },
      ...items,
    ]);
  }, []);

  const verifyIdentity = useCallback(
    (id) => {
      updateRecord(id, { identityVerified: true }, "Identity verified");
    },
    [updateRecord],
  );

  const rejectRequest = useCallback(
    (id, reason) => {
      updateRecord(
        id,
        { status: "Rejected", rejectionReason: reason },
        `Eligibility request rejected: ${reason}`,
      );
    },
    [updateRecord],
  );

  const approve = useCallback(
    (id) => {
      const record = records.find((item) => item.id === id);
      if (!record?.identityVerified)
        return { ok: false, error: "Identity verification is still pending." };
      updateRecord(
        id,
        { status: "Approved" },
        "Certificate approved and generated",
      );
      return { ok: true, record: { ...record, status: "Approved" } };
    },
    [records, updateRecord],
  );

  const issue = useCallback(
    (id) => {
      const number = `CERT-2026-${String(nextCertificateNumber.current).padStart(6, "0")}`;
      nextCertificateNumber.current += 1;
      updateRecord(
        id,
        {
          status: "Issued",
          certificateNo: number,
          issuedDate: "August 4, 2026",
        },
        `Certificate ${number} issued and student notified`,
      );
      return number;
    },
    [updateRecord],
  );

  const revoke = useCallback(
    (id, reason) => {
      if (!reason.trim())
        return { ok: false, error: "A revocation reason is required." };
      updateRecord(
        id,
        { status: "Revoked", revokeReason: reason.trim() },
        `Certificate revoked: ${reason.trim()}`,
      );
      return { ok: true };
    },
    [updateRecord],
  );

  const byStatus = useMemo(
    () => ({
      pending: records.filter((item) => item.status === "Pending Review"),
      approved: records.filter((item) => item.status === "Approved"),
      issued: records.filter((item) => item.status === "Issued"),
      revoked: records.filter((item) => item.status === "Revoked"),
    }),
    [records],
  );

  return {
    loading,
    records,
    byStatus,
    auditLog,
    stats: { eligible: 18, pending: 12, issuedMonth: 8, revoked: 2 },
    verifyIdentity,
    rejectRequest,
    approve,
    issue,
    revoke,
  };
}
