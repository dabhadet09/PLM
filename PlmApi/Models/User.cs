using System.ComponentModel.DataAnnotations;

namespace PlmApi.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty; // This will store the email
    public string Password { get; set; } = string.Empty; // Storing hashed password
    public string Role { get; set; } = "Engineer";
    public bool IsActive { get; set; } = true;
}

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    [Required]
    [EmailAddress(ErrorMessage = "Valid email address is required.")]
    [RegularExpression(@"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Email must be a full valid email address (e.g. abc@gmail.com).")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "Password must contain at least one uppercase letter and one number.")]
    public string Password { get; set; } = string.Empty;

    public string Role { get; set; } = "Engineer"; // "Admin" or "Engineer"
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class ResetPasswordRequest
{
    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
    public string NewPassword { get; set; } = string.Empty;
}