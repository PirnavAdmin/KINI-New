namespace TalentSphereAPI.DTOs.StudentAssessment
{
    public class SubmitAssessmentDto
    {
        public int StudentAssessmentId { get; set; }

        public List<StudentAnswerDto> Answers { get; set; } = new();
    }
}