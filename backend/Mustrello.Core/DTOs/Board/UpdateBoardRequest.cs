using System.ComponentModel.DataAnnotations;

namespace Mustrello.Core.DTOs.Board;

public class UpdateBoardRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    public string? Description { get; set; }
}
