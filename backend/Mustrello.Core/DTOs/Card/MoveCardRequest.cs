using System.ComponentModel.DataAnnotations;

namespace Mustrello.Core.DTOs.Card;

public class MoveCardRequest
{
    [Required]
    public string TargetListId { get; set; } = string.Empty;

    public int NewPosition { get; set; }
}
