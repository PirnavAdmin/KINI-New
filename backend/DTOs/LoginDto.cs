using TalentSphereAPI.Models;

public class LoginDto
{
    public string Identifier { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

   
    public bool RememberMe { get; set; }
}