using System.Text.Json.Serialization;

namespace PlmApi.Models;

public class Ticket
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public int ReadingId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = "Open";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public Asset? Asset { get; set; }

    [JsonIgnore]
    public Reading? Reading { get; set; }
}