const present = (value) => value !== undefined && value !== null && String(value).trim() !== "";

export const getMentorSessionIdentity = (user = {}) => {
  const mentorId = user?.mentorId ?? user?.MentorId
    ?? user?.tutorId ?? user?.TutorId ?? user?.trainerId ?? user?.TrainerId
    ?? user?.mentor?.mentorId ?? user?.mentor?.id
    ?? user?.data?.mentorId ?? user?.data?.tutorId ?? user?.data?.trainerId
    ?? localStorage.getItem("mentorId");
  const employeeId = user?.employeeId ?? user?.EmployeeId
    ?? user?.employeeRecordId ?? user?.staffId
    ?? user?.employee?.employeeId ?? user?.employee?.id
    ?? user?.data?.employeeId ?? user?.data?.employeeRecordId ?? user?.data?.staffId
    ?? localStorage.getItem("employeeId");
  const userId = user?.userId ?? user?.UserId ?? user?.id ?? localStorage.getItem("userId");

  return {
    mentorId: present(mentorId) ? mentorId : null,
    employeeId: present(employeeId) ? employeeId : null,
    userId: present(userId) ? userId : null,
  };
};

export const logMentorSessionIdentity = (user, identity) => {
  if (!import.meta.env.DEV) return;
  const key = `${identity.mentorId ?? "missing"}:${identity.employeeId ?? "missing"}:${identity.userId ?? "missing"}`;
  if (sessionStorage.getItem("kini:mentor-identity-log") === key) return;
  sessionStorage.setItem("kini:mentor-identity-log", key);
  console.info("Mentor session identity", {
    mentorId: identity.mentorId,
    employeeId: identity.employeeId,
    userId: identity.userId,
    email: user?.email,
  });
};
