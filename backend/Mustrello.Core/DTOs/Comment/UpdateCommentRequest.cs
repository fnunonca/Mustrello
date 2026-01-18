using System.ComponentModel.DataAnnotations;

namespace Mustrello.Core.DTOs.Comment;

public class UpdateCommentRequest
{
    [Required]
    public string Text { get; set; } = string.Empty;
}
