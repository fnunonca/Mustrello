namespace Mustrello.Core.Entities;

public class BoardList
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BoardId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Board? Board { get; set; }
    public ICollection<Card> Cards { get; set; } = new List<Card>();
}
