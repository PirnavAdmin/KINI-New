namespace TalentSphereAPI.Models
{
    public abstract class BaseEntity
    {
        public bool IsDeleted { get; set; } = false;

        public DateTime? DeletedOn { get; set; }

        public string? DeletedBy { get; set; }
    }
}