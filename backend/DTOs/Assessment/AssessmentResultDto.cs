namespace TalentSphereAPI.DTOs.Assessment
{
    public class AssessmentResultDto
    {
        public decimal Score { get; set; }

        public decimal Percentage { get; set; }

        public string Result { get; set; } = string.Empty;
    }
}