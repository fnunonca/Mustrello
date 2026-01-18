using System.ComponentModel.DataAnnotations;

namespace Mustrello.Core.DTOs.Card;

public class CreateCardRequest
{
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int Position { get; set; }
}
