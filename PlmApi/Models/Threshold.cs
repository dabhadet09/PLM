using System.Text.Json.Serialization;

namespace PlmApi.Models;

public class Threshold
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public double RmsMax { get; set; }
    public double TempMax { get; set; }

    [JsonIgnore]
    public Asset? Asset { get; set; }
}