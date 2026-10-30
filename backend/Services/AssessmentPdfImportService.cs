using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using UglyToad.PdfPig;
using TalentSphereAPI.DTOs.AssessmentPdfImport;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services;

public sealed class AssessmentPdfImportService
    : IAssessmentPdfImportService
{
    private readonly ILogger<AssessmentPdfImportService> _logger;

    public AssessmentPdfImportService(
        ILogger<AssessmentPdfImportService> logger)
    {
        _logger = logger;
    }

    // ============================================================
    // MAIN IMPORT METHOD
    // ============================================================

    public async Task<AssessmentPdfImportResponseDto> ImportAsync(
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        if (file == null)
        {
            throw new ArgumentNullException(nameof(file));
        }

        if (file.Length == 0)
        {
            throw new ArgumentException(
                "PDF file is empty.",
                nameof(file));
        }

        if (string.IsNullOrWhiteSpace(file.FileName))
        {
            throw new ArgumentException(
                "PDF file name is required.",
                nameof(file));
        }

        var extension =
            Path.GetExtension(file.FileName);

        if (!string.Equals(
                extension,
                ".pdf",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException(
                "Only PDF files are supported.",
                nameof(file));
        }

        cancellationToken.ThrowIfCancellationRequested();

        // ========================================================
        // STEP 1: OPEN PDF
        // ========================================================

        await using var pdfStream =
            file.OpenReadStream();

        // ========================================================
        // STEP 2: EXTRACT TEXT
        // ========================================================

        var rawText =
            ExtractText(pdfStream);

        _logger.LogInformation(
            "====================================================");

        _logger.LogInformation(
            "ASSESSMENT PDF RAW TEXT");

        _logger.LogInformation(
            "File: {FileName}",
            file.FileName);

        _logger.LogInformation(
            "Extracted character count: {Length}",
            rawText.Length);

        _logger.LogInformation(
            "{RawText}",
            rawText);

        _logger.LogInformation(
            "====================================================");

        if (string.IsNullOrWhiteSpace(rawText))
        {
            throw new InvalidOperationException(
                "Unable to extract readable text from the PDF. " +
                "The PDF may be scanned or image-only.");
        }

        cancellationToken.ThrowIfCancellationRequested();

        // ========================================================
        // STEP 3: NORMALIZE
        // ========================================================

        var normalizedText =
            NormalizeText(rawText);

        _logger.LogInformation(
            "====================================================");

        _logger.LogInformation(
            "NORMALIZED ASSESSMENT PDF TEXT");

        _logger.LogInformation(
            "{NormalizedText}",
            normalizedText);

        _logger.LogInformation(
            "====================================================");

        // ========================================================
        // STEP 4: PARSE QUESTIONS
        // ========================================================

        var result =
            ParseQuestions(normalizedText);

        result.FileName =
            file.FileName;

        cancellationToken.ThrowIfCancellationRequested();

        // ========================================================
        // STEP 5: FINAL SUMMARY
        // ========================================================

        result.Summary.QuestionCount =
            result.Questions.Count;

        if (result.Questions.Count == 0)
        {
            result.Summary.TotalMarks =
                0;

            _logger.LogWarning(
                "ASSESSMENT PDF PARSER: ZERO QUESTIONS DETECTED.");
        }
        else if (result.Questions.All(
                     question => question.Marks.HasValue))
        {
            result.Summary.TotalMarks =
                result.Questions.Sum(
                    question => question.Marks!.Value);
        }
        else
        {
            result.Summary.TotalMarks =
                null;
        }

        // ========================================================
        // FINAL DEBUG SUMMARY
        // ========================================================

        _logger.LogInformation(
            "====================================================");

        _logger.LogInformation(
            "ASSESSMENT PDF PARSER RESULT");

        _logger.LogInformation(
            "File: {FileName}",
            result.FileName);

        _logger.LogInformation(
            "Question Count: {QuestionCount}",
            result.Summary.QuestionCount);

        _logger.LogInformation(
            "Total Marks: {TotalMarks}",
            result.Summary.TotalMarks);

        foreach (var question in result.Questions)
        {
            _logger.LogInformation(
                "Question {OrderNo} | " +
                "Text={Text} | " +
                "Type={Type} | " +
                "Difficulty={Difficulty} | " +
                "Marks={Marks} | " +
                "Options={Options} | " +
                "Correct={Correct} | " +
                "Status={Status}",

                question.OrderNo,
                question.QuestionText,
                question.QuestionType,
                question.Difficulty,
                question.Marks,
                question.Options.Count,
                question.CorrectAnswer,
                question.CorrectAnswerStatus);
        }

        _logger.LogInformation(
            "====================================================");

        await Task.CompletedTask;

        return result;
    }

    // ============================================================
    // PDF TEXT EXTRACTION
    // ============================================================

    private static string ExtractText(
        Stream pdfStream)
    {
        if (pdfStream.CanSeek)
        {
            pdfStream.Position = 0;
        }

        var builder =
            new StringBuilder();

        using var document =
            PdfDocument.Open(pdfStream);

        foreach (var page in document.GetPages())
        {
            var pageText =
                page.Text;

            if (!string.IsNullOrWhiteSpace(pageText))
            {
                builder.Append(pageText);
                builder.Append(' ');
            }

            // Page boundary is preserved only as whitespace.
            // It is NOT used to identify questions.
            builder.Append(' ');
        }

        return builder.ToString();
    }

    // ============================================================
    // NORMALIZE PDF TEXT
    // ============================================================

    private static string NormalizeText(
        string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        text = text
            .Replace('\u00A0', ' ')
            .Replace("\r\n", " ")
            .Replace('\r', ' ')
            .Replace('\n', ' ');

        // Collapse all whitespace.
        text =
            Regex.Replace(
                text,
                @"\s+",
                " ");

        return text.Trim();
    }

    // ============================================================
    // PARSE QUESTIONS
    // ============================================================

    private AssessmentPdfImportResponseDto ParseQuestions(
        string text)
    {
        var result =
            new AssessmentPdfImportResponseDto();

        if (string.IsNullOrWhiteSpace(text))
        {
            return result;
        }

        _logger.LogInformation(
            "====================================================");

        _logger.LogInformation(
            "QUESTION BOUNDARY DETECTION");

        // IMPORTANT:
        //
        // Do NOT require a newline before Question.
        //
        // This supports:
        //
        // Correct Answer: AQuestion 2Question:
        //
        // The parser detects Question 2 regardless
        // of what character comes immediately before it.

        var questionRegex =
            new Regex(
                @"Question\s+(?<number>\d+)\s*:?",
                RegexOptions.IgnoreCase |
                RegexOptions.Compiled);

        var matches =
            questionRegex.Matches(text);

        _logger.LogInformation(
            "Question boundaries detected: {Count}",
            matches.Count);

        // ========================================================
        // PARSE EACH QUESTION BLOCK
        // ========================================================

        for (var i = 0;
             i < matches.Count;
             i++)
        {
            var match =
                matches[i];

            if (!int.TryParse(
                    match.Groups["number"].Value,
                    out var questionNumber))
            {
                continue;
            }

            var blockStart =
                match.Index +
                match.Length;

            var blockEnd =
                i + 1 < matches.Count
                    ? matches[i + 1].Index
                    : text.Length;

            if (blockEnd <= blockStart)
            {
                continue;
            }

            var block =
                text.Substring(
                    blockStart,
                    blockEnd - blockStart)
                .Trim();

            _logger.LogInformation(
                "----------------------------------------------------");

            _logger.LogInformation(
                "QUESTION BLOCK {QuestionNumber}",
                questionNumber);

            _logger.LogInformation(
                "{Block}",
                block);

            var question =
                ParseQuestionBlock(
                    questionNumber,
                    block);

            if (string.IsNullOrWhiteSpace(
                    question.QuestionText))
            {
                _logger.LogWarning(
                    "Question {QuestionNumber}: " +
                    "Question text was not detected.",
                    questionNumber);

                continue;
            }

            result.Questions.Add(
                question);

            _logger.LogInformation(
                "Question {QuestionNumber} parsed successfully. " +
                "Type={Type}, Difficulty={Difficulty}, " +
                "Marks={Marks}, Options={Options}, " +
                "CorrectAnswer={Answer}, Status={Status}",

                questionNumber,
                question.QuestionType,
                question.Difficulty,
                question.Marks,
                question.Options.Count,
                question.CorrectAnswer,
                question.CorrectAnswerStatus);
        }

        // ========================================================
        // FALLBACK
        // ========================================================

        if (result.Questions.Count == 0)
        {
            _logger.LogWarning(
                "No 'Question <number>' headers detected. " +
                "Trying numbered-question fallback.");

            ParseNumberedQuestions(
                text,
                result);
        }

        return FinalizeResult(result);
    }

    // ============================================================
    // PARSE SINGLE QUESTION BLOCK
    // ============================================================

    private AssessmentPdfQuestionDto ParseQuestionBlock(
        int questionNumber,
        string block)
    {
        var question =
            new AssessmentPdfQuestionDto
            {
                OrderNo =
                    questionNumber
            };

        // ========================================================
        // QUESTION TEXT
        // ========================================================

        question.QuestionText =
            ExtractField(
                block,
                @"Question\s*:",
                new[]
                {
                    @"Type\s*:",
                    @"Difficulty\s*:",
                    @"Marks\s*:",
                    @"Option\s+[A-D]\s*:",
                    @"Correct\s+Answer\s*:"
                });

        // ========================================================
        // TYPE
        // ========================================================

        var type =
            ExtractField(
                block,
                @"Type\s*:",
                new[]
                {
                    @"Difficulty\s*:",
                    @"Marks\s*:",
                    @"Option\s+[A-D]\s*:",
                    @"Correct\s+Answer\s*:"
                });

        if (!string.IsNullOrWhiteSpace(type))
        {
            question.QuestionType =
                NormalizeQuestionType(type);
        }

        // ========================================================
        // DIFFICULTY
        // ========================================================

        var difficulty =
            ExtractField(
                block,
                @"Difficulty\s*:",
                new[]
                {
                    @"Marks\s*:",
                    @"Option\s+[A-D]\s*:",
                    @"Correct\s+Answer\s*:"
                });

        if (!string.IsNullOrWhiteSpace(difficulty))
        {
            question.Difficulty =
                difficulty.Trim();
        }

        // ========================================================
        // MARKS
        // ========================================================

        var marksText =
            ExtractField(
                block,
                @"Marks\s*:",
                new[]
                {
                    @"Option\s+[A-D]\s*:",
                    @"Correct\s+Answer\s*:"
                });

        if (int.TryParse(
                marksText,
                out var marks))
        {
            question.Marks =
                marks;
        }

        // ========================================================
        // OPTIONS
        // ========================================================

        question.Options =
            ExtractOptions(block);

        // ========================================================
        // CORRECT ANSWER
        // ========================================================

        var correctAnswer =
            ExtractField(
                block,
                @"Correct\s+Answer\s*:",
                Array.Empty<string>());

        if (!string.IsNullOrWhiteSpace(
                correctAnswer))
        {
            question.CorrectAnswer =
                correctAnswer.Trim();

            ApplyCorrectAnswer(
                question,
                correctAnswer.Trim());
        }
        else
        {
            question.CorrectAnswer =
                null;

            question.CorrectAnswerStatus =
                "Unresolved";

            foreach (var option in question.Options)
            {
                option.IsCorrect =
                    null;
            }
        }

        return question;
    }

    // ============================================================
    // EXTRACT FIELD
    // ============================================================

    private static string ExtractField(
        string block,
        string fieldPattern,
        string[] nextFieldPatterns)
    {
        if (string.IsNullOrWhiteSpace(block))
        {
            return string.Empty;
        }

        string lookAhead;

        if (nextFieldPatterns.Length > 0)
        {
            lookAhead =
                string.Join(
                    "|",
                    nextFieldPatterns.Select(
                        pattern =>
                            $"(?:{pattern})"));
        }
        else
        {
            // No next field means capture until end.
            lookAhead =
                "$^";
        }

        var pattern =
            $@"{fieldPattern}\s*(?<value>.*?)(?=\s*(?:{lookAhead})|$)";

        var match =
            Regex.Match(
                block,
                pattern,
                RegexOptions.IgnoreCase |
                RegexOptions.Singleline);

        if (!match.Success)
        {
            return string.Empty;
        }

        return CleanExtractedValue(
            match.Groups["value"].Value);
    }

    // ============================================================
    // CLEAN FIELD VALUE
    // ============================================================

    private static string CleanExtractedValue(
        string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        value =
            Regex.Replace(
                value,
                @"\s+",
                " ");

        return value.Trim();
    }

    // ============================================================
    // EXTRACT OPTIONS
    // ============================================================

    private static List<AssessmentPdfOptionDto>
        ExtractOptions(string block)
    {
        var options =
            new List<AssessmentPdfOptionDto>();

        // ========================================================
        // PRIMARY FORMAT
        //
        // Option A: ...
        // Option B: ...
        // Option C: ...
        // Option D: ...
        //
        // Also supports:
        //
        // Option A: ...Option B: ...Option C: ...Option D: ...
        // ========================================================

        var optionRegex =
            new Regex(
                @"Option\s+(?<letter>[A-D])\s*:\s*(?<text>.*?)(?=\s*Option\s+[A-D]\s*:|\s*Correct\s+Answer\s*:|$)",
                RegexOptions.IgnoreCase |
                RegexOptions.Singleline |
                RegexOptions.Compiled);

        foreach (
            Match match
            in optionRegex.Matches(block))
        {
            var optionText =
                CleanExtractedValue(
                    match.Groups["text"].Value);

            if (string.IsNullOrWhiteSpace(
                    optionText))
            {
                continue;
            }

            options.Add(
                new AssessmentPdfOptionDto
                {
                    Text =
                        optionText,

                    IsCorrect =
                        null
                });
        }

        // ========================================================
        // FALLBACK
        //
        // A) ...
        // B) ...
        // C) ...
        // D) ...
        // ========================================================

        if (options.Count == 0)
        {
            var fallbackRegex =
                new Regex(
                    @"(?<![A-Za-z])(?<letter>[A-D])[\)\.\:\-]\s*(?<text>.*?)(?=\s+[A-D][\)\.\:\-]\s*|\s*Correct\s+Answer\s*:|$)",
                    RegexOptions.IgnoreCase |
                    RegexOptions.Singleline |
                    RegexOptions.Compiled);

            foreach (
                Match match
                in fallbackRegex.Matches(block))
            {
                var optionText =
                    CleanExtractedValue(
                        match.Groups["text"].Value);

                if (string.IsNullOrWhiteSpace(
                        optionText))
                {
                    continue;
                }

                options.Add(
                    new AssessmentPdfOptionDto
                    {
                        Text =
                            optionText,

                        IsCorrect =
                            null
                    });
            }
        }

        return options;
    }

    // ============================================================
    // CORRECT ANSWER
    // ============================================================

    private static void ApplyCorrectAnswer(
        AssessmentPdfQuestionDto question,
        string answer)
    {
        if (string.IsNullOrWhiteSpace(answer))
        {
            question.CorrectAnswerStatus =
                "Unresolved";

            foreach (var option in question.Options)
            {
                option.IsCorrect =
                    null;
            }

            return;
        }

        answer =
            answer.Trim();

        // ========================================================
        // LETTER ANSWER
        // ========================================================

        var letterMatch =
            Regex.Match(
                answer,
                @"^\s*([A-Da-d])(?:[\)\.\:\-]|\s|$)");

        if (letterMatch.Success)
        {
            var target =
                letterMatch.Groups[1]
                    .Value
                    .ToUpperInvariant();

            var targetIndex =
                target[0] - 'A';

            if (targetIndex >= 0 &&
                targetIndex < question.Options.Count)
            {
                for (var i = 0;
                     i < question.Options.Count;
                     i++)
                {
                    question.Options[i].IsCorrect =
                        i == targetIndex;
                }

                question.CorrectAnswer =
                    target;

                question.CorrectAnswerStatus =
                    "Resolved";

                return;
            }
        }

        // ========================================================
        // OPTION TEXT ANSWER
        // ========================================================

        var answerOption =
            question.Options.FirstOrDefault(
                option =>
                    string.Equals(
                        NormalizeComparable(
                            option.Text),
                        NormalizeComparable(
                            answer),
                        StringComparison.OrdinalIgnoreCase));

        if (answerOption != null)
        {
            foreach (var option in question.Options)
            {
                option.IsCorrect =
                    ReferenceEquals(
                        option,
                        answerOption);
            }

            question.CorrectAnswer =
                answerOption.Text;

            question.CorrectAnswerStatus =
                "Resolved";

            return;
        }

        // ========================================================
        // UNRESOLVED
        // ========================================================

        question.CorrectAnswer =
            answer;

        question.CorrectAnswerStatus =
            "Unresolved";

        foreach (var option in question.Options)
        {
            option.IsCorrect =
                null;
        }
    }

    // ============================================================
    // NUMBERED QUESTION FALLBACK
    // ============================================================

    private void ParseNumberedQuestions(
        string text,
        AssessmentPdfImportResponseDto result)
    {
        var regex =
            new Regex(
                @"(?<!\d)(?<number>\d+)\s*[\.\):\-]\s*(?<text>.+?)(?=\s+\d+\s*[\.\):\-]|$)",
                RegexOptions.IgnoreCase |
                RegexOptions.Singleline |
                RegexOptions.Compiled);

        var matches =
            regex.Matches(text);

        _logger.LogInformation(
            "Fallback numbered questions detected: {Count}",
            matches.Count);

        for (var i = 0;
             i < matches.Count;
             i++)
        {
            var match =
                matches[i];

            if (!int.TryParse(
                    match.Groups["number"].Value,
                    out var questionNumber))
            {
                continue;
            }

            var questionText =
                CleanExtractedValue(
                    match.Groups["text"].Value);

            if (string.IsNullOrWhiteSpace(
                    questionText))
            {
                continue;
            }

            var question =
                new AssessmentPdfQuestionDto
                {
                    OrderNo =
                        questionNumber,

                    QuestionText =
                        questionText
                };

            result.Questions.Add(
                question);
        }
    }

    // ============================================================
    // FINALIZE
    // ============================================================

    private AssessmentPdfImportResponseDto FinalizeResult(
        AssessmentPdfImportResponseDto result)
    {
        result.Questions =
            result.Questions
                .OrderBy(x => x.OrderNo)
                .ToList();

        // Remove duplicate question numbers if any.
        result.Questions =
            result.Questions
                .GroupBy(x => x.OrderNo)
                .Select(x => x.First())
                .ToList();

        // Normalize order.
        for (var i = 0;
             i < result.Questions.Count;
             i++)
        {
            result.Questions[i].OrderNo =
                i + 1;
        }

        result.Summary.QuestionCount =
            result.Questions.Count;

        if (result.Questions.Count == 0)
        {
            result.Summary.TotalMarks =
                0;
        }
        else if (result.Questions.All(
                     x => x.Marks.HasValue))
        {
            result.Summary.TotalMarks =
                result.Questions.Sum(
                    x => x.Marks!.Value);
        }
        else
        {
            result.Summary.TotalMarks =
                null;
        }

        return result;
    }

    // ============================================================
    // NORMALIZE COMPARISON
    // ============================================================

    private static string NormalizeComparable(
        string value)
    {
        return Regex.Replace(
                value ?? string.Empty,
                @"\s+",
                " ")
            .Trim()
            .TrimEnd(
                '.',
                ')',
                ':');
    }

    // ============================================================
    // NORMALIZE QUESTION TYPE
    // ============================================================

    private static string NormalizeQuestionType(
        string value)
    {
        var type =
            value.Trim();

        if (type.Equals(
                "MCQ",
                StringComparison.OrdinalIgnoreCase) ||
            type.Equals(
                "Multiple Choice",
                StringComparison.OrdinalIgnoreCase) ||
            type.Equals(
                "Multiple Choice Question",
                StringComparison.OrdinalIgnoreCase))
        {
            return "MCQ";
        }

        if (type.Equals(
                "True/False",
                StringComparison.OrdinalIgnoreCase) ||
            type.Equals(
                "True False",
                StringComparison.OrdinalIgnoreCase))
        {
            return "TrueFalse";
        }

        if (type.Equals(
                "Descriptive",
                StringComparison.OrdinalIgnoreCase) ||
            type.Equals(
                "Subjective",
                StringComparison.OrdinalIgnoreCase))
        {
            return "Descriptive";
        }

        if (type.Equals(
                "Short Answer",
                StringComparison.OrdinalIgnoreCase))
        {
            return "ShortAnswer";
        }

        return type;
    }
}