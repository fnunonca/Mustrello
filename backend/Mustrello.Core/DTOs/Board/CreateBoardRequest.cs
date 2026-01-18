using System.ComponentModel.DataAnnotations;

namespace Mustrello.Core.DTOs.Board;

public class CreateBoardRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
