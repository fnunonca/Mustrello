using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mustrello.Core.DTOs.Board;
using Mustrello.Core.DTOs.Comment;
using Mustrello.Core.Entities;
using Mustrello.Infrastructure.Data;

namespace Mustrello.API.Controllers;

[Authorize]
[ApiController]
[Route("api")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CommentsController(AppDbContext context)
    {
        _context = context;
    }

    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

    [HttpPost("cards/{cardId}/comments")]
    public async Task<IActionResult> CreateComment(string cardId, [FromBody] CreateCommentRequest request)
    {
        var userId = GetUserId();
        var card = await _context.Cards
            .Include(c => c.List)
                .ThenInclude(l => l!.Board)
            .FirstOrDefaultAsync(c => c.Id == cardId && c.List!.Board!.UserId == userId);

        if (card == null)
        {
            return NotFound(new { message = "Card not found" });
        }

        var comment = new Comment
        {
            Id = Guid.NewGuid().ToString(),
            CardId = cardId,
            Text = request.Text,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(new CommentDto
        {
            Id = comment.Id,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        });
    }

    [HttpPut("comments/{id}")]
    public async Task<IActionResult> UpdateComment(string id, [FromBody] UpdateCommentRequest request)
    {
        var userId = GetUserId();
        var comment = await _context.Comments
            .Include(c => c.Card)
                .ThenInclude(c => c!.List)
                    .ThenInclude(l => l!.Board)
            .FirstOrDefaultAsync(c => c.Id == id && c.Card!.List!.Board!.UserId == userId);

        if (comment == null)
        {
            return NotFound(new { message = "Comment not found" });
        }

        comment.Text = request.Text;
        comment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new CommentDto
        {
            Id = comment.Id,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        });
    }

    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(string id)
    {
        var userId = GetUserId();
        var comment = await _context.Comments
            .Include(c => c.Card)
                .ThenInclude(c => c!.List)
                    .ThenInclude(l => l!.Board)
            .FirstOrDefaultAsync(c => c.Id == id && c.Card!.List!.Board!.UserId == userId);

        if (comment == null)
        {
            return NotFound(new { message = "Comment not found" });
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }
}
