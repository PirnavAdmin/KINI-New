using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentSphereAPI.Data;

namespace TalentSphereAPI.SignalR
{
    [Authorize(Roles = "Mentor,Student")]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task JoinConversation(
            int conversationId)
        {
            await AuthorizeConversationAsync(
                conversationId);

            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                GetConversationGroup(
                    conversationId));
        }

        public async Task LeaveConversation(
            int conversationId)
        {
            await AuthorizeConversationAsync(
                conversationId);

            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                GetConversationGroup(
                    conversationId));
        }

        private async Task
            AuthorizeConversationAsync(
                int conversationId)
        {
            var organizationClaim =
                Context.User?
                    .FindFirst("OrganizationId")
                    ?.Value;

            var role =
                Context.User?
                    .FindFirst(ClaimTypes.Role)
                    ?.Value
                     ?? string.Empty;

            if (!int.TryParse(
                    organizationClaim,
                    out var organizationId))
            {
                throw new HubException(
                    "OrganizationId was not found.");
            }

            var conversation =
                await _context.ChatConversations
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.ConversationId ==
                            conversationId &&
                        x.OrganizationId ==
                            organizationId &&
                        x.IsActive);

            if (conversation == null)
            {
                throw new HubException(
                    "Conversation not found.");
            }

            if (role.Equals(
                    "Mentor",
                    StringComparison.OrdinalIgnoreCase))
            {
                var userIdText =
                    Context.User?
                        .FindFirst(
                            ClaimTypes.NameIdentifier)
                        ?.Value;

                if (!int.TryParse(
                        userIdText,
                        out var userId))
                {
                    throw new HubException(
                        "Invalid user identity.");
                }

                var mentor =
                    await (
                        from mentorRecord in _context.Mentors

                        join employee in _context.Employees
                            on mentorRecord.EmployeeId
                            equals employee.EmployeeId

                        where employee.UserId == userId &&
                              mentorRecord.OrganizationId ==
                                  organizationId &&
                              employee.OrganizationId ==
                                  organizationId &&
                              !mentorRecord.IsDeleted &&
                              !employee.IsDeleted

                        select mentorRecord
                    )
                    .FirstOrDefaultAsync();

                if (mentor == null ||
                    mentor.MentorId !=
                        conversation.MentorId)
                {
                    throw new HubException(
                        "You are not a participant in this conversation.");
                }
            }
            else if (role.Equals(
                         "Student",
                         StringComparison.OrdinalIgnoreCase))
            {
                var studentIdText =
                    Context.User?
                        .FindFirst("StudentId")
                        ?.Value;

                if (!int.TryParse(
                        studentIdText,
                        out var studentId))
                {
                    var nameIdentifier =
                        Context.User?
                            .FindFirst(
                                ClaimTypes.NameIdentifier)
                            ?.Value;

                    if (!int.TryParse(
                            nameIdentifier,
                            out studentId))
                    {
                        throw new HubException(
                            "Student identity was not found.");
                    }
                }

                var student =
                    await _context.Students
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x =>
                            x.StudentId ==
                                studentId &&
                            x.OrganizationId ==
                                organizationId &&
                            !x.IsDeleted);

                if (student == null ||
                    student.StudentId !=
                        conversation.StudentId)
                {
                    throw new HubException(
                        "You are not a participant in this conversation.");
                }
            }
            else
            {
                throw new HubException(
                    "Only Mentor and Student users can use chat.");
            }
        }

        public static string GetConversationGroup(
            int conversationId)
        {
            return $"chat-{conversationId}";
        }
    }
}