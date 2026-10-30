using Microsoft.EntityFrameworkCore;
using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories.Interfaces;

namespace TalentSphereAPI.Repositories
{
    public class RegistrationRepository : IRegistrationRepository
    {
        private readonly ApplicationDbContext _context;

        public RegistrationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Registration> CreateAsync(RegistrationDto dto)
        {
            var email = dto.Email.Trim();
            if (await _context.Registrations.AnyAsync(x => x.Email.ToLower() == email.ToLower()))
                throw new InvalidOperationException("Email already registered.");

            var entity = new Registration
            {
                Name = dto.Name.Trim(),
                Email = email,
                MobileNumber = dto.MobileNumber.Trim(),
                Qualification = dto.Qualification.Trim(),
                Program = dto.Program.Trim(),
                CreatedDate = DateTime.UtcNow
            };

            _context.Registrations.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public Task<List<Registration>> GetAllAsync() =>
            _context.Registrations.AsNoTracking()
                .OrderByDescending(x => x.Id)
                .ToListAsync();

        public Task<Registration?> GetByIdAsync(int id) =>
            _context.Registrations.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
    }
}
