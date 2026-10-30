using Microsoft.AspNetCore.Identity;

using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Data

{

    public static class DbSeeder

    {

        public static async Task SeedSuperAdminAsync(ApplicationDbContext context)

        {

            if (await context.SuperAdmins.AnyAsync())

                return;

            var hasher = new PasswordHasher<object>();

            var SuperAdmin = new SuperAdmin

            {

                Email = "admin@talentsphere.com",

                PasswordHash = hasher.HashPassword(new object(), "Admin@123"),

                IsActive = true

            };

            context.SuperAdmins.Add(SuperAdmin);

            await context.SaveChangesAsync();

        }

    }

}
