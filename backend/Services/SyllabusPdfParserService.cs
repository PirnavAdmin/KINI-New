using System.Text;
using System.Text.RegularExpressions;
using UglyToad.PdfPig;
using TalentSphereAPI.DTOs.Syllabus;
using TalentSphereAPI.Services.Interfaces;

namespace TalentSphereAPI.Services;

public class SyllabusPdfParserService : ISyllabusPdfParserService
{
    public async Task<SyllabusPdfImportResponseDto> ParseAsync(
        Stream pdfStream,
        string fileName,
        long fileSize,
        int courseId)
    {
        if (pdfStream == null)
            throw new ArgumentNullException(nameof(pdfStream));

        var text = ExtractText(pdfStream);

        if (string.IsNullOrWhiteSpace(text))
        {
            throw new InvalidOperationException(
                "Unable to extract syllabus content from this PDF");
        }

        // Useful while debugging the actual PDF extraction.
        Console.WriteLine("========== RAW PDF TEXT ==========");
        Console.WriteLine(text);
        Console.WriteLine("========== END RAW PDF TEXT ==========");

        var result = ParseSyllabus(
            text,
            courseId,
            fileName,
            fileSize);

        return await Task.FromResult(result);
    }

    // ============================================================
    // PDF TEXT EXTRACTION
    // ============================================================

    private static string ExtractText(Stream pdfStream)
    {
        var builder = new StringBuilder();

        using var document = PdfDocument.Open(pdfStream);

        foreach (var page in document.GetPages())
        {
            var pageText = page.Text;

            if (!string.IsNullOrWhiteSpace(pageText))
            {
                builder.AppendLine(pageText);
            }
        }

        return builder.ToString();
    }

    // ============================================================
    // MAIN PARSER
    // ============================================================

    private static SyllabusPdfImportResponseDto ParseSyllabus(
        string text,
        int courseId,
        string fileName,
        long fileSize)
    {
        var result = new SyllabusPdfImportResponseDto
        {
            CourseId = courseId,
            FileName = fileName,
            FileSize = fileSize
        };

        /*
         * IMPORTANT:
         *
         * Do NOT use:
         *
         * text.Split('\n')
         *
         * because PDF extraction can return:
         *
         * Module 1: Node.js FundamentalsModule Description: ...
         *
         * Instead, we find explicit markers anywhere in the
         * complete extracted text.
         */

        var normalizedText = NormalizePdfText(text);

        var tokens = ExtractTokens(normalizedText);

        SyllabusModuleImportDto? currentModule = null;
        SyllabusTopicImportDto? currentTopic = null;
        SyllabusLessonImportDto? currentLesson = null;

        foreach (var token in tokens)
        {
            var value = CleanText(token.Content);

            switch (token.Type)
            {
                // ====================================================
                // MODULE
                // ====================================================

                case TokenType.Module:

                    if (string.IsNullOrWhiteSpace(value))
                        continue;

                    currentModule =
                        new SyllabusModuleImportDto
                        {
                            Name = value,
                            Description = string.Empty
                        };

                    result.Modules.Add(currentModule);

                    currentTopic = null;
                    currentLesson = null;

                    break;

                // ====================================================
                // MODULE DESCRIPTION
                // ====================================================

                case TokenType.ModuleDescription:

                    if (currentModule == null)
                        continue;

                    currentModule.Description =
                        value;

                    break;

                // ====================================================
                // TOPIC
                // ====================================================

                case TokenType.Topic:

                    if (string.IsNullOrWhiteSpace(value))
                        continue;

                    /*
                     * If somehow a topic appears before a module,
                     * create a fallback module.
                     */

                    if (currentModule == null)
                    {
                        currentModule =
                            new SyllabusModuleImportDto
                            {
                                Name = "General",
                                Description = string.Empty
                            };

                        result.Modules.Add(currentModule);
                    }

                    currentTopic =
                        new SyllabusTopicImportDto
                        {
                            Name = value,
                            Description = string.Empty
                        };

                    currentModule.Topics.Add(
                        currentTopic);

                    currentLesson = null;

                    break;

                // ====================================================
                // TOPIC DESCRIPTION
                // ====================================================

                case TokenType.TopicDescription:

                    if (currentTopic == null)
                        continue;

                    currentTopic.Description =
                        value;

                    break;

                // ====================================================
                // LESSON
                // ====================================================

                case TokenType.Lesson:

                    if (string.IsNullOrWhiteSpace(value))
                        continue;

                    if (currentModule == null)
                    {
                        currentModule =
                            new SyllabusModuleImportDto
                            {
                                Name = "General",
                                Description = string.Empty
                            };

                        result.Modules.Add(
                            currentModule);
                    }

                    if (currentTopic == null)
                    {
                        currentTopic =
                            new SyllabusTopicImportDto
                            {
                                Name = "General",
                                Description = string.Empty
                            };

                        currentModule.Topics.Add(
                            currentTopic);
                    }

                    currentLesson =
                        new SyllabusLessonImportDto
                        {
                            Name = value,
                            Description = string.Empty
                        };

                    currentTopic.Lessons.Add(
                        currentLesson);

                    break;

                // ====================================================
                // LESSON DESCRIPTION
                // ====================================================

                case TokenType.LessonDescription:

                    if (currentLesson == null)
                        continue;

                    currentLesson.Description =
                        value;

                    break;
            }
        }

        CalculateSummary(result);

        return result;
    }

    // ============================================================
    // NORMALIZE PDF TEXT
    // ============================================================

    private static string NormalizePdfText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        /*
         * Replace non-breaking spaces.
         */

        text = text.Replace('\u00A0', ' ');

        /*
         * Normalize newlines to spaces.
         *
         * We intentionally do this because the parser below
         * uses explicit markers instead of newlines.
         */

        text = text
            .Replace("\r\n", " ")
            .Replace("\r", " ")
            .Replace("\n", " ");

        /*
         * Collapse multiple spaces.
         */

        text = Regex.Replace(
            text,
            @"\s+",
            " ");

        return text.Trim();
    }

    // ============================================================
    // TOKEN EXTRACTION
    // ============================================================

    private static List<ParserToken> ExtractTokens(
        string text)
    {
        var tokens = new List<ParserToken>();

        /*
         * IMPORTANT:
         *
         * Module requires a NUMBER.
         *
         * Therefore:
         *
         * Module 1:
         *
         * matches Module.
         *
         * But:
         *
         * Module Description:
         *
         * does NOT match Module.
         *
         * It is handled separately.
         */

        var markerRegex = new Regex(
            @"(?<marker>" +
            @"Module\s+\d+\s*:" +
            @"|" +
            @"Module\s+Description\s*:" +
            @"|" +
            @"Topic\s+\d+\s*:" +
            @"|" +
            @"Topic\s+Description\s*:" +
            @"|" +
            @"Lesson\s+\d+\s*:" +
            @"|" +
            @"Lesson\s+Description\s*:" +
            @")",
            RegexOptions.IgnoreCase |
            RegexOptions.Compiled);

        var matches =
            markerRegex.Matches(text);

        if (matches.Count == 0)
        {
            return tokens;
        }

        for (var i = 0; i < matches.Count; i++)
        {
            var match = matches[i];

            var marker =
                match.Groups["marker"]
                    .Value
                    .Trim();

            var contentStart =
                match.Index + match.Length;

            var contentEnd =
                i + 1 < matches.Count
                    ? matches[i + 1].Index
                    : text.Length;

            if (contentEnd < contentStart)
                continue;

            var content =
                text.Substring(
                    contentStart,
                    contentEnd - contentStart);

            var tokenType =
                GetTokenType(marker);

            tokens.Add(
                new ParserToken
                {
                    Type = tokenType,
                    Content = CleanText(content)
                });
        }

        return tokens;
    }

    // ============================================================
    // TOKEN TYPE
    // ============================================================

    private static TokenType GetTokenType(
        string marker)
    {
        if (Regex.IsMatch(
                marker,
                @"^Module\s+Description\s*:",
                RegexOptions.IgnoreCase))
        {
            return TokenType.ModuleDescription;
        }

        if (Regex.IsMatch(
                marker,
                @"^Topic\s+Description\s*:",
                RegexOptions.IgnoreCase))
        {
            return TokenType.TopicDescription;
        }

        if (Regex.IsMatch(
                marker,
                @"^Lesson\s+Description\s*:",
                RegexOptions.IgnoreCase))
        {
            return TokenType.LessonDescription;
        }

        if (Regex.IsMatch(
                marker,
                @"^Module\s+\d+\s*:",
                RegexOptions.IgnoreCase))
        {
            return TokenType.Module;
        }

        if (Regex.IsMatch(
                marker,
                @"^Topic\s+\d+\s*:",
                RegexOptions.IgnoreCase))
        {
            return TokenType.Topic;
        }

        if (Regex.IsMatch(
                marker,
                @"^Lesson\s+\d+\s*:",
                RegexOptions.IgnoreCase))
        {
            return TokenType.Lesson;
        }

        throw new InvalidOperationException(
            $"Unknown syllabus marker: {marker}");
    }

    // ============================================================
    // CLEAN TEXT
    // ============================================================

    private static string CleanText(
        string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        value = value
            .Replace('\u00A0', ' ')
            .Trim();

        value = Regex.Replace(
            value,
            @"\s+",
            " ");

        return value.Trim(
            ' ',
            '\r',
            '\n',
            '\t',
            ':',
            '-',
            '–',
            '—');
    }

    // ============================================================
    // SUMMARY
    // ============================================================

    private static void CalculateSummary(
        SyllabusPdfImportResponseDto result)
    {
        result.Summary ??=
            new SyllabusSummaryDto();

        result.Summary.ModuleCount =
            result.Modules.Count;

        result.Summary.TopicCount =
            result.Modules
                .Sum(x => x.Topics.Count);

        result.Summary.LessonCount =
            result.Modules
                .SelectMany(x => x.Topics)
                .Sum(x => x.Lessons.Count);

        /*
         * Use the first actual module description as the
         * syllabus description.
         */

        result.Description =
            result.Modules
                .Select(x => x.Description)
                .FirstOrDefault(
                    x => !string.IsNullOrWhiteSpace(x))
            ?? string.Empty;
    }

    // ============================================================
    // INTERNAL TYPES
    // ============================================================

    private sealed class ParserToken
    {
        public TokenType Type { get; set; }

        public string Content { get; set; } =
            string.Empty;
    }

    private enum TokenType
    {
        Module,
        ModuleDescription,
        Topic,
        TopicDescription,
        Lesson,
        LessonDescription
    }
}