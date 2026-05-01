namespace PlmApi.Models;

public class Asset
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ICollection<Sensor> Sensors { get; set; } = new List<Sensor>();
}