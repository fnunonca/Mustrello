using Microsoft.EntityFrameworkCore;
using Mustrello.Core.Entities;

namespace Mustrello.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (!await context.Users.AnyAsync(u => u.Username == "oasis"))
        {
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Username = "oasis",
                Email = "oasis@mustrello.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("oasis"),
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();
        }
    }
}
