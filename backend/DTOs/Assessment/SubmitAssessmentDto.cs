namespace TalentSphereAPI.DTOs.Assessment
{
    public class SubmitAssessmentDto
    {
        public int StudentAssessmentId { get; set; }

        public List<StudentAnswerDto> Answers { get; set; } = new();
    }

    public class StudentAnswerDto
    {
        public int QuestionId { get; set; }

        public int SelectedOptionId { get; set; }
    }
}