import { z } from "zod";

export const registerSchema = z.object({
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
    .email("Please enter a valid email address (e.g. you@example.com)"),

  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^\d{10}$/, "Enter exactly 10 digits")
    .refine(
      (val) => /^[6-9]\d{9}$/.test(val),
      "Mobile number must start with 6, 7, 8, or 9"
    ),

  qualification: z
    .string()
    .trim()
    .min(2, "Degree details must be at least 2 characters")
    .max(100, "Degree details must be under 100 characters")
    .refine((val) => /[A-Za-z]/.test(val), {
      message: "Degree details must contain at least one letter",
    }),
});

export const registerDefaultValues = {
  name: "",
  email: "",
  mobileNumber: "",
  qualification: "",
};