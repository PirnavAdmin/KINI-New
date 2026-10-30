using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories
{
    public class GetInTouchRepository : IGetInTouchRepository
    {
        private readonly ApplicationDbContext _context;

        public GetInTouchRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<GetInTouch> CreateAsync(GetInTouchDto dto)
        {
            var entity = new GetInTouch
            {
                Name = dto.Name.Trim(),
                Email = dto.Email.Trim(),
                MobileNumber = dto.MobileNumber.Trim(),
                Subject = dto.Subject.Trim(),
                Message = dto.Message.Trim(),
                CreatedDate = DateTime.UtcNow
            };

            await _context.GetInTouches.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<List<GetInTouch>> GetAllAsync()
        {
            return await _context.GetInTouches
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task<GetInTouch?> GetByIdAsync(int id)
        {
            return await _context.GetInTouches
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
