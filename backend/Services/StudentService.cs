using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Linq;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Student;
using Google.Apis.Auth;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Enums;
using TalentSphereAPI.Helpers;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services.Interfaces;
using TalentSphereAPI.Services.Tenancy;

namespace TalentSphereAPI.Services
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _repository;
        private readonly IAuthRepository _authRepository;
        private readonly IEmailService _emailService;
        private readonly IBatchRepository _batchRepository;
        private readonly ApplicationDbContext _context;
        private readonly ITenantContext _tenantContext;
        private readonly INotificationService _notificationService;
        private readonly IJwtService _jwtService;

        private readonly IConfiguration _configuration;

        public StudentService(
            IStudentRepository repository,
            IAuthRepository authRepository,
            IEmailService emailService,
            IBatchRepository batchRepository,
            ApplicationDbContext context,
            ITenantContext tenantContext,
            INotificationService notificationService,
IJwtService jwtService,
IConfiguration configuration)
        {
            _repository = repository;

            _authRepository = authRepository;

            _emailService = emailService;

            _batchRepository = batchRepository;

            _context = context;

            _tenantContext = tenantContext;

            _notificationService = notificationService;
            _jwtService = jwtService;

            _configuration = configuration;
        }

        // ==================================================
        // STUDENT GOOGLE LOGIN
        // ==================================================

        // ==================================================
        // STUDENT GOOGLE LOGIN
        // ==================================================

        public async Task<LoginResponseDto> GoogleLoginAsync(
            StudentGoogleLoginDto dto)
        {
            // ==================================================
            // 1. VALIDATE REQUEST
            // ==================================================

            if (dto == null ||
                string.IsNullOrWhiteSpace(dto.Credential))
            {
                throw new UnauthorizedAccessException(
                    "Google credential is required.");
            }

            // ==================================================
            // 2. GOOGLE CLIENT ID
            // ==================================================

            var googleClientId =
                _configuration["Google:ClientId"];

            if (string.IsNullOrWhiteSpace(googleClientId))
            {
                throw new InvalidOperationException(
                    "Google Client ID is not configured.");
            }

            // ==================================================
            // 3. VALIDATE GOOGLE ID TOKEN
            // ==================================================

            GoogleJsonWebSignature.Payload payload;

            try
            {
                var validationSettings =
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[]
                        {
                    googleClientId
                        }
                    };

                payload =
                    await GoogleJsonWebSignature.ValidateAsync(
                        dto.Credential,
                        validationSettings);
            }
            catch
            {
                throw new UnauthorizedAccessException(
                    "Invalid Google credential.");
            }

            // ==================================================
            // 4. GET GOOGLE INFORMATION
            // ==================================================

            var googleSubjectId =
                payload.Subject;

            var email =
                payload.Email;

            if (string.IsNullOrWhiteSpace(googleSubjectId))
            {
                throw new UnauthorizedAccessException(
                    "Google account ID could not be verified.");
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                throw new UnauthorizedAccessException(
                    "Google account email could not be verified.");
            }

            // Google account must have a verified email
            if (payload.EmailVerified != true)
            {
                throw new UnauthorizedAccessException(
                    "Google account email is not verified.");
            }

            email = email.Trim();

            // ==================================================
            // 5. FIND STUDENT BY GOOGLE SUBJECT ID
            // ==================================================

            var student =
                await _repository.GetByGoogleSubjectIdAsync(
                    googleSubjectId);

            // ==================================================
            // 6. FALLBACK - FIND STUDENT BY EMAIL
            // ==================================================

            if (student == null)
            {
                student =
                    await _repository.GetByEmailForLoginAsync(
                        email);
            }

            // ==================================================
            // 7. STUDENT NOT REGISTERED
            // ==================================================

            if (student == null)
            {
                throw new UnauthorizedAccessException(
                    "No student account is registered with this Google account. Please contact your organization.");
            }

            // ==================================================
            // 8. STUDENT MUST BE ACTIVE
            // ==================================================

            if (string.IsNullOrWhiteSpace(student.Status) ||
                !student.Status.Equals(
                    "Active",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(
                    "Student account is not active.");
            }

            // ==================================================
            // 9. FIND THE USER LOGIN ACCOUNT
            // ==================================================

            var user =
                await _authRepository.GetByIdentifierAsync(
                    email);

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "Student user account was not found.");
            }

            // ==================================================
            // 10. USER ACCOUNT VALIDATION
            // ==================================================

            if (user.IsDeleted)
            {
                throw new UnauthorizedAccessException(
                    "Student user account has been deleted.");
            }

            // ==================================================
            // 11. USER MUST HAVE STUDENT ROLE
            // ==================================================

            if (user.Role != UserRole.Student)
            {
                throw new UnauthorizedAccessException(
                    "The Google account is not linked to a student user account.");
            }

            // ==================================================
            // 12. ORGANIZATION / TENANT VALIDATION
            // ==================================================

            if (user.OrganizationId != student.OrganizationId)
            {
                throw new UnauthorizedAccessException(
                    "Student organization information is invalid.");
            }

            // ==================================================
            // 13. LINK GOOGLE ACCOUNT ON FIRST LOGIN
            // ==================================================

            if (string.IsNullOrWhiteSpace(
                student.GoogleSubjectId))
            {
                var linked =
                    await _repository.LinkGoogleSubjectIdAsync(
                        student.StudentId,
                        googleSubjectId);

                if (!linked)
                {
                    throw new InvalidOperationException(
                        "Unable to link Google account.");
                }
            }
            else if (
                !string.Equals(
                    student.GoogleSubjectId,
                    googleSubjectId,
                    StringComparison.Ordinal))
            {
                throw new UnauthorizedAccessException(
                    "This student account is linked to a different Google account.");
            }

            // ==================================================
            // 14. GENERATE TALENTSPHERE JWT
            // IMPORTANT:
            // UserId   = user.UserId
            // StudentId = student.StudentId
            // ==================================================

            var token =
                _jwtService.GenerateToken(
                    user.UserId,
                    user.Email ?? student.Email,
                    "Student",
                    user.OrganizationId,
                    student.StudentId);

            // ==================================================
            // 15. LOGIN RESPONSE
            // ==================================================

            return new LoginResponseDto
            {
                Success = true,

                Message =
                    "Google login successful.",

                Token =
                    token,

                Role =
                    "Student",

                UserId =
                    user.UserId,

                Name =
                    $"{student.FirstName} {student.LastName}".Trim(),

                Email =
                    student.Email
            };
        }
        // ==================================================
        // GET ALL
        // ==================================================

        public async Task<IEnumerable<StudentDto>> GetAllAsync(
            StudentQueryDto query)
        {
            var students =
                await _repository.GetAllAsync(query);

            return students.Select(s => new StudentDto
            {
                StudentId = s.StudentId,

                FirstName = s.FirstName,
                LastName = s.LastName,

                Email = s.Email,
                Phone = s.Phone,
                ProfilePhotoUrl = s.ProfilePhotoUrl,

                CourseId = s.CourseId,
                CourseName =
                    s.Course?.CourseName ?? string.Empty,

                BatchId = s.BatchId,
                BatchName =
                    s.Batch?.BatchName ?? string.Empty,

                MentorId = s.MentorId,

                MentorName = s.Mentor == null
                    ? string.Empty
                    : $"{s.Mentor.FirstName} " +
                      $"{s.Mentor.LastName}",

                CourseDates =
                    s.CourseDates ?? string.Empty,

                Attendance = s.Attendance,

                AssessmentsCleared =
                    s.AssessmentsCleared,

                Status = s.Status
            });
        }

        // ==================================================
        // GET BY ID
        // ==================================================

        public async Task<StudentDto?> GetByIdAsync(
            int id)
        {
            var student =
                await _repository.GetByIdAsync(id);

            if (student == null)
                return null;

            return MapToDto(student);
        }

        // ==================================================
        // APPROVE STUDENT ENROLLMENT
        // ==================================================

        public async Task<bool> ApproveAsync(int id)
        {
            var student =
                await _repository.GetByIdAsync(id);

            if (student == null)
                return false;

            if (student.OrganizationId !=
                _tenantContext.OrganizationId)
            {
                throw new UnauthorizedAccessException(
                    "Student does not belong to your organization.");
            }

            if (!string.Equals(
                    student.Status,
                    "Pending",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Only pending student enrollments can be approved.");
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync(
                    IsolationLevel.Serializable);

            var transactionCommitted = false;

            string temporaryPassword = string.Empty;

            Student? approvedStudent = null;

            try
            {
                // ==================================================
                // Re-read inside transaction
                // ==================================================

                var currentStudent =
                    await _repository.GetByIdAsync(id);

                if (currentStudent == null)
                    return false;

                if (currentStudent.OrganizationId !=
                    _tenantContext.OrganizationId)
                {
                    throw new UnauthorizedAccessException(
                        "Student does not belong to your organization.");
                }

                if (!string.Equals(
                        currentStudent.Status,
                        "Pending",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException(
                        "Only pending student enrollments can be approved.");
                }

                // ==================================================
                // Check whether login already exists
                // ==================================================

                var existingUser =
                    await _authRepository.GetByIdentifierAsync(
                        currentStudent.Email);

                if (existingUser != null)
                {
                    throw new InvalidOperationException(
                        "A user account already exists for this student email.");
                }

                // ==================================================
                // Validate assigned batch
                // ==================================================

                var assignedBatch =
                    await _batchRepository.GetByIdWithCapacityAsync(
                        currentStudent.BatchId);

                if (assignedBatch == null)
                {
                    throw new InvalidOperationException(
                        "Assigned batch does not exist.");
                }

                if (assignedBatch.OrganizationId !=
                    _tenantContext.OrganizationId)
                {
                    throw new UnauthorizedAccessException(
                        "Assigned batch does not belong to your organization.");
                }

                // ==================================================
                // Check batch capacity
                // Pending students already occupy a seat.
                // ==================================================

                var currentCount =
                    await _batchRepository.GetActiveStudentCountAsync(
                        assignedBatch.BatchId);

                if (currentCount > assignedBatch.Capacity)
                {
                    throw new InvalidOperationException(
                        "The assigned batch has exceeded its capacity.");
                }

                // ==================================================
                // Generate temporary password
                // ==================================================

                temporaryPassword =
                    GenerateTemporaryPassword();

                var passwordHash =
                    PasswordHelper.HashPassword(
                        temporaryPassword);

                // ==================================================
                // Activate student
                // ==================================================

                currentStudent.Status =
                    "Active";

                currentStudent.PasswordHash =
                    passwordHash;

                var updated =
                    await _repository.UpdateAsync(
                        currentStudent);

                if (!updated)
                    return false;

                // Ensure the approved student's course/batch assignment
                // has a matching active enrollment in this transaction.
                if (currentStudent.CourseId <= 0 ||
                    currentStudent.BatchId <= 0)
                {
                    throw new InvalidOperationException(
                        "A valid course and batch must be assigned before approval.");
                }

                var validCourse = await _context.Courses.AnyAsync(c =>
                    c.CourseId == currentStudent.CourseId &&
                    c.OrganizationId == currentStudent.OrganizationId);

                var validBatch = await _context.Batches.AnyAsync(b =>
                    b.BatchId == currentStudent.BatchId &&
                    b.CourseId == currentStudent.CourseId &&
                    b.OrganizationId == currentStudent.OrganizationId);

                if (!validCourse || !validBatch)
                {
                    throw new InvalidOperationException(
                        "The student's course or batch assignment is invalid.");
                }

                await SyncStudentEnrollmentAsync(
                    currentStudent,
                    currentStudent.CourseId,
                    currentStudent.BatchId,
                    currentStudent.OrganizationId);

                await _context.SaveChangesAsync();

                approvedStudent =
                    currentStudent;

                // ==================================================
                // Create Student login account
                // ==================================================

                var user = new User
                {
                    FirstName =
                        currentStudent.FirstName,

                    LastName =
                        currentStudent.LastName,

                    Email =
                        currentStudent.Email,

                    Phone =
                        currentStudent.Phone,

                    PasswordHash =
                        passwordHash,

                    Role =
                        UserRole.Student,

                    OrganizationId =
                        currentStudent.OrganizationId,

                    IsEmailVerified =
                        true,

                    IsPhoneVerified =
                        true,

                    CreatedDate =
                        DateTime.UtcNow
                };

                await _authRepository.CreateUserAsync(user);

                // ==================================================
                // Commit database changes first
                // ==================================================

                await transaction.CommitAsync();

                transactionCommitted = true;
            }
            catch
            {
                if (!transactionCommitted)
                {
                    await transaction.RollbackAsync();
                }

                throw;
            }

            // ==================================================
            // ORGANIZATION NOTIFICATION
            // STUDENT ENROLLMENT APPROVED
            // ==================================================

            if (approvedStudent != null)
            {
                try
                {
                    await _notificationService
                        .CreateOrganizationNotificationAsync(
                            _tenantContext.OrganizationId,
                            "Student Enrollment Approved",
                            $"{approvedStudent.FirstName} {approvedStudent.LastName} has been approved for enrollment.",
                            NotificationType.StudentEnrollmentApproved,
                            approvedStudent.StudentId,
                            ReferenceType.Student);
                }
                catch
                {
                    // Notification failure must NOT undo
                    // successful student approval.
                }

                // ==================================================
                // SEND STUDENT CREDENTIALS
                // ==================================================

                await _emailService
                    .SendStudentWelcomeEmailAsync(
                        approvedStudent.Email,
                        approvedStudent.FirstName,
                        approvedStudent.LastName,
                        temporaryPassword);
            }

            return true;
        }

        // ==================================================
        // REJECT STUDENT ENROLLMENT
        // ==================================================

        public async Task<bool> RejectAsync(int id)
        {
            var student =
                await _repository.GetByIdAsync(id);

            if (student == null)
                return false;

            if (student.OrganizationId !=
                _tenantContext.OrganizationId)
            {
                throw new UnauthorizedAccessException(
                    "Student does not belong to your organization.");
            }

            if (!string.Equals(
                    student.Status,
                    "Pending",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Only pending student enrollments can be rejected.");
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync(
                    IsolationLevel.Serializable);

            var transactionCommitted = false;

            Student? rejectedStudent = null;

            try
            {
                // ==================================================
                // Re-read inside transaction
                // ==================================================

                var currentStudent =
                    await _repository.GetByIdAsync(id);

                if (currentStudent == null)
                    return false;

                if (currentStudent.OrganizationId !=
                    _tenantContext.OrganizationId)
                {
                    throw new UnauthorizedAccessException(
                        "Student does not belong to your organization.");
                }

                if (!string.Equals(
                        currentStudent.Status,
                        "Pending",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException(
                        "Only pending student enrollments can be rejected.");
                }

                // ==================================================
                // Change status to Rejected
                // ==================================================

                currentStudent.Status =
                    "Rejected";

                var updated =
                    await _repository.UpdateAsync(
                        currentStudent);

                if (!updated)
                    return false;

                rejectedStudent =
                    currentStudent;

                // ==================================================
                // Release batch seat
                // ==================================================

                await _batchRepository
                    .DecrementEnrollmentAsync(
                        currentStudent.BatchId);

                await _context.SaveChangesAsync();

                // ==================================================
                // Commit database changes
                // ==================================================

                await transaction.CommitAsync();

                transactionCommitted = true;
            }
            catch
            {
                if (!transactionCommitted)
                {
                    await transaction.RollbackAsync();
                }

                throw;
            }

            // ==================================================
            // ORGANIZATION NOTIFICATION
            // STUDENT ENROLLMENT REJECTED
            // ==================================================

            if (rejectedStudent != null)
            {
                try
                {
                    await _notificationService
                        .CreateOrganizationNotificationAsync(
                            _tenantContext.OrganizationId,
                            "Student Enrollment Rejected",
                            $"{rejectedStudent.FirstName} {rejectedStudent.LastName}'s enrollment has been rejected.",
                            NotificationType.StudentEnrollmentRejected,
                            rejectedStudent.StudentId,
                            ReferenceType.Student);
                }
                catch
                {
                    // Notification failure must NOT undo
                    // successful student rejection.
                }
            }

            return true;
        }

        // ==================================================
        // CREATE STUDENT
        // ==================================================

        public async Task<StudentDto> CreateAsync(
            CreateStudentDto dto)
        {
            // --------------------------------------------------
            // 1. Check duplicate email
            // --------------------------------------------------

            var existingUser =
                await _authRepository
                    .GetByIdentifierAsync(dto.Email);

            if (existingUser != null)
            {
                throw new Exception(
                    "A user with this email already exists.");
            }

            // --------------------------------------------------
            // 2. Start transaction
            // Serializable helps prevent two simultaneous
            // registrations from taking the same last seat.
            // --------------------------------------------------

            await using var transaction =
                await _context.Database
                    .BeginTransactionAsync(
                        IsolationLevel.Serializable);

            try
            {
                // --------------------------------------------------
                // 3. Get requested batch
                // --------------------------------------------------

                var requestedBatch =
                    await _batchRepository
                        .GetByIdWithCapacityAsync(
                            dto.BatchId);

                if (requestedBatch == null)
                {
                    throw new Exception(
                        "Selected batch does not exist.");
                }

                if (requestedBatch.OrganizationId !=
                    _tenantContext.OrganizationId)
                {
                    throw new UnauthorizedAccessException(
                        "Selected batch does not belong to your organization.");
                }

                // --------------------------------------------------
                // 4. Validate Course + Batch
                // --------------------------------------------------

                if (requestedBatch.CourseId != dto.CourseId)
                {
                    throw new Exception(
                        "Selected batch does not belong " +
                        "to the selected course.");
                }

                // --------------------------------------------------
                // 5. Determine assigned batch
                // --------------------------------------------------

                Batch? assignedBatch = null;

                var requestedBatchIsAvailable =
                    requestedBatch.Status ==
                        BatchStatus.Upcoming ||
                    requestedBatch.Status ==
                        BatchStatus.Active;

                if (requestedBatchIsAvailable)
                {
                    var currentCount =
                        await _batchRepository
                            .GetActiveStudentCountAsync(
                                requestedBatch.BatchId);

                    if (currentCount <
                        requestedBatch.Capacity)
                    {
                        assignedBatch =
                            requestedBatch;
                    }
                }

                // --------------------------------------------------
                // 6. Requested batch is full
                // Find next available batch
                // --------------------------------------------------

                if (assignedBatch == null)
                {
                    assignedBatch =
                        await _batchRepository
                            .GetAvailableBatchAsync(
                                dto.CourseId);
                }

                // --------------------------------------------------
                // 7. No batch available
                // --------------------------------------------------

                if (assignedBatch == null)
                {
                    throw new Exception(
                        $"Selected batch '{requestedBatch.BatchName}' " +
                        "is full and no available batch exists " +
                        "for this course.");
                }

                // --------------------------------------------------
                // 8. Create Student
                // Credentials are created only after
                // Organization Admin approval.
                // --------------------------------------------------

                var student = new Student
                {
                    // ==========================================
                    // Tenant
                    // ==========================================

                    OrganizationId =
                        _tenantContext.OrganizationId,

                    // ==========================================
                    // Student
                    // ==========================================

                    FirstName =
                        dto.FirstName,

                    LastName =
                        dto.LastName,

                    Email =
                        dto.Email,

                    Phone =
                        dto.Phone,

                    // ==========================================
                    // Course / Batch / Mentor
                    // ==========================================

                    CourseId =
                        assignedBatch.CourseId,

                    BatchId =
                        assignedBatch.BatchId,

                    MentorId =
                        assignedBatch.MentorId,

                    // ==========================================
                    // Other information
                    // ==========================================

                    PasswordHash =
                        string.Empty,

                    CourseDates =
                        string.Empty,

                    Attendance =
                        0,

                    AssessmentsCleared =
                        0,

                    // IMPORTANT:
                    // Student must be Pending until Admin approves.
                    Status =
                        "Pending"
                };

                // --------------------------------------------------
                // 9. Save Student
                // --------------------------------------------------

                var createdStudent =
                    await _repository.CreateAsync(
                        student);

                // Create/update the active course-batch enrollment.
                await SyncStudentEnrollmentAsync(
                    createdStudent,
                    createdStudent.CourseId,
                    createdStudent.BatchId,
                    createdStudent.OrganizationId);

                // --------------------------------------------------
                // 10. Increment batch enrollment
                // --------------------------------------------------

                await _batchRepository
                    .IncrementEnrollmentAsync(
                        assignedBatch.BatchId);

                // Persist enrollment changes before committing.
                await _context.SaveChangesAsync();

                // --------------------------------------------------
                // 11. Commit transaction
                // --------------------------------------------------
                // No User account or credentials email are
                // created here.

                await transaction.CommitAsync();

                // --------------------------------------------------
                // 12. Return DTO
                // --------------------------------------------------

                return MapToDto(
                    createdStudent);
            }
            catch
            {
                await transaction.RollbackAsync();

                throw;
            }
        }

        private async Task SyncStudentEnrollmentAsync(
            Student student,
            int courseId,
            int batchId,
            int organizationId)
        {
            if (student.StudentId <= 0 || courseId <= 0 || batchId <= 0)
            {
                throw new InvalidOperationException(
                    "Student, course, and batch IDs must be valid before creating an enrollment.");
            }

            var existingEnrollments = await _context.StudentEnrollments
                .Where(e =>
                    e.StudentId == student.StudentId &&
                    e.OrganizationId == organizationId &&
                    e.CourseId == courseId &&
                    e.IsActive &&
                    e.EndedAt == null)
                .OrderByDescending(e => e.EnrolledAt)
                .ToListAsync();

            var matchingEnrollment = existingEnrollments.FirstOrDefault(e =>
                e.BatchId == batchId);

            if (matchingEnrollment != null)
            {
                // Keep one active enrollment for this course/batch pair.
                foreach (var duplicate in existingEnrollments.Where(e =>
                    e.EnrollmentId != matchingEnrollment.EnrollmentId))
                {
                    duplicate.IsActive = false;
                    duplicate.EndedAt = DateTime.UtcNow;
                }

                return;
            }

            // Close any active enrollment for this course that points
            // to another batch before creating the new active enrollment.
            foreach (var oldEnrollment in existingEnrollments)
            {
                oldEnrollment.IsActive = false;
                oldEnrollment.EndedAt = DateTime.UtcNow;
            }

            _context.StudentEnrollments.Add(new StudentEnrollment
            {
                StudentId = student.StudentId,
                OrganizationId = organizationId,
                CourseId = courseId,
                BatchId = batchId,
                IsActive = true,
                EnrolledAt = DateTime.UtcNow,
                EndedAt = null
            });
        }

        // ==================================================
        // UPDATE STUDENT
        // ==================================================


        public async Task<bool> UpdateAsync(
            int id,
            UpdateStudentDto dto)
        {
            var student = await _repository.GetByIdAsync(id);

            if (student == null)
                return false;

            var organizationId = _tenantContext.OrganizationId;

            if (student.OrganizationId != organizationId)
            {
                throw new UnauthorizedAccessException(
                    "Student does not belong to your organization.");
            }

            var oldBatchId = student.BatchId;
            var oldCourseId = student.CourseId;

            await using var transaction =
                await _context.Database.BeginTransactionAsync(
                    IsolationLevel.Serializable);

            try
            {
                // 1. Validate the requested batch.
                var selectedBatch =
                    await _batchRepository.GetByIdWithCapacityAsync(
                        dto.BatchId);

                if (selectedBatch == null)
                {
                    throw new InvalidOperationException(
                        "Selected batch does not exist.");
                }

                if (selectedBatch.OrganizationId != organizationId)
                {
                    throw new UnauthorizedAccessException(
                        "Selected batch does not belong to your organization.");
                }

                if (selectedBatch.CourseId != dto.CourseId)
                {
                    throw new InvalidOperationException(
                        "Selected batch does not belong to the selected course.");
                }

                // 2. Validate the course belongs to this organization.
                var courseExists = await _context.Courses
                    .AnyAsync(c =>
                        c.CourseId == dto.CourseId &&
                        c.OrganizationId == organizationId);

                if (!courseExists)
                {
                    throw new InvalidOperationException(
                        "Selected course does not exist in your organization.");
                }

                var batchChanged = oldBatchId != dto.BatchId;
                var courseChanged = oldCourseId != dto.CourseId;

                // 3. Check batch availability if the assignment changes.
                Batch assignedBatch = selectedBatch;

                if (batchChanged || courseChanged)
                {
                    var available =
                        selectedBatch.Status == BatchStatus.Upcoming ||
                        selectedBatch.Status == BatchStatus.Active;

                    var currentCount =
                        await _batchRepository.GetActiveStudentCountAsync(
                            selectedBatch.BatchId);

                    if (!available || currentCount >= selectedBatch.Capacity)
                    {
                        var nextBatch =
                            await _batchRepository.GetAvailableBatchAsync(
                                dto.CourseId);

                        if (nextBatch == null)
                        {
                            throw new InvalidOperationException(
                                $"Batch '{selectedBatch.BatchName}' is unavailable " +
                                "or full, and no other available batch exists.");
                        }

                        if (nextBatch.OrganizationId != organizationId ||
                            nextBatch.CourseId != dto.CourseId)
                        {
                            throw new InvalidOperationException(
                                "The alternative batch has invalid organization " +
                                "or course information.");
                        }

                        assignedBatch = nextBatch;
                    }
                }

                // 4. Update student profile and current assignment.
                student.FirstName = dto.FirstName;
                student.LastName = dto.LastName;
                student.Email = dto.Email;
                student.Phone = dto.Phone;
                student.CourseId = assignedBatch.CourseId;
                student.BatchId = assignedBatch.BatchId;
                student.MentorId = assignedBatch.MentorId;

                // 5. Synchronize the enrollment table.
                // End the previous primary assignment if the student changed courses.
                if (oldCourseId != assignedBatch.CourseId)
                {
                    var previousCourseEnrollments =
                        await _context.StudentEnrollments
                            .Where(e =>
                                e.OrganizationId == organizationId &&
                                e.StudentId == student.StudentId &&
                                e.CourseId == oldCourseId &&
                                e.BatchId == oldBatchId &&
                                e.IsActive &&
                                e.EndedAt == null)
                            .ToListAsync();

                    foreach (var previousEnrollment in previousCourseEnrollments)
                    {
                        previousEnrollment.IsActive = false;
                        previousEnrollment.EndedAt = DateTime.UtcNow;
                    }
                }

                await SyncStudentEnrollmentAsync(
                    student,
                    assignedBatch.CourseId,
                    assignedBatch.BatchId,
                    organizationId);

                // 6. Update batch capacity counters when the primary
                // student assignment changes batch.
                if (oldBatchId != assignedBatch.BatchId)
                {
                    await _batchRepository.DecrementEnrollmentAsync(
                        oldBatchId);

                    await _batchRepository.IncrementEnrollmentAsync(
                        assignedBatch.BatchId);
                }

                // 7. Save student and enrollment in the same transaction.
                var updated = await _repository.UpdateAsync(student);

                if (!updated)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        // ==================================================
        // DELETE STUDENT
        // ==================================================

        public async Task<bool> DeleteAsync(
            int id)
        {
            var student =
                await _repository.GetByIdAsync(id);

            if (student == null)
                return false;

            await using var transaction =
                await _context.Database
                    .BeginTransactionAsync();

            try
            {
                var batchId =
                    student.BatchId;

                // --------------------------------------------------
                // Soft delete
                // --------------------------------------------------

                var result =
                    await _repository.DeleteAsync(id);

                if (!result)
                {
                    await transaction.RollbackAsync();

                    return false;
                }

                // --------------------------------------------------
                // Decrease batch count
                // --------------------------------------------------

                await _batchRepository
                    .DecrementEnrollmentAsync(
                        batchId);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();

                throw;
            }
        }

        // ==================================================
        // MAP STUDENT TO DTO
        // ==================================================

        private StudentDto MapToDto(
            Student student)
        {
            return new StudentDto
            {
                StudentId =
                    student.StudentId,

                FirstName =
                    student.FirstName,

                LastName =
                    student.LastName,

                Email =
                    student.Email,

                Phone =
                    student.Phone,

                CourseId =
                    student.CourseId,

                CourseName =
                    student.Course?.CourseName ??
                    string.Empty,

                BatchId =
                    student.BatchId,

                BatchName =
                    student.Batch?.BatchName ??
                    string.Empty,

                MentorId =
                    student.MentorId,

                MentorName =
                    student.Mentor == null
                        ? string.Empty
                        : $"{student.Mentor.FirstName} " +
                          $"{student.Mentor.LastName}",

                CourseDates =
                    student.CourseDates ??
                    string.Empty,

                Attendance =
                    student.Attendance,

                AssessmentsCleared =
                    student.AssessmentsCleared,

                Status =
                    student.Status
            };
        }

        // ==================================================
        // TEMPORARY PASSWORD
        // ==================================================

        private string GenerateTemporaryPassword()
        {
            const string chars =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                "abcdefghijklmnopqrstuvwxyz" +
                "0123456789@#$";

            var random =
                new Random();

            return new string(
                Enumerable
                    .Repeat(chars, 10)
                    .Select(s =>
                        s[random.Next(s.Length)])
                    .ToArray());
        }
    }
}