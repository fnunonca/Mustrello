using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mustrello.Core.DTOs.Board;
using Mustrello.Core.DTOs.List;
using Mustrello.Core.Entities;
using Mustrello.Infrastructure.Data;

namespace Mustrello.API.Controllers;

[Authorize]
[ApiController]
[Route("api")]
public class ListsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ListsController(AppDbContext context)
    {
        _context = context;
    }

    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

    [HttpPost("boards/{boardId}/lists")]
    public async Task<IActionResult> CreateList(string boardId, [FromBody] CreateListRequest request)
    {
        var userId = GetUserId();
        var board = await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == boardId && b.UserId == userId);

        if (board == null)
        {
            return NotFound(new { message = "Board not found" });
        }

        var list = new BoardList
        {
            Id = Guid.NewGuid().ToString(),
            BoardId = boardId,
            Name = request.Name,
            Position = request.Position,
            CreatedAt = DateTime.UtcNow
        };

        _context.BoardLists.Add(list);
        await _context.SaveChangesAsync();

        return Ok(new ListDto
        {
            Id = list.Id,
            Name = list.Name,
            Position = list.Position,
            Cards = new List<CardDto>()
        });
    }

    [HttpPut("lists/{id}")]
    public async Task<IActionResult> UpdateList(string id, [FromBody] UpdateListRequest request)
    {
        var userId = GetUserId();
        var list = await _context.BoardLists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == id && l.Board!.UserId == userId);

        if (list == null)
        {
            return NotFound(new { message = "List not found" });
        }

        if (request.Name != null)
        {
            list.Name = request.Name;
        }

        if (request.Position.HasValue)
        {
            list.Position = request.Position.Value;
        }

        await _context.SaveChangesAsync();

        return Ok(new ListDto
        {
            Id = list.Id,
            Name = list.Name,
            Position = list.Position
        });
    }

    [HttpDelete("lists/{id}")]
    public async Task<IActionResult> DeleteList(string id)
    {
        var userId = GetUserId();
        var list = await _context.BoardLists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == id && l.Board!.UserId == userId);

        if (list == null)
        {
            return NotFound(new { message = "List not found" });
        }

        _context.BoardLists.Remove(list);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }
}
