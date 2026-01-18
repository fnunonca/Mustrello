using System.ComponentModel.DataAnnotations;

namespace Mustrello.Core.DTOs.Card;

public class UpdateCardRequest
{
    [MaxLength(500)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    public string? Color { get; set; }

    public int? Position { get; set; }
}
