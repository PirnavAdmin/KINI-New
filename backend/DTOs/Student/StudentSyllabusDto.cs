namespace TalentSphereAPI.DTOs.StudentSyllabus
{
    public class StudentSyllabusDto
    {
        public int StudentId { get; set; }

        public SyllabusCourseDto? Course { get; set; }
    }
}