public class OrganizationLoginResponseDto
{
    public string Message { get; set; } = string.Empty;
    public int OrganizationId { get; set; }

    public string OrganizationName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Token { get; set; } = string.Empty;

    public DateTime Expiration { get; set; }
}