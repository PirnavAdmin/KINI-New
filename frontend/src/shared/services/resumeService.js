import { aiApi } from "./apiServices";

export const generateResume = async (formData) => {
  const prompt = `Create a concise ATS-friendly professional resume in plain text using only these details.\nName: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nSkills: ${formData.skills}\nEducation: ${formData.education}\nExperience: ${formData.experience}`;
  const result = await aiApi.chat(prompt);
  return { resume: result?.response ?? result?.message ?? result?.answer ?? result?.text ?? String(result || "") };
};
