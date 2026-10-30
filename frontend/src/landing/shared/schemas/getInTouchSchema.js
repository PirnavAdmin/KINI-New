import { z } from "zod";

export const SUBJECT_OPTIONS = [
  { value: "Course Enquiry", label: "Course Enquiry" },
  { value: "Placement", label: "Placement" },
  { value: "Demo Class", label: "Demo Class" },
  { value: "Scholarship", label: "Scholarship" },
  { value: "General Enquiry", label: "General Enquiry" },
];

export const getInTouchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be under 60 characters")
    .regex(/^[A-Za-z\s'\-.]*$/, {
      message: "Name can only contain letters, spaces, hyphens, apostrophes, or periods",
    })
    .refine((val) => !/\d/.test(val), {
      message: "Name should not contain numbers",
    })
    .refine((val) => /[A-Za-z]/.test(val), {
      message: "Name must contain at least one letter",
    }),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address (e.g., you@example.com)"),

  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .refine(
      (val) => /^[6-9]\d{9}$/.test(val),
      "Mobile number must start with 6, 7, 8, or 9"
    ),

  subject: z
    .string()
    .min(1, "Please select a subject"),

  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(500, "Message must be under 500 characters"),
});

export const getInTouchDefaultValues = {
  name: "",
  email: "",
  mobileNumber: "",
  subject: "",
  message: "",
};