using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories
{
    public class AssessmentRepository : IAssessmentRepository
    {
        private readonly ApplicationDbContext _context;

        public AssessmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Assessment>> GetAllAsync()
        {
            return await _context.Assessments
                .Include(a => a.Course)
                .Include(a => a.Batch)
                .OrderByDescending(a => a.AssessmentId)
                .ToListAsync();
        }

        public async Task<Assessment?> GetByIdAsync(int assessmentId)
        {
            return await _context.Assessments
                .Include(a => a.Course)
                .Include(a => a.Batch)
                .Include(a => a.Questions)
                    .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(a => a.AssessmentId == assessmentId);
        }

        public async Task AddAsync(Assessment assessment)
        {
            await _context.Assessments.AddAsync(assessment);
        }

        public Task UpdateAsync(Assessment assessment)
        {
            _context.Assessments.Update(assessment);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Assessment assessment)
        {
            _context.Assessments.Remove(assessment);
            return Task.CompletedTask;
        }

        public async Task<bool> ExistsAsync(int assessmentId)

        {
            return await _context.Assessments
                .AnyAsync(a => a.AssessmentId == assessmentId);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task AddQuestionsAsync(
    IEnumerable<AssessmentQuestion> questions)
        {
            await _context.AssessmentQuestions.AddRangeAsync(questions);
        }
    }
}