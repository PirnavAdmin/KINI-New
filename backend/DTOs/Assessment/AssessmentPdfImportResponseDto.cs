namespace TalentSphereAPI.DTOs.AssessmentPdfImport;

public class AssessmentPdfImportResponseDto
{
    public string FileName { get; set; } = string.Empty;

    public AssessmentPdfSummaryDto Summary { get; set; } = new();

    public List<AssessmentPdfQuestionDto> Questions { get; set; } = new();
}

public class AssessmentPdfSummaryDto
{
    public int QuestionCount { get; set; }

    public int? TotalMarks { get; set; }
}

public class AssessmentPdfQuestionDto
{
    public int OrderNo { get; set; }

    public string QuestionText { get; set; } = string.Empty;

    public string QuestionType { get; set; } = string.Empty;

    public string Difficulty { get; set; } = string.Empty;

    public int? Marks { get; set; }

    public List<AssessmentPdfOptionDto> Options { get; set; } = new();

    public string? CorrectAnswer { get; set; }

    public string CorrectAnswerStatus { get; set; } = "Unresolved";
}

public class AssessmentPdfOptionDto
{
    public string Text { get; set; } = string.Empty;

    public bool? IsCorrect { get; set; }
}