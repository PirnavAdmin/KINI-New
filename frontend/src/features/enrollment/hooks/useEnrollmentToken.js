import { useState } from "react";
import { enrollmentAccess } from "@shared/services/publicEnrollmentApi";

/**
 * The enrollment-specific access token for :enrollmentId — from the emailed
 * link's #token= fragment (captured once and removed from the URL), else from
 * this browser's saved enrollments.
 */
export default function useEnrollmentToken(enrollmentId) {
  const [token] = useState(() =>
    enrollmentAccess.captureFromLocation(enrollmentId) || enrollmentAccess.get(enrollmentId)?.token || null);
  return token;
}
