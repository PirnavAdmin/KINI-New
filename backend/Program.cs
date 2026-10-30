using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.Course;
using TalentSphereAPI.Hubs;
using TalentSphereAPI.Interfaces;
using TalentSphereAPI.Middleware;
using TalentSphereAPI.Models;
using TalentSphereAPI.Providers;
using TalentSphereAPI.Repositories;
using TalentSphereAPI.Repositories.Interfaces;
using TalentSphereAPI.Services;
using TalentSphereAPI.Services.Interfaces;
using TalentSphereAPI.Services.Tenancy;
using TalentSphereAPI.SignalR;
using TalentSphereAPI.Validators;
using TalentSphereAPI.Validators.LiveClass;

var builder = WebApplication.CreateBuilder(args);

#region Services



builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());

        options.JsonSerializerOptions.ReferenceHandler =
            ReferenceHandler.IgnoreCycles;
    });

// ============================================================
// LIVE CLASS RECORDING UPLOAD LIMIT
// Maximum recording size: 1 GB
// ============================================================

const long maxRecordingUploadSize = 1_073_741_824;

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize =
        maxRecordingUploadSize;
});

builder.Services.Configure<
    Microsoft.AspNetCore.Http.Features.FormOptions>(
    options =>
    {
        options.MultipartBodyLengthLimit =
            maxRecordingUploadSize;
    });

builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddValidatorsFromAssemblyContaining<CreateOrganizationDtoValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.FullName!.Replace("+", "."));

// ==========================================
// JWT Bearer Authentication
// ==========================================

options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",

            In = ParameterLocation.Header,

            Description =
                "Enter your JWT token. Example: Bearer {your token}"
        });

    // ==========================================
    // Apply JWT authentication to Swagger APIs
    // ==========================================

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type =
                                ReferenceType.SecurityScheme,

                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});


builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddScoped<ISmsService, Msg91SmsService>();

// CORS

builder.Services.AddCors(options =>

{

    options.AddPolicy("AllowReactApp", policy =>

    {

        policy

            .WithOrigins(

            //    "http://localhost:5173",

            //     "https://localhost:5173"

            "https://kiniedx.com",
"https://www.kiniedx.com"

            )

            .AllowAnyHeader()

            .AllowAnyMethod()

            .AllowCredentials();

    });

});

// Database

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(
            builder.Configuration.GetConnectionString("DefaultConnection")
        )));
// Repositories

builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IGetInTouchRepository, GetInTouchRepository>();
builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();
builder.Services.AddScoped<IEmployeeAttendanceRepository, EmployeeAttendanceRepository>();
builder.Services.AddScoped<IStudentCourseRepository, StudentCourseRepository>();
builder.Services.AddScoped<IStudentSyllabusRepository,StudentSyllabusRepository>();
builder.Services.AddScoped<ICourseSyllabusRepository,CourseSyllabusRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IEmployeeProfileRepository, EmployeeProfileRepository>();
builder.Services.AddScoped<IRegistrationRepository, RegistrationRepository>();







builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<ISuperAdminDashboardRepository,SuperAdminDashboardRepository>();

builder.Services.AddScoped<ISkillRepository, SkillRepository>();

builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();

builder.Services.AddScoped<IBranchRepository, BranchRepository>();

builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();

builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IRecycleBinRepository, RecycleBinRepository>();

builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();

builder.Services.AddScoped<ISuperAdminEmployeeRepository, SuperAdminEmployeeRepository>();
builder.Services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();



builder.Services.AddScoped<ICourseRepository, CourseRepository>();

builder.Services.AddScoped<IAssessmentRepository, AssessmentRepository>();
builder.Services.AddScoped<IAssessmentQuestionRepository, AssessmentQuestionRepository>();
builder.Services.AddScoped<IStudentAssessmentRepository, StudentAssessmentRepository>();

builder.Services.AddScoped<IGoalRepository, GoalRepository>();

builder.Services.AddScoped<IStudentRepository, StudentRepository>();

builder.Services.AddScoped<ITeamRepository, TeamRepository>();

builder.Services.AddScoped<IReportsRepository, ReportsRepository>();

builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();

builder.Services.AddScoped<IRoleRepository, RoleRepository>();

builder.Services.AddScoped<IRoleCompetencyRepository, RoleCompetencyRepository>();

builder.Services.AddScoped<ICompetencyRepository, CompetencyRepository>();
builder.Services.AddScoped<IMentorRepository, MentorRepository>();

builder.Services.AddScoped<ISuperAdminRepository, SuperAdminRepository>();
builder.Services.AddScoped<IBatchRepository, BatchRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

builder.Services.AddScoped<ICalendarRepository, CalendarRepository>();
builder.Services.AddScoped<IMentorDashboardRepository, MentorDashboardRepository>();
builder.Services.AddScoped<IStudentBatchRepository, StudentBatchRepository>();







// Services

builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
builder.Services.AddScoped<IAssessmentAiService, AssessmentAiService>();
builder.Services.AddScoped<IAssessmentPdfImportService, AssessmentPdfImportService>();


builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IEmployeeAttendanceService, EmployeeAttendanceService>();
builder.Services.AddScoped<IHrAttendanceService, HrAttendanceService>();
builder.Services.AddScoped<IHrLeaveService, HrLeaveService>();
builder.Services.AddScoped<IHrStudentService, HrStudentService>();
builder.Services.AddScoped<IHrCalendarService, HrCalendarService>();
builder.Services.AddSingleton<DateTimeService>();
builder.Services.AddScoped<IStudentCourseService, StudentCourseService>();
builder.Services.AddScoped<IStudentSyllabusService,StudentSyllabusService>();
builder.Services.AddScoped<ICourseSyllabusService,CourseSyllabusService>();
builder.Services.AddScoped<ISyllabusPdfParserService, SyllabusPdfParserService>();


builder.Services.AddScoped<EmployeeIdentityService>();
builder.Services.AddScoped<IHrPerformanceService, HrPerformanceService>();
builder.Services.AddScoped<IHrResourceService, HrResourceService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ISuperAdminDashboardService,SuperAdminDashboardService>();
builder.Services.AddScoped<ISkillService, SkillService>();
builder.Services.AddScoped<IHrAnnouncementService, HrAnnouncementService>();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();
builder.Services.AddScoped<IStudentBatchService, StudentBatchService>();
builder.Services.AddScoped<IHrSettingsService, HrSettingsService>();
builder.Services.AddScoped<IBranchService, BranchService>();
builder.Services.AddScoped<IRecycleBinService, RecycleBinService>();

builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();

builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IMentorService, MentorService>();

builder.Services.AddScoped<IPaymentService, PaymentService>();

builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IHrEmployeeService, HrEmployeeService>();

builder.Services.AddScoped<ISuperAdminEmployeeService, SuperAdminEmployeeService>();
builder.Services.AddScoped<IEmployeeProfileService, EmployeeProfileService>();
builder.Services.AddScoped<EmployeeProfileIdentityService>();

builder.Services.AddScoped<ICourseService, CourseService>();

builder.Services.AddScoped<IAssessmentService, AssessmentService>();   
builder.Services.AddScoped<IAssessmentQuestionService, AssessmentQuestionService>();
builder.Services.AddScoped<IStudentAssessmentService, StudentAssessmentService>();

builder.Services.AddScoped<IGoalService, GoalService>();

builder.Services.AddScoped<IStudentService, StudentService>();

builder.Services.AddScoped<IReportsService, ReportsService>();

builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();

builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IRoleCompetencyService, RoleCompetencyService>();
builder.Services.AddScoped<ICompetencyService, CompetencyService>();
builder.Services.AddScoped<IBatchService, BatchService>();
builder.Services.AddScoped<ISuperAdminAuthService, SuperAdminAuthService>();
builder.Services.AddScoped<ILiveClassRecordingService, LiveClassRecordingService>();
builder.Services.AddScoped<ILiveClassDashboardService, LiveClassDashboardService>();
builder.Services.AddScoped<ILiveClassDropdownService, LiveClassDropdownService>();
builder.Services.AddScoped<ILiveClassService, LiveClassService>();
builder.Services.AddScoped<IMentorDashboardService, MentorDashboardService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<
    TalentSphereAPI.Services.Tenancy.ITenantContext,
    TalentSphereAPI.Services.Tenancy.TenantContext>();

builder.Services.AddScoped<ILiveClassPdfService, LiveClassPdfService>();

builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddScoped<IInvoiceService, InvoiceService>();

builder.Services.AddScoped<IInvoicePdfService, InvoicePdfService>();

builder.Services.AddSignalR();

builder.Services.AddScoped<ISignalRService, SignalRService>();

builder.Services.AddHostedService<ClassReminderBackgroundService>();
builder.Services.AddHostedService<EmployeeAttendanceBackgroundService>();

builder.Services.AddScoped<IAttendancePdfService, AttendancePdfService>();

builder.Services.AddScoped<IExcelExportService, ExcelExportService>();

builder.Services.AddHttpClient();

builder.Services.AddHttpClient<IOpenRouterService, OpenRouterService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(2);
});





builder.Services.Configure<MSG91Settings>(
    builder.Configuration.GetSection("MSG91"));

builder.Services.AddHttpClient<ISmsService, Msg91SmsService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();


#endregion

builder.Services.AddScoped<IAttendanceProcessor, AttendanceProcessor>();

builder.Services.AddScoped<ZoomAttendanceProvider>();
builder.Services.AddScoped<GoogleMeetAttendanceProvider>();
builder.Services.AddScoped<JitsiAttendanceProvider>();
//builder.Services.AddScoped<TeamsAttendanceProvider>();
builder.Services.AddScoped<IMeetingAttendanceProvider, ZoomAttendanceProvider>();
builder.Services.AddScoped<IMeetingAttendanceProvider, GoogleMeetAttendanceProvider>();
//builder.Services.AddScoped<IMeetingAttendanceProvider, TeamsAttendanceProvider>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IMeetingAttendanceProvider, JitsiAttendanceProvider>();

builder.Services.AddScoped<IMeetingProviderFactory, MeetingProviderFactory>();

builder.Services.AddScoped<IProfilePhotoService, ProfilePhotoService>();



#region JWT Authentication

var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);

builder.Services.AddAuthentication(options =>

{

    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

})

.AddJwtBearer(options =>

{

    options.RequireHttpsMetadata = false;

    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters

    {

        ValidateIssuerSigningKey = true,

        IssuerSigningKey = new SymmetricSecurityKey(key),

        ValidateIssuer = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],

        ValidateAudience = true,

        ValidAudience = builder.Configuration["Jwt:Audience"],

        ValidateLifetime = true,

        ClockSkew = TimeSpan.Zero

    };

});

builder.Services.AddAuthorization();

#endregion
builder.Services.AddScoped<IValidator<CreateCourseDto>, CreateCourseDtoValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateLiveClassDtoValidator>();

builder.Services.AddScoped<IValidator<UpdateCourseDto>, UpdateCourseDtoValidator>();
builder.Services.AddApplicationInsightsTelemetry();
builder.Services.AddSingleton<
    IAuthorizationPolicyProvider,
    PermissionPolicyProvider>();

builder.Services.AddScoped<
    IAuthorizationHandler,
    PermissionAuthorizationHandler>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    await DbSeeder.SeedSuperAdminAsync(context);
}

#region Middleware Pipeline

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// IMPORTANT:
// CORS must run BEFORE StaticFiles so that
// /coursepdfs/*.pdf responses receive
// Access-Control-Allow-Origin.

app.UseCors("AllowReactApp");

app.UseStaticFiles();

app.UseCustomExceptionMiddleware();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

#endregion
app.MapHub<AttendanceHub>("/attendanceHub");

app.MapHub<NotificationHub>("/notificationHub");

app.MapHub<ChatHub>("/chatHub");

app.Run();
