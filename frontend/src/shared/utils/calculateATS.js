export const calculateATS = (
  formData
) => {
  let score = 50;

  if (formData.fullName)
    score += 5;

  if (formData.email)
    score += 5;

  if (formData.phone)
    score += 5;

  if (formData.skills)
    score += 15;

  if (formData.education)
    score += 10;

  if (formData.experience)
    score += 10;

  return Math.min(score, 100);
};