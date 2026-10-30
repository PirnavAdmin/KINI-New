using TalentSphereAPI.DTOs.Mentor;

namespace TalentSphereAPI.Repositories
{
    public interface IMentorRepository
    {
        Task<(IEnumerable<MentorListDto> Mentors, int TotalCount)> GetAllAsync(MentorQueryParameters query);

        Task<MentorDto?> GetByIdAsync(int mentorId);

        Task<bool> CreateAsync(CreateMentorDto dto);

        Task<bool> UpdateAsync(int mentorId, UpdateMentorDto dto);

        Task<bool> DeleteAsync(int mentorId);

        Task<int?> GetIdByEmailAsync(
           string email);
    
}
}