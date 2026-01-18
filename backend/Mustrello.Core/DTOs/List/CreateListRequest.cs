using System.ComponentModel.DataAnnotations;

namespace Mustrello.Core.DTOs.List;

public class CreateListRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public int Position { get; set; }
}
