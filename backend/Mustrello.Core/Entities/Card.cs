namespace Mustrello.Core.Entities;

public class Card
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ListId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Position { get; set; }
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public BoardList? List { get; set; }
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
