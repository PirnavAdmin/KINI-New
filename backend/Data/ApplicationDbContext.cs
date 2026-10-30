using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using TalentSphereAPI.Models;
using TalentSphereAPI.Models.EmployeeProfile;

namespace TalentSphereAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }




        // Authentication Module
        public DbSet<User> Users { get; set; }

        public DbSet<Permission> Permissions { get; set; }
        public DbSet<GetInTouch> GetInTouches { get; set; }
        public DbSet<Registration> Registrations { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<EmployeePermission> EmployeePermissions { get; set; }

        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<OtpVerification> OtpVerifications { get; set; }
        public DbSet<BatchModuleCompletion> BatchModuleCompletions { get; set; }
        public DbSet<SuperAdmin> SuperAdmins { get; set; }



        // Skill Management Module
        public DbSet<Skill> Skills { get; set; }
        public DbSet<EmployeeSkill> EmployeeSkills { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<Mentor> Mentors { get; set; }
        public DbSet<Batch> Batches { get; set; }
        public DbSet<HrResource> HrResources { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<EmployeePerformance> EmployeePerformances { get; set; }

        // Employee self-service profile
        public DbSet<EmployeeProfile> EmployeeProfiles { get; set; }
        public DbSet<EmployeeEducation> EmployeeEducations { get; set; }
        public DbSet<EmployeeWorkExperience> EmployeeWorkExperiences { get; set; }
        public DbSet<EmployeeDocument> EmployeeDocuments { get; set; }

        public DbSet<Goal> Goals { get; set; }
        public DbSet<Course> Courses { get; set; }

        public DbSet<CourseModule> CourseModules { get; set; }

        public DbSet<CourseTopic> CourseTopics { get; set; }

        public DbSet<CourseLesson> CourseLessons { get; set; }
        public DbSet<Assessment> Assessments { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Competency> Competencies { get; set; }
        public DbSet<RoleCompetency> RoleCompetencies { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<StudentEnrollment> StudentEnrollments { get; set; }
        public DbSet<Invoice> Invoices { get; set; }

        public DbSet<HrSettings> HrSettings { get; set; }

        public DbSet<AssessmentQuestion> AssessmentQuestions { get; set; }

        public DbSet<AssessmentOption> AssessmentOptions { get; set; }

        public DbSet<StudentAssessment> StudentAssessments { get; set; }

        public DbSet<StudentAssessmentAnswer> StudentAssessmentAnswers { get; set; }
        public DbSet<HrCalendarEvent> HrCalendarEvents { get; set; }
        public DbSet<HrAnnouncement> HrAnnouncements { get; set; }

        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<LiveClass> LiveClasses { get; set; }

        public DbSet<Attendance> Attendances { get; set; }

        public DbSet<AttendanceSession> AttendanceSessions { get; set; }
        public DbSet<EmployeeAttendance> EmployeeAttendances { get; set; }

        public DbSet<LeaveRequest> LeaveRequests { get; set; }
        public DbSet<MeetingEvent> MeetingEvents { get; set; }
        public DbSet<MeetingPlatform> MeetingPlatforms { get; set; }

        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ChatConversation> ChatConversations { get; set; }
        public DbSet<ChatAttachment> ChatAttachments { get; set; }

        public DbSet<ChatMessage> ChatMessages { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<GetInTouch>(entity =>
            {
                entity.ToTable("get_in_touches");

                entity.Property(x => x.Name)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(x => x.Email)
                    .HasMaxLength(254)
                    .IsRequired();

                entity.Property(x => x.MobileNumber)
                    .HasMaxLength(10)
                    .IsRequired();

                entity.Property(x => x.Subject)
                    .HasMaxLength(200)
                    .IsRequired();

                entity.Property(x => x.Message)
                    .HasMaxLength(2000)
                    .IsRequired();

                entity.Property(x => x.CreatedDate).IsRequired();
                entity.HasIndex(x => x.CreatedDate);
            });
            modelBuilder.Entity<Registration>(entity =>
            {
                entity.ToTable("registrations");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Name)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(x => x.Email)
                    .HasMaxLength(254)
                    .IsRequired();

                entity.Property(x => x.MobileNumber)
                    .HasMaxLength(10)
                    .IsRequired();

                entity.Property(x => x.Qualification)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(x => x.Program)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(x => x.CreatedDate).IsRequired();

                entity.HasIndex(x => x.Email).IsUnique();
            });
            // ==========================================
            // Organization / Tenant Relationships
            // ==========================================

            modelBuilder.Entity<User>()
                .HasOne(u => u.Organization)
                .WithMany(o => o.Users)
                .HasForeignKey(u => u.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Employee>()
    .HasOne(e => e.User)
    .WithMany()
    .HasForeignKey(e => e.UserId)
    .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Employee>()
    .HasIndex(e => e.UserId)
    .IsUnique();

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Organization)
                .WithMany(o => o.Employees)
                .HasForeignKey(e => e.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Mentor>()
                .HasOne(m => m.Organization)
                .WithMany(o => o.Mentors)
                .HasForeignKey(m => m.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Student>()
                .HasOne(s => s.Organization)
                .WithMany(o => o.Students)
                .HasForeignKey(s => s.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Course>()
      .HasOne(c => c.Organization)
      .WithMany(o => o.Courses)
      .HasForeignKey(c => c.OrganizationId)
      .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Batch>()
                .HasOne(b => b.Organization)
                .WithMany(o => o.Batches)
                .HasForeignKey(b => b.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Organization>()
    .HasIndex(x => x.GoogleSubjectId)
    .IsUnique();

            modelBuilder.Entity<Employee>()
    .HasIndex(e => e.GoogleSubjectId)
    .IsUnique()
    .HasFilter("[GoogleSubjectId] IS NOT NULL");

            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.Email);

            modelBuilder.Entity<Student>()
                .HasIndex(s => s.Email);

            modelBuilder.Entity<Organization>()
                .HasIndex(o => o.Email);



            modelBuilder.Entity<HrResource>(entity =>
            {
                entity.HasKey(x => x.ResourceId);

                entity.Property(x => x.Name)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.Category)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(x => x.Description)
                    .HasMaxLength(4000);

                entity.Property(x => x.FileType)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.OriginalFileName)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.StoredFileName)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.StoredFilePath)
                    .HasMaxLength(1000)
                    .IsRequired();

                entity.Property(x => x.UploadedBy)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.FileSize)
                    .HasColumnType("bigint");

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.Category
                });

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.UploadedByEmployeeId
                });

                entity.HasOne(x => x.Organization)
                    .WithMany()
                    .HasForeignKey(x => x.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // Employee Attendance
            // ==========================================

            modelBuilder.Entity<EmployeeAttendance>(entity =>
            {
                entity.HasKey(x => x.EmployeeAttendanceId);

                entity.Property(x => x.WorkingHours)
                    .HasPrecision(5, 2);

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.EmployeeId,
                    x.AttendanceDate
                })
                .IsUnique();

                entity.HasOne(x => x.Organization)
                    .WithMany()
                    .HasForeignKey(x => x.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Employee)
                    .WithMany()
                    .HasForeignKey(x => x.EmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
            // ==========================================
            // HR Performance
            // ==========================================

            modelBuilder.Entity<EmployeePerformance>(entity =>
            {
                entity.HasKey(x => x.PerformanceId);

                entity.Property(x => x.Period)
                    .HasMaxLength(7)
                    .IsRequired();

                entity.Property(x => x.PerformanceScore)
                    .HasPrecision(5, 2);

                entity.Property(x => x.TargetCompletion)
                    .HasPrecision(5, 2);

                entity.Property(x => x.Attendance)
                    .HasPrecision(5, 2);

                entity.Property(x => x.Notes)
                    .HasMaxLength(4000);

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.EmployeeId,
                    x.Period
                });

                entity.HasOne(x => x.Organization)
                    .WithMany()
                    .HasForeignKey(x => x.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Employee)
                    .WithMany()
                    .HasForeignKey(x => x.EmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<HrSettings>(entity =>
            {
                entity.HasKey(x => x.HrSettingsId);

                entity.Property(x => x.AccentColor)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.EmployeeId
                })
                .IsUnique();

                entity.HasOne(x => x.Organization)
                    .WithMany()
                    .HasForeignKey(x => x.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Employee)
                    .WithMany()
                    .HasForeignKey(x => x.EmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // Leave Request
            // ==========================================

            modelBuilder.Entity<LeaveRequest>(entity =>
            {
                entity.HasKey(x => x.LeaveRequestId);

                entity.Property(x => x.Status)
                    .HasConversion<string>();

                entity.Property(x => x.LeaveType)
                    .HasMaxLength(100);

                entity.HasOne(x => x.Organization)
                    .WithMany()
                    .HasForeignKey(x => x.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Employee)
                    .WithMany()
                    .HasForeignKey(x => x.EmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.EmployeeId,
                    x.StartDate,
                    x.EndDate
                });
            });

            modelBuilder.Entity<EmployeePermission>()
    .HasOne(x => x.Employee)
    .WithMany(x => x.EmployeePermissions)
    .HasForeignKey(x => x.EmployeeId)
    .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmployeePermission>()
                .HasOne(x => x.Permission)
                .WithMany()
                .HasForeignKey(x => x.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmployeePermission>()
                .HasIndex(x => new
                {
                    x.EmployeeId,
                    x.PermissionId
                })
                .IsUnique();

            // ==========================================
            // Tenant-aware indexes
            // ==========================================

            modelBuilder.Entity<Employee>()
                .HasIndex(e => new
                {
                    e.OrganizationId,
                    e.Email
                });



            // ==========================================
            // Employee Self-Service Profile
            // ==========================================

            modelBuilder.Entity<EmployeeProfile>(entity =>
            {
                entity.HasKey(x => x.EmployeeProfileId);

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.EmployeeId
                }).IsUnique();

                entity.Property(x => x.AnnualCtc).HasPrecision(18, 2);
                entity.Property(x => x.BasicSalaryMonthly).HasPrecision(18, 2);
                entity.Property(x => x.HraMonthly).HasPrecision(18, 2);
                entity.Property(x => x.ConveyanceAllowanceMonthly).HasPrecision(18, 2);
                entity.Property(x => x.MedicalAllowanceMonthly).HasPrecision(18, 2);
                entity.Property(x => x.SpecialAllowanceMonthly).HasPrecision(18, 2);
                entity.Property(x => x.EmployeePfMonthly).HasPrecision(18, 2);
                entity.Property(x => x.EmployerPfMonthly).HasPrecision(18, 2);
                entity.Property(x => x.ProfessionalTaxMonthly).HasPrecision(18, 2);
                entity.Property(x => x.TdsMonthly).HasPrecision(18, 2);
                entity.Property(x => x.OtherDeductionMonthly).HasPrecision(18, 2);

                entity.HasOne(x => x.Organization)
                    .WithMany()
                    .HasForeignKey(x => x.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Employee)
                    .WithMany()
                    .HasForeignKey(x => x.EmployeeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.Department)
                    .WithMany()
                    .HasForeignKey(x => x.DepartmentId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<EmployeeEducation>(entity =>
            {
                entity.HasKey(x => x.EmployeeEducationId);
                entity.Property(x => x.Percentage).HasPrecision(5, 2);
                entity.HasIndex(x => new { x.OrganizationId, x.EmployeeProfileId });

                entity.HasOne(x => x.EmployeeProfile)
                    .WithMany(x => x.Educations)
                    .HasForeignKey(x => x.EmployeeProfileId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<EmployeeWorkExperience>(entity =>
            {
                entity.HasKey(x => x.EmployeeWorkExperienceId);
                entity.Property(x => x.YearsOfExperience).HasPrecision(6, 2);
                entity.HasIndex(x => new { x.OrganizationId, x.EmployeeProfileId });

                entity.HasOne(x => x.EmployeeProfile)
                    .WithMany(x => x.Experiences)
                    .HasForeignKey(x => x.EmployeeProfileId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<EmployeeDocument>(entity =>
            {
                entity.HasKey(x => x.EmployeeDocumentId);
                entity.Property(x => x.FileSize).HasColumnType("bigint");
                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.EmployeeProfileId,
                    x.DocumentType
                });

                entity.HasOne(x => x.EmployeeProfile)
                    .WithMany(x => x.Documents)
                    .HasForeignKey(x => x.EmployeeProfileId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Mentor>()
                .HasIndex(m => new
                {
                    m.OrganizationId,
                    m.Email
                });

            modelBuilder.Entity<Student>()
                .HasIndex(s => new
                {
                    s.OrganizationId,
                    s.Email
                });

            modelBuilder.Entity<Course>()
                .HasIndex(c => new
                {
                    c.OrganizationId,
                    c.CourseName
                });

            modelBuilder.Entity<Batch>()
                .HasIndex(b => new
                {
                    b.OrganizationId,
                    b.BatchName
                });

            modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Organization)
            .WithMany(o => o.Subscriptions)
            .HasForeignKey(s => s.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Student>()
     .HasOne(s => s.Batch)
     .WithMany(b => b.Students)
     .HasForeignKey(s => s.BatchId)
     .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Student>()
    .HasOne(s => s.Course)
    .WithMany()
    .HasForeignKey(s => s.CourseId)
    .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HrAnnouncement>(entity =>
            {
                entity.HasKey(x => x.AnnouncementId);

                entity.Property(x => x.Title)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.Content)
                    .IsRequired();

                entity.Property(x => x.Audience)
                    .HasMaxLength(50);

                entity.Property(x => x.Status)
                    .HasMaxLength(50);

                entity.Property(x => x.CreatedBy)
                    .HasMaxLength(255);

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.PublishDate
                });

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.Status
                });

                entity.HasOne(x => x.Organization)
                    .WithMany()
                    .HasForeignKey(x => x.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // Role Permission Configuration
            // ==========================================

            modelBuilder.Entity<RolePermission>()
     .Property(x => x.Role)
     .HasConversion<string>();

            modelBuilder.Entity<RolePermission>()
                .HasOne(x => x.Permission)
                .WithMany(x => x.RolePermissions)
                .HasForeignKey(x => x.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RolePermission>()
                .HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            // ============================================================
            // IMPORTANT:
            //
            // One permission per:
            //
            // Organization + Role + Module
            //
            // OrganizationId = NULL means platform default.
            // OrganizationId = value means organization-specific.
            //
            // ============================================================

            modelBuilder.Entity<RolePermission>()
                .HasIndex(x => new
                {
                    x.OrganizationId,
                    x.Role,
                    x.PermissionId
                })
                .IsUnique();

            modelBuilder.Entity<Course>()
    .Property(c => c.Price)
    .HasPrecision(18, 2);

            modelBuilder.Entity<Mentor>()
    .HasOne<Employee>()
    .WithMany()
    .HasForeignKey(m => m.EmployeeId)
    .OnDelete(DeleteBehavior.Restrict);





            modelBuilder.Entity<Goal>()

                 .HasOne(g => g.Owner)

                 .WithMany()

                 .HasForeignKey(g => g.OwnerId)

                 .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RoleCompetency>()

           .HasOne(rc => rc.Role)

            .WithMany(r => r.RoleCompetencies)

            .HasForeignKey(rc => rc.RoleId);

            modelBuilder.Entity<RoleCompetency>()

                .HasOne(rc => rc.Competency)

                .WithMany()

                .HasForeignKey(rc => rc.CompetencyId);







            modelBuilder.Entity<Batch>()
 .HasOne(b => b.Course)
 .WithMany(c => c.Batches)
 .HasForeignKey(b => b.CourseId)
 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Batch>()
                .HasOne(b => b.Mentor)
                .WithMany(m => m.Batches)
                .HasForeignKey(b => b.MentorId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Coupon>()
                .Property(c => c.DiscountPercentage)
                .HasPrecision(5, 2);

            modelBuilder.Entity<Coupon>()
                .Property(c => c.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.Discount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.FinalAmount)
                .HasPrecision(18, 2);



            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Student>()
    .Property(s => s.Attendance)
    .HasPrecision(5, 2);
            modelBuilder.Entity<Student>()
    .HasIndex(s => s.GoogleSubjectId)
    .IsUnique();

            modelBuilder.Entity<Subscription>()
    .Property(s => s.Price)
    .HasColumnType("decimal(18,2)");





            modelBuilder.Entity<Attendance>(entity =>
            {
                entity.HasKey(a => a.AttendanceId);

                entity.Property(a => a.Status)
                      .HasConversion<string>();



                entity.HasIndex(a => new
                {
                    a.StudentId,
                    a.LiveClassId
                }).IsUnique();

                entity.HasOne(a => a.Student)
                      .WithMany()
                      .HasForeignKey(a => a.StudentId)
                      .OnDelete(DeleteBehavior.Restrict);

                modelBuilder.Entity<Attendance>()
    .HasMany(a => a.Sessions)
    .WithOne(s => s.Attendance)
    .HasForeignKey(s => s.AttendanceId)
    .OnDelete(DeleteBehavior.Cascade);





                entity.HasOne(a => a.LiveClass)
                      .WithMany(l => l.Attendances)
                      .HasForeignKey(a => a.LiveClassId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<Attendance>()
    .Property(a => a.AttendancePercentage)
    .HasPrecision(5, 2);

            modelBuilder.Entity<AttendanceSession>(entity =>
            {
                entity.HasKey(x => x.AttendanceSessionId);

                entity.HasOne(x => x.Attendance)
                      .WithMany(a => a.Sessions)
                      .HasForeignKey(x => x.AttendanceId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Property(x => x.MeetingParticipantId)
                      .HasMaxLength(200);
            });

            // ==========================================
            // COURSE SYLLABUS
            // Course -> Module -> Topic -> Lesson
            // ==========================================

            modelBuilder.Entity<CourseModule>()
                .HasOne(x => x.Course)
                .WithMany(x => x.Modules)
                .HasForeignKey(x => x.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CourseTopic>()
                .HasOne(x => x.Module)
                .WithMany(x => x.Topics)
                .HasForeignKey(x => x.ModuleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CourseLesson>()
                .HasOne(x => x.Topic)
                .WithMany(x => x.Lessons)
                .HasForeignKey(x => x.TopicId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LiveClass>()
    .HasOne<CourseModule>()
    .WithMany()
    .HasForeignKey(x => x.ModuleId)
    .OnDelete(DeleteBehavior.Restrict);

            // ===========================
            // MeetingEvent Configuration
            // ===========================
            modelBuilder.Entity<MeetingEvent>(entity =>
            {
                entity.HasKey(x => x.MeetingEventId);

                // unique provider event ID
                entity.Property(x => x.EventId)
                    .HasMaxLength(200)
                    .IsRequired(false);


                // Prevent duplicate meeting events.
                entity.HasIndex(x => x.EventId)
                    .IsUnique();

                entity.Property(x => x.MeetingId)
                    .HasMaxLength(100);
                    

                entity.Property(x => x.ParticipantId)
                    .HasMaxLength(200);

                entity.Property(x => x.ParticipantEmail)
                    .HasMaxLength(150);

                entity.Property(x => x.ParticipantName)
                    .HasMaxLength(200);

                entity.Property(x => x.EventType)
                    .HasConversion<string>()
                    .IsRequired();

                entity.HasOne<LiveClass>()
                    .WithMany()
                    .HasForeignKey(x => x.LiveClassId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Query performance indexes
                entity.HasIndex(x => x.LiveClassId);

                entity.HasIndex(x => x.MeetingId);

                entity.HasIndex(x => x.IsProcessed);

                entity.HasIndex(x => new
                {
                    x.LiveClassId,
                    x.IsProcessed
                });
            });
            // =========================================================
            // NOTIFICATION CONFIGURATION
            // =========================================================

            // Organization
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Organization)
                .WithMany(o => o.Notifications)
                .HasForeignKey(n => n.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Student
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Student)
                .WithMany(s => s.Notifications)
                .HasForeignKey(n => n.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Mentor
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Mentor)
                .WithMany(m => m.Notifications)
                .HasForeignKey(n => n.MentorId)
                .OnDelete(DeleteBehavior.NoAction);

            // Mentor who created notification
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.CreatedByMentor)
                .WithMany(m => m.CreatedNotifications)
                .HasForeignKey(n => n.CreatedByMentorId)
                .OnDelete(DeleteBehavior.NoAction);

            // Index for fast organization notification lookup
            modelBuilder.Entity<Notification>()
                .HasIndex(n => new
                {
                    n.OrganizationId,
                    n.CreatedAt
                });

            // Index for unread notifications
            modelBuilder.Entity<Notification>()
                .HasIndex(n => new
                {
                    n.OrganizationId,
                    n.IsRead
                });



            // ==========================================
            // INVOICE MODULE
            // ==========================================
            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.HasKey(i => i.InvoiceId);

                // =====================================================
                // ORGANIZATION
                // =====================================================

                entity.HasOne(i => i.Organization)
                    .WithMany()
                    .HasForeignKey(i => i.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);

                // =====================================================
                // STUDENT
                // =====================================================

                entity.HasOne(i => i.Student)
                    .WithMany()
                    .HasForeignKey(i => i.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);

                // =====================================================
                // COURSE
                // =====================================================

                entity.HasOne(i => i.Course)
                    .WithMany()
                    .HasForeignKey(i => i.CourseId)
                    .OnDelete(DeleteBehavior.Restrict);

                // =====================================================
                // INVOICE NUMBER
                // =====================================================

                entity.Property(i => i.InvoiceNumber)
                    .HasMaxLength(50)
                    .IsRequired();

                // =====================================================
                // NEW INVOICE FIELDS
                // =====================================================

                entity.Property(i => i.BillingAddress)
                    .HasMaxLength(1000);

                entity.Property(i => i.PlaceOfSupply)
                    .HasMaxLength(100);

                entity.Property(i => i.Currency)
                    .HasMaxLength(3)
                    .IsRequired();

                entity.Property(i => i.TaxType)
                    .HasConversion<string>()
                    .HasMaxLength(30);

                // =====================================================
                // UNIQUE INVOICE NUMBER PER ORGANIZATION
                // =====================================================

                entity.HasIndex(i => new
                {
                    i.OrganizationId,
                    i.InvoiceNumber
                })
                .IsUnique();

                // =====================================================
                // AMOUNTS
                // =====================================================

                entity.Property(i => i.SubTotal)
                    .HasColumnType("decimal(18,2)");

                entity.Property(i => i.DiscountAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(i => i.TaxableAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(i => i.TaxPercentage)
                    .HasColumnType("decimal(5,2)");

                entity.Property(i => i.TaxAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(i => i.TotalAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(i => i.PaidAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(i => i.BalanceAmount)
                    .HasColumnType("decimal(18,2)");
            
            // --------------------------------------
            // Enum stored as string
            // --------------------------------------

            entity.Property(i => i.Status)
                    .HasConversion<string>();

                // --------------------------------------
                // Soft delete
                // --------------------------------------

                entity.HasIndex(i => new
                {
                    i.OrganizationId,
                    i.IsDeleted
                });
            });


            modelBuilder.Entity<StudentEnrollment>(entity =>
            {
                entity.HasKey(e => e.EnrollmentId);

                entity.Property(e => e.EnrolledAt)
                    .HasColumnType("datetime(6)");

                entity.Property(e => e.EndedAt)
                    .HasColumnType("datetime(6)");

                entity.Property(e => e.ActiveCourseId)
                    .HasComputedColumnSql(
                        "CASE WHEN `IsActive` = 1 THEN `CourseId` ELSE NULL END",
                        stored: true);

                entity.HasIndex(e => new
                {
                    e.OrganizationId,
                    e.StudentId,
                    e.ActiveCourseId
                })
                    .IsUnique()
                    .HasDatabaseName("UX_StudentEnrollments_ActiveCourse");

                entity.HasIndex(e => new
                {
                    e.OrganizationId,
                    e.BatchId,
                    e.IsActive
                });

                entity.HasOne(e => e.Organization)
                    .WithMany()
                    .HasForeignKey(e => e.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Student)
                    .WithMany()
                    .HasForeignKey(e => e.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Course)
                    .WithMany()
                    .HasForeignKey(e => e.CourseId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Batch)
                    .WithMany()
                    .HasForeignKey(e => e.BatchId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
            // =========================================================
            // CHAT CONVERSATION
            // =========================================================

            modelBuilder.Entity<ChatConversation>(entity =>
            {
                entity.HasKey(x => x.ConversationId);

                entity.Property(x => x.CreatedAt)
                    .IsRequired();

                entity.HasOne(x => x.Organization)
                    .WithMany()
                    .HasForeignKey(x => x.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Mentor)
                    .WithMany()
                    .HasForeignKey(x => x.MentorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Student)
                    .WithMany()
                    .HasForeignKey(x => x.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);

                // One conversation per Mentor + Student
                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.MentorId,
                    x.StudentId
                })
                .IsUnique();
            });

            // =========================================================
            // CHAT MESSAGE
            // =========================================================

            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasKey(x => x.MessageId);

                entity.Property(x => x.SenderType)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.Message)
                    .HasMaxLength(5000)
                    .IsRequired();

                entity.HasOne(x => x.Conversation)
                    .WithMany(x => x.Messages)
                    .HasForeignKey(x => x.ConversationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(x => x.ConversationId);

                entity.HasIndex(x => x.SentAt);
            });

            // =========================================================
            // CHAT ATTACHMENT
            // =========================================================

            modelBuilder.Entity<ChatAttachment>(entity =>
            {
                entity.HasKey(x => x.AttachmentId);

                entity.Property(x => x.OriginalFileName)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.StoredFileName)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.FileType)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(x => x.StoragePath)
                    .HasMaxLength(1000)
                    .IsRequired();

                entity.Property(x => x.UploadedByType)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.HasOne(x => x.Conversation)
                    .WithMany()
                    .HasForeignKey(x => x.ConversationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.Message)
                    .WithOne(x => x.Attachment)
                    .HasForeignKey<ChatMessage>(
                        x => x.AttachmentId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(x => x.ConversationId);

                entity.HasIndex(x => x.MessageId);

                entity.HasIndex(x => x.UploadedBy);
            });

            // ==============================
            // Assessment Module
            // ==============================

            modelBuilder.Entity<Assessment>()
     .HasOne(a => a.Course)
     .WithMany(c => c.Assessments)
     .HasForeignKey(a => a.CourseId)
     .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Assessment>()
                .HasOne(a => a.Batch)
                .WithMany(b => b.Assessments)
                .HasForeignKey(a => a.BatchId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AssessmentQuestion>()
                .HasOne(q => q.Assessment)
                .WithMany(a => a.Questions)
                .HasForeignKey(q => q.AssessmentId);

            modelBuilder.Entity<AssessmentOption>()
                .HasOne(o => o.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.QuestionId);

            modelBuilder.Entity<StudentAssessment>()
                .HasOne(sa => sa.Assessment)
                .WithMany(a => a.StudentAssessments)
                .HasForeignKey(sa => sa.AssessmentId);

            modelBuilder.Entity<StudentAssessment>()
                .HasOne(sa => sa.Student)
                .WithMany()
                .HasForeignKey(sa => sa.StudentId);

            modelBuilder.Entity<StudentAssessmentAnswer>()
                .HasOne(a => a.StudentAssessment)
                .WithMany(sa => sa.Answers)
                .HasForeignKey(a => a.StudentAssessmentId);

            modelBuilder.Entity<StudentAssessmentAnswer>()
                .HasOne(a => a.Question)
                .WithMany()
                .HasForeignKey(a => a.QuestionId);
            modelBuilder.Entity<StudentAssessment>()
    .Property(x => x.Score)
    .HasPrecision(18, 2);

            modelBuilder.Entity<StudentAssessment>()
                .Property(x => x.Percentage)
                .HasPrecision(5, 2);

            modelBuilder.Entity<StudentAssessmentAnswer>()
                .Property(x => x.MarksAwarded)
                .HasPrecision(18, 2);
            modelBuilder.Entity<StudentAssessmentAnswer>()
    .HasOne(a => a.StudentAssessment)
    .WithMany(sa => sa.Answers)
    .HasForeignKey(a => a.StudentAssessmentId)
    .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<StudentAssessmentAnswer>()
                .HasOne(a => a.Question)
                .WithMany()
                .HasForeignKey(a => a.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<HrCalendarEvent>(entity =>
            {
                entity.HasKey(x => x.EventId);

                entity.Property(x => x.EventType)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.Title)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.Description)
                    .HasMaxLength(4000);

                entity.Property(x => x.Location)
                    .HasMaxLength(255);

                entity.Property(x => x.MeetingLink)
                    .HasMaxLength(2000);

                entity.Property(x => x.Color)
                    .HasMaxLength(100);

                entity.Property(x => x.CreatedBy)
                    .HasMaxLength(255);

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.StartDateTime
                });

                entity.HasIndex(x => new
                {
                    x.OrganizationId,
                    x.EventType
                });

                entity.HasOne(x => x.Organization)
                    .WithMany()
                    .HasForeignKey(x => x.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Course)
                    .WithMany()
                    .HasForeignKey(x => x.CourseId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Batch)
                    .WithMany()
                    .HasForeignKey(x => x.BatchId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Employee)
                    .WithMany()
                    .HasForeignKey(x => x.EmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Student)
                    .WithMany()
                    .HasForeignKey(x => x.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<BatchModuleCompletion>(entity =>
            {
                entity.HasKey(x => x.BatchModuleCompletionId);

                entity.HasIndex(x => new
                {
                    x.BatchId,
                    x.ModuleId
                }).IsUnique();

                entity.Property(x => x.Notes)
                    .HasMaxLength(1000);

                entity.HasOne<Batch>()
                    .WithMany()
                    .HasForeignKey(x => x.BatchId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<Course>()
                    .WithMany()
                    .HasForeignKey(x => x.CourseId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<CourseModule>()
                    .WithMany()
                    .HasForeignKey(x => x.ModuleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // Permission Modules
            // ==========================================

            modelBuilder.Entity<Permission>().HasData(

                new Permission
                {
                    PermissionId = 1,
                    Module = "Dashboard",
                    IsActive = true
                },

                new Permission
                {
                    PermissionId = 2,
                    Module = "Employees",
                    IsActive = true
                },

                new Permission
                {
                    PermissionId = 3,
                    Module = "Courses",
                    IsActive = true
                },

                new Permission
                {
                    PermissionId = 4,
                    Module = "Batches",
                    IsActive = true
                },

                new Permission
                {
                    PermissionId = 5,
                    Module = "Attendance",
                    IsActive = true
                },

                new Permission
                {
                    PermissionId = 6,
                    Module = "Assessments",
                    IsActive = true
                },

                new Permission
                {
                    PermissionId = 7,
                    Module = "Reports",
                    IsActive = true
                },

                new Permission
                {
                    PermissionId = 8,
                    Module = "LiveClass",
                    IsActive = true
                },

                new Permission
                {
                    PermissionId = 9,
                    Module = "EmployeeProfile",
                    IsActive = true
                },
                
new Permission
{
    PermissionId = 10,
    Module = "Students",
    IsActive = true
},
new Permission
{
    PermissionId = 11,
    Module = "Leave Management",
    IsActive = true
},
new Permission
{
    PermissionId = 12,
    Module = "Performance",
    IsActive = true
},
new Permission
{
    PermissionId = 13,
    Module = "Resources",
    IsActive = true
},
new Permission
{
    PermissionId = 14,
    Module = "Announcements",
    IsActive = true
},
new Permission
{
    PermissionId = 15,
    Module = "Settings",
    IsActive = true
},


new Permission
{
    PermissionId = 17,
    Module = "Calendar",
    IsActive = true
}




            );
            // ==========================================
            // Default Role Permissions
            // ==========================================

            modelBuilder.Entity<RolePermission>().HasData(

                // =====================================================
                // SuperAdmin
                // =====================================================

                new RolePermission
                {
                    RolePermissionId = 1,
                    Role = UserRole.SuperAdmin,
                    PermissionId = 1,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = true,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 2,
                    Role = UserRole.SuperAdmin,
                    PermissionId = 2,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = true,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 3,
                    Role = UserRole.SuperAdmin,
                    PermissionId = 3,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = true,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 4,
                    Role = UserRole.SuperAdmin,
                    PermissionId = 4,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = true,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 5,
                    Role = UserRole.SuperAdmin,
                    PermissionId = 5,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = true,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 6,
                    Role = UserRole.SuperAdmin,
                    PermissionId = 6,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = true,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 7,
                    Role = UserRole.SuperAdmin,
                    PermissionId = 7,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = true,
                    CanAccess = true
                },


                // =====================================================
                // HR
                // =====================================================

                new RolePermission
                {
                    RolePermissionId = 8,
                    Role = UserRole.HR,
                    PermissionId = 1,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 9,
                    Role = UserRole.HR,
                    PermissionId = 2,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 10,
                    Role = UserRole.HR,
                    PermissionId = 3,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 11,
                    Role = UserRole.HR,
                    PermissionId = 4,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 12,
                    Role = UserRole.HR,
                    PermissionId = 5,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 13,
                    Role = UserRole.HR,
                    PermissionId = 6,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 14,
                    Role = UserRole.HR,
                    PermissionId = 7,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },
               new RolePermission
               {
                   RolePermissionId = 15,
                   Role = UserRole.HR,
                   PermissionId = 11,
                   CanView = true,
                   CanAdd = true,
                   CanEdit = true,
                   CanDelete = false,
                   CanAccess = true
               },

// =====================================================
// HRRecruiter - default permissions
// =====================================================

new RolePermission
{
    RolePermissionId = 89,
    Role = UserRole.HRRecruiter,
    PermissionId = 1,
    CanView = true,
    CanAdd = false,
    CanEdit = false,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 90,
    Role = UserRole.HRRecruiter,
    PermissionId = 2,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 91,
    Role = UserRole.HRRecruiter,
    PermissionId = 3,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 92,
    Role = UserRole.HRRecruiter,
    PermissionId = 4,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 93,
    Role = UserRole.HRRecruiter,
    PermissionId = 5,
    CanView = true,
    CanAdd = false,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 94,
    Role = UserRole.HRRecruiter,
    PermissionId = 6,
    CanView = true,
    CanAdd = false,
    CanEdit = false,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 95,
    Role = UserRole.HRRecruiter,
    PermissionId = 7,
    CanView = true,
    CanAdd = false,
    CanEdit = false,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 96,
    Role = UserRole.HRRecruiter,
    PermissionId = 8,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 97,
    Role = UserRole.HRRecruiter,
    PermissionId = 9,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},



// =====================================================
// HRExecutive - default permissions
// =====================================================

new RolePermission
{
    RolePermissionId = 98,
    Role = UserRole.HRExecutive,
    PermissionId = 1,
    CanView = true,
    CanAdd = false,
    CanEdit = false,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 99,
    Role = UserRole.HRExecutive,
    PermissionId = 2,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 100,
    Role = UserRole.HRExecutive,
    PermissionId = 3,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 101,
    Role = UserRole.HRExecutive,
    PermissionId = 4,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 102,
    Role = UserRole.HRExecutive,
    PermissionId = 5,
    CanView = true,
    CanAdd = false,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 103,
    Role = UserRole.HRExecutive,
    PermissionId = 6,
    CanView = true,
    CanAdd = false,
    CanEdit = false,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 104,
    Role = UserRole.HRExecutive,
    PermissionId = 7,
    CanView = true,
    CanAdd = false,
    CanEdit = false,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 105,
    Role = UserRole.HRExecutive,
    PermissionId = 8,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 106,
    Role = UserRole.HRExecutive,
    PermissionId = 9,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},


                // =====================================================
                // OPERATION ASSOCIATE
                // =====================================================

                new RolePermission
                {
                    RolePermissionId = 71,
                    Role = UserRole.OperationAssociate,
                    PermissionId = 1,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 72,
                    Role = UserRole.OperationAssociate,
                    PermissionId = 2,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 73,
                    Role = UserRole.OperationAssociate,
                    PermissionId = 3,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 74,
                    Role = UserRole.OperationAssociate,
                    PermissionId = 4,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 75,
                    Role = UserRole.OperationAssociate,
                    PermissionId = 5,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 76,
                    Role = UserRole.OperationAssociate,
                    PermissionId = 6,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 77,
                    Role = UserRole.OperationAssociate,
                    PermissionId = 7,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },


                // =====================================================
                // MENTOR
                // =====================================================

                new RolePermission
                {
                    RolePermissionId = 22,
                    Role = UserRole.Mentor,
                    PermissionId = 1,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 23,
                    Role = UserRole.Mentor,
                    PermissionId = 2,
                    CanView = false,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = false
                },

                new RolePermission
                {
                    RolePermissionId = 24,
                    Role = UserRole.Mentor,
                    PermissionId = 3,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 25,
                    Role = UserRole.Mentor,
                    PermissionId = 4,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 26,
                    Role = UserRole.Mentor,
                    PermissionId = 5,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 27,
                    Role = UserRole.Mentor,
                    PermissionId = 6,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 28,
                    Role = UserRole.Mentor,
                    PermissionId = 7,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },


                // =====================================================
                // EMPLOYEE
                // =====================================================

                new RolePermission
                {
                    RolePermissionId = 29,
                    Role = UserRole.Employee,
                    PermissionId = 1,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 30,
                    Role = UserRole.Employee,
                    PermissionId = 2,
                    CanView = false,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = false
                },

                new RolePermission
                {
                    RolePermissionId = 31,
                    Role = UserRole.Employee,
                    PermissionId = 3,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 32,
                    Role = UserRole.Employee,
                    PermissionId = 4,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 33,
                    Role = UserRole.Employee,
                    PermissionId = 5,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 34,
                    Role = UserRole.Employee,
                    PermissionId = 6,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 35,
                    Role = UserRole.Employee,
                    PermissionId = 7,
                    CanView = false,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = false
                },


                // =====================================================
                // ORGANIZATION
                // =====================================================

                new RolePermission
                {
                    RolePermissionId = 36,
                    Role = UserRole.Organization,
                    PermissionId = 1,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 37,
                    Role = UserRole.Organization,
                    PermissionId = 2,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 38,
                    Role = UserRole.Organization,
                    PermissionId = 3,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 39,
                    Role = UserRole.Organization,
                    PermissionId = 4,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 40,
                    Role = UserRole.Organization,
                    PermissionId = 5,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 41,
                    Role = UserRole.Organization,
                    PermissionId = 6,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 42,
                    Role = UserRole.Organization,
                    PermissionId = 7,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },


                // =====================================================
                // STUDENT
                // =====================================================

                new RolePermission
                {
                    RolePermissionId = 43,
                    Role = UserRole.Student,
                    PermissionId = 1,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 44,
                    Role = UserRole.Student,
                    PermissionId = 2,
                    CanView = false,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = false
                },

                new RolePermission
                {
                    RolePermissionId = 45,
                    Role = UserRole.Student,
                    PermissionId = 3,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 46,
                    Role = UserRole.Student,
                    PermissionId = 4,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 47,
                    Role = UserRole.Student,
                    PermissionId = 5,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 48,
                    Role = UserRole.Student,
                    PermissionId = 6,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                new RolePermission
                {
                    RolePermissionId = 49,
                    Role = UserRole.Student,
                    PermissionId = 7,
                    CanView = false,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = false
                },

                // =====================================================
                // SUPER ADMIN - LIVE CLASS
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 57,
                    Role = UserRole.SuperAdmin,
                    PermissionId = 8,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = true,
                    CanAccess = true
                },

                // =====================================================
                // SUPER ADMIN - EMPLOYEE PROFILE
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 58,
                    Role = UserRole.SuperAdmin,
                    PermissionId = 9,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = true,
                    CanAccess = true
                },

                // =====================================================
                // HR - LIVE CLASS
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 59,
                    Role = UserRole.HR,
                    PermissionId = 8,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // HR - EMPLOYEE PROFILE
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 60,
                    Role = UserRole.HR,
                    PermissionId = 9,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // OPERATION ASSOCIATE - LIVE CLASS
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 61,
                    Role = UserRole.OperationAssociate,
                    PermissionId = 8,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // OPERATION ASSOCIATE - EMPLOYEE PROFILE
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 62,
                    Role = UserRole.OperationAssociate,
                    PermissionId = 9,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // MENTOR - LIVE CLASS
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 63,
                    Role = UserRole.Mentor,
                    PermissionId = 8,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // MENTOR - EMPLOYEE PROFILE
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 64,
                    Role = UserRole.Mentor,
                    PermissionId = 9,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // EMPLOYEE - LIVE CLASS
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 65,
                    Role = UserRole.Employee,
                    PermissionId = 8,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // EMPLOYEE - EMPLOYEE PROFILE
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 66,
                    Role = UserRole.Employee,
                    PermissionId = 9,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // ORGANIZATION - LIVE CLASS
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 67,
                    Role = UserRole.Organization,
                    PermissionId = 8,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // ORGANIZATION - EMPLOYEE PROFILE
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 68,
                    Role = UserRole.Organization,
                    PermissionId = 9,
                    CanView = true,
                    CanAdd = true,
                    CanEdit = true,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // STUDENT - LIVE CLASS
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 69,
                    Role = UserRole.Student,
                    PermissionId = 8,
                    CanView = true,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = true
                },

                // =====================================================
                // STUDENT - EMPLOYEE PROFILE
                // =====================================================
                new RolePermission
                {
                    RolePermissionId = 70,
                    Role = UserRole.Student,
                    PermissionId = 9,
                    CanView = false,
                    CanAdd = false,
                    CanEdit = false,
                    CanDelete = false,
                    CanAccess = false
                },
                
// =====================================================
// STUDENTS PERMISSIONS
// =====================================================

// SUPER ADMIN - STUDENTS
new RolePermission
{
    RolePermissionId = 107,
    Role = UserRole.SuperAdmin,
    PermissionId = 10,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = true,
    CanAccess = true
},

// ORGANIZATION - STUDENTS
new RolePermission
{
    RolePermissionId = 108,
    Role = UserRole.Organization,
    PermissionId = 10,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = true,
    CanAccess = true
},

// HR - STUDENTS
new RolePermission
{
    RolePermissionId = 109,
    Role = UserRole.HR,
    PermissionId = 10,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = true,
    CanAccess = true
},

// HR RECRUITER - STUDENTS
new RolePermission
{
    RolePermissionId = 110,
    Role = UserRole.HRRecruiter,
    PermissionId = 10,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

// HR EXECUTIVE - STUDENTS
new RolePermission
{
    RolePermissionId = 111,
    Role = UserRole.HRExecutive,
    PermissionId = 10,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

// OPERATION ASSOCIATE - STUDENTS
new RolePermission
{
    RolePermissionId = 112,
    Role = UserRole.OperationAssociate,
    PermissionId = 10,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

// MENTOR - STUDENTS
new RolePermission
{
    RolePermissionId = 113,
    Role = UserRole.Mentor,
    PermissionId = 10,
    CanView = true,
    CanAdd = false,
    CanEdit = false,
    CanDelete = false,
    CanAccess = true
},

// EMPLOYEE - STUDENTS
new RolePermission
{
    RolePermissionId = 114,
    Role = UserRole.Employee,
    PermissionId = 10,
    CanView = false,
    CanAdd = false,
    CanEdit = false,
    CanDelete = false,
    CanAccess = false
},

// STUDENT - STUDENTS
// A student should not manage the Students module
new RolePermission
{
    RolePermissionId = 115,
    Role = UserRole.Student,
    PermissionId = 10,
    CanView = false,
    CanAdd = false,
    CanEdit = false,
    CanDelete = false,
    CanAccess = false
},
// =====================================================
// HR - PERFORMANCE
// =====================================================

new RolePermission
{
    RolePermissionId = 116,
    Role = UserRole.HR,
    PermissionId = 12,
    CanView = true,
    CanAdd = false,
    CanEdit = false,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 117,
    Role = UserRole.HR,
    PermissionId = 13,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = true,
    CanAccess = true
},
// =====================================================
// HR - ANNOUNCEMENTS
// =====================================================

new RolePermission
{
    RolePermissionId = 118,
    Role = UserRole.HR,
    PermissionId = 14,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = true,
    CanAccess = true
},
new RolePermission
{
    RolePermissionId = 119,
    Role = UserRole.HR,
    PermissionId = 15,
    CanView = true,
    CanAdd = false,
    CanEdit = true,
    CanDelete = false,
    CanAccess = true
},

new RolePermission
{
    RolePermissionId = 121,
    Role = UserRole.HR,
    PermissionId = 17,
    CanView = true,
    CanAdd = true,
    CanEdit = true,
    CanDelete = true,
    CanAccess = true
}



            );

        }


    }
}



