using System.ComponentModel.DataAnnotations;

namespace Mustrello.Core.DTOs.List;

public class UpdateListRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    public int? Position { get; set; }
}
