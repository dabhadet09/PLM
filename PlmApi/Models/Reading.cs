namespace PlmApi.Models;

public class Reading
{
    public int Id { get; set; }
    public int SensorId { get; set; }
    public Sensor Sensor { get; set; } = null!;
    public double Rms { get; set; }
    public double Temp { get; set; }
    public DateTime Timestamp { get; set; }
}