using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mustrello.Core.DTOs.Board;
using Mustrello.Core.Entities;
using Mustrello.Infrastructure.Data;

namespace Mustrello.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BoardsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BoardsController(AppDbContext context)
    {
        _context = context;
    }

    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

    [HttpGet]
    public async Task<IActionResult> GetBoards()
    {
        var userId = GetUserId();
        var boards = await _context.Boards
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BoardDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(boards);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBoard(string id)
    {
        var userId = GetUserId();
        var board = await _context.Boards
            .Where(b => b.Id == id && b.UserId == userId)
            .Include(b => b.Lists.OrderBy(l => l.Position))
                .ThenInclude(l => l.Cards.OrderBy(c => c.Position))
                    .ThenInclude(c => c.Comments.OrderBy(cm => cm.CreatedAt))
            .FirstOrDefaultAsync();

        if (board == null)
        {
            return NotFound(new { message = "Board not found" });
        }

        var boardDto = new BoardDto
        {
            Id = board.Id,
            Name = board.Name,
            Description = board.Description,
            CreatedAt = board.CreatedAt,
            Lists = board.Lists.Select(l => new ListDto
            {
                Id = l.Id,
                Name = l.Name,
                Position = l.Position,
                Cards = l.Cards.Select(c => new CardDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    Position = c.Position,
                    Color = c.Color,
                    Comments = c.Comments.Select(cm => new CommentDto
                    {
                        Id = cm.Id,
                        Text = cm.Text,
                        CreatedAt = cm.CreatedAt,
                        UpdatedAt = cm.UpdatedAt
                    }).ToList()
                }).ToList()
            }).ToList()
        };

        return Ok(boardDto);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBoard([FromBody] CreateBoardRequest request)
    {
        var userId = GetUserId();
        var board = new Board
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.Boards.Add(board);
        await _context.SaveChangesAsync();

        return Ok(new BoardDto
        {
            Id = board.Id,
            Name = board.Name,
            Description = board.Description,
            CreatedAt = board.CreatedAt,
            Lists = new List<ListDto>()
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBoard(string id, [FromBody] UpdateBoardRequest request)
    {
        var userId = GetUserId();
        var board = await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (board == null)
        {
            return NotFound(new { message = "Board not found" });
        }

        if (request.Name != null)
        {
            board.Name = request.Name;
        }

        if (request.Description != null)
        {
            board.Description = request.Description;
        }

        await _context.SaveChangesAsync();

        return Ok(new BoardDto
        {
            Id = board.Id,
            Name = board.Name,
            Description = board.Description,
            CreatedAt = board.CreatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(string id)
    {
        var userId = GetUserId();
        var board = await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (board == null)
        {
            return NotFound(new { message = "Board not found" });
        }

        _context.Boards.Remove(board);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }
}
