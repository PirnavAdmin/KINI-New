using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using TalentSphereAPI.DTOs.Common;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    /// <summary>
    /// Standard envelopes for the enrollment/UPI endpoints (requirement doc §6):
    ///   success: { success: true, message, data [, pagination] }
    ///   error:   { success: false, message, errorCode [, errors: [{ field, message }]] }
    /// <c>code</c> is kept next to <c>errorCode</c> for existing clients.
    /// Scoped to these controllers only; other modules keep their formats.
    /// </summary>
    public static class EnrollmentApi
    {
        public static object Success(string message, object? data) =>
            new { success = true, message, data };

        public static object Paged<T>(string message, PagedResponse<T> page) => new
        {
            success = true,
            message,
            data = page.Data,
            pagination = new
            {
                page = page.PageNumber,
                limit = page.PageSize,
                totalRecords = page.TotalRecords,
                totalPages = page.TotalPages
            }
        };

        public static object Error(string message, string errorCode) =>
            new { success = false, message, errorCode, code = errorCode };

        public static object Validation(IEnumerable<KeyValuePair<string, string[]>> errors) => new
        {
            success = false,
            message = "Invalid request data",
            errorCode = "VALIDATION_ERROR",
            code = "VALIDATION_ERROR",
            errors = errors
                .SelectMany(e => e.Value.Select(m => new { field = FieldName(e.Key), message = m }))
                .ToList()
        };

        public static IActionResult FromException(Exception ex) => ex switch
        {
            EnrollmentValidationException v => new BadRequestObjectResult(Validation(v.Errors)),
            EnrollmentWorkflowException w => new ObjectResult(Error(w.Message, w.Code)) { StatusCode = w.StatusCode },
            _ => throw ex
        };

        /// <summary>"StudentDetails.FullName" / "$.utrNumber" → "studentDetails.fullName" / "utrNumber".</summary>
        public static string FieldName(string key)
        {
            key = key.TrimStart('$', '.');
            if (string.IsNullOrEmpty(key))
                return "request";
            return string.Join('.', key.Split('.').Select(part =>
                part.Length == 0 ? part : char.ToLowerInvariant(part[0]) + part[1..]));
        }

        internal static IEnumerable<KeyValuePair<string, string[]>> FromModelState(ModelStateDictionary modelState) =>
            modelState
                .Where(e => e.Value?.Errors.Count > 0)
                .Select(e => new KeyValuePair<string, string[]>(
                    e.Key,
                    e.Value!.Errors
                        .Select(x => string.IsNullOrWhiteSpace(x.ErrorMessage) ? "The value is invalid." : x.ErrorMessage)
                        .ToArray()));
    }

    /// <summary>
    /// Returns model-binding / FluentValidation errors in the enrollment
    /// envelope. Runs before [ApiController]'s ModelStateInvalidFilter (order -2000).
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public sealed class EnrollmentApiValidationAttribute : Attribute, IActionFilter, IOrderedFilter
    {
        public int Order => -3000;

        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
                context.Result = new BadRequestObjectResult(EnrollmentApi.Validation(EnrollmentApi.FromModelState(context.ModelState)));
        }

        public void OnActionExecuted(ActionExecutedContext context) { }
    }
}
