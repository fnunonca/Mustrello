using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mustrello.Core.DTOs.Board;
using Mustrello.Core.DTOs.Card;
using Mustrello.Core.Entities;
using Mustrello.Infrastructure.Data;

namespace Mustrello.API.Controllers;

[Authorize]
[ApiController]
[Route("api")]
public class CardsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CardsController(AppDbContext context)
    {
        _context = context;
    }

    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

    [HttpPost("lists/{listId}/cards")]
    public async Task<IActionResult> CreateCard(string listId, [FromBody] CreateCardRequest request)
    {
        var userId = GetUserId();
        var list = await _context.BoardLists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == listId && l.Board!.UserId == userId);

        if (list == null)
        {
            return NotFound(new { message = "List not found" });
        }

        var card = new Card
        {
            Id = Guid.NewGuid().ToString(),
            ListId = listId,
            Title = request.Title,
            Description = request.Description,
            Position = request.Position,
            CreatedAt = DateTime.UtcNow
        };

        _context.Cards.Add(card);
        await _context.SaveChangesAsync();

        return Ok(new CardDto
        {
            Id = card.Id,
            Title = card.Title,
            Description = card.Description,
            Position = card.Position,
            Color = card.Color,
            Comments = new List<CommentDto>()
        });
    }

    [HttpPut("cards/{id}")]
    public async Task<IActionResult> UpdateCard(string id, [FromBody] UpdateCardRequest request)
    {
        var userId = GetUserId();
        var card = await _context.Cards
            .Include(c => c.List)
                .ThenInclude(l => l!.Board)
            .FirstOrDefaultAsync(c => c.Id == id && c.List!.Board!.UserId == userId);

        if (card == null)
        {
            return NotFound(new { message = "Card not found" });
        }

        if (request.Title != null)
        {
            card.Title = request.Title;
        }

        if (request.Description != null)
        {
            card.Description = request.Description;
        }

        if (request.Color != null)
        {
            card.Color = request.Color;
        }

        if (request.Position.HasValue)
        {
            card.Position = request.Position.Value;
        }

        await _context.SaveChangesAsync();

        return Ok(new CardDto
        {
            Id = card.Id,
            Title = card.Title,
            Description = card.Description,
            Position = card.Position,
            Color = card.Color
        });
    }

    [HttpDelete("cards/{id}")]
    public async Task<IActionResult> DeleteCard(string id)
    {
        var userId = GetUserId();
        var card = await _context.Cards
            .Include(c => c.List)
                .ThenInclude(l => l!.Board)
            .FirstOrDefaultAsync(c => c.Id == id && c.List!.Board!.UserId == userId);

        if (card == null)
        {
            return NotFound(new { message = "Card not found" });
        }

        _context.Cards.Remove(card);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpPost("cards/{id}/move")]
    public async Task<IActionResult> MoveCard(string id, [FromBody] MoveCardRequest request)
    {
        var userId = GetUserId();
        var card = await _context.Cards
            .Include(c => c.List)
                .ThenInclude(l => l!.Board)
            .FirstOrDefaultAsync(c => c.Id == id && c.List!.Board!.UserId == userId);

        if (card == null)
        {
            return NotFound(new { message = "Card not found" });
        }

        // Verify target list belongs to same user
        var targetList = await _context.BoardLists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == request.TargetListId && l.Board!.UserId == userId);

        if (targetList == null)
        {
            return NotFound(new { message = "Target list not found" });
        }

        card.ListId = request.TargetListId;
        card.Position = request.NewPosition;

        await _context.SaveChangesAsync();

        return Ok(new CardDto
        {
            Id = card.Id,
            Title = card.Title,
            Description = card.Description,
            Position = card.Position,
            Color = card.Color
        });
    }
}
