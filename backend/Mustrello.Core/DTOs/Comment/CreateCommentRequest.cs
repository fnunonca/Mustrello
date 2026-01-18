using System.ComponentModel.DataAnnotations;

namespace Mustrello.Core.DTOs.Comment;

public class CreateCommentRequest
{
    [Required]
    public string Text { get; set; } = string.Empty;
}
