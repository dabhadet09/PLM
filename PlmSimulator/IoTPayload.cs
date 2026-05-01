namespace PlmSimulator;

public class IoTPayload
{
    public string DeviceId { get; set; } = string.Empty;
    public string Ts { get; set; } = string.Empty;
    public double Rms { get; set; }
    public double Temp { get; set; }
    public int SensorId { get; set; }
}