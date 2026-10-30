namespace TalentSphereAPI.Models
{
    public class Organization
    {
        public int OrganizationId { get; set; }

        public string OrganizationName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Industry { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;

        public string Website { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string? GoogleSubjectId { get; set; }

        public DateTime CreatedDate { get; set; }
            = DateTime.UtcNow;

        // ==============================
        // Existing relationships
        // ==============================

        public ICollection<Branch>? Branches { get; set; }

        public ICollection<Department>? Departments { get; set; }

        public ICollection<Subscription> Subscriptions { get; set; }
            = new List<Subscription>();

        // ==============================
        // Tenant-owned data
        // ==============================

        public ICollection<User> Users { get; set; }
            = new List<User>();

        public ICollection<Employee> Employees { get; set; }
            = new List<Employee>();

        public ICollection<Mentor> Mentors { get; set; }
            = new List<Mentor>();

        public ICollection<Student> Students { get; set; }
            = new List<Student>();

        public ICollection<Course> Courses { get; set; }
            = new List<Course>();

        public ICollection<Batch> Batches { get; set; }
            = new List<Batch>();

        public ICollection<Notification> Notifications { get; set; }
    = new List<Notification>();
    }
}