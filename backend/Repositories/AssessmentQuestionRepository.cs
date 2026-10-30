using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories
{
    public class AssessmentQuestionRepository : IAssessmentQuestionRepository
    {
        private readonly ApplicationDbContext _context;

        public AssessmentQuestionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<AssessmentQuestion>> GetByAssessmentAsync(int assessmentId)
        {
            return await _context.AssessmentQuestions
                .Include(q => q.Options)
                .Where(q => q.AssessmentId == assessmentId)
                .OrderBy(q => q.OrderNo)
                .ToListAsync();
        }

        public async Task<AssessmentQuestion?> GetByIdAsync(int questionId)
        {
            return await _context.AssessmentQuestions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.QuestionId == questionId);
        }

        public async Task AddAsync(AssessmentQuestion question)
        {
            await _context.AssessmentQuestions.AddAsync(question);
        }

        public Task UpdateAsync(AssessmentQuestion question)
        {
            _context.AssessmentQuestions.Update(question);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(AssessmentQuestion question)
        {
            _context.AssessmentQuestions.Remove(question);
            return Task.CompletedTask;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}