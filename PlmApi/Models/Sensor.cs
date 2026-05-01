using System.Text.Json.Serialization;

namespace PlmApi.Models;

public class Sensor
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;

    [JsonIgnore]
    public Asset? Asset { get; set; }

    [JsonIgnore]
    public ICollection<Reading> Readings { get; set; } = new List<Reading>();
}