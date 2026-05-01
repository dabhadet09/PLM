using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false)
    .Build();

var apiUrl = config["ApiUrl"];
var intervalSeconds = int.Parse(config["IntervalSeconds"]!);
var spikeEveryN = int.Parse(config["SpikeEveryN"]!);

var httpClient = new HttpClient();
var random = new Random();
var jsonOptions = new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true
};

Console.WriteLine("PLM Simulator starting...");
Console.WriteLine($"API: {apiUrl}");

// Auto-discover assets and sensors from API
List<SensorInfo> activeSensors = new();

try
{
    Console.WriteLine("Fetching assets from API...");
    var assetsResponse = await httpClient.GetStringAsync($"{apiUrl}/api/assets");
    var assets = JsonSerializer.Deserialize<List<AssetDto>>(assetsResponse, jsonOptions) ?? new();

    Console.WriteLine($"Found {assets.Count} assets");

    var sensorsResponse = await httpClient.GetStringAsync($"{apiUrl}/api/sensors");
    var sensors = JsonSerializer.Deserialize<List<SensorDto>>(sensorsResponse, jsonOptions) ?? new();

    Console.WriteLine($"Found {sensors.Count} sensors");

    // Match sensors to assets
    foreach (var asset in assets)
    {
        var sensor = sensors.FirstOrDefault(s => s.AssetId == asset.Id);
        if (sensor != null)
        {
            activeSensors.Add(new SensorInfo
            {
                AssetId = asset.Id,
                AssetName = asset.Name,
                SensorId = sensor.Id,
                Counter = 0
            });
            Console.WriteLine($"  ✅ Asset: {asset.Name} (ID:{asset.Id}) → Sensor ID:{sensor.Id}");
        }
        else
        {
            Console.WriteLine($"  ⚠️  Asset: {asset.Name} (ID:{asset.Id}) → No sensor found, skipping");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Failed to fetch assets/sensors: {ex.Message}");
    Console.WriteLine("Make sure PlmApi is running at " + apiUrl);
    return;
}

if (!activeSensors.Any())
{
    Console.WriteLine("❌ No assets with sensors found. Create assets and sensors first.");
    return;
}

Console.WriteLine($"\nMonitoring {activeSensors.Count} asset(s)");
Console.WriteLine($"Interval: {intervalSeconds}s | Spike every {spikeEveryN} readings");
Console.WriteLine("Press Ctrl+C to stop.\n");

while (true)
{
    foreach (var sensor in activeSensors)
    {
        sensor.Counter++;
        bool isSpike = sensor.Counter % spikeEveryN == 0;

        double rms = isSpike
            ? 4.5 + random.NextDouble()
            : 1.0 + random.NextDouble() * 1.5;

        double temp = isSpike
            ? 88.0 + random.NextDouble() * 8.0
            : 60.0 + random.NextDouble() * 15.0;

        var payload = new
        {
            deviceId = $"asset-{sensor.AssetId:D3}",
            ts = DateTime.UtcNow.ToString("o"),
            rms = Math.Round(rms, 2),
            temp = Math.Round(temp, 2),
            sensorId = sensor.SensorId
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await httpClient.PostAsync($"{apiUrl}/api/readings/ingest", content);
            var statusIcon = isSpike ? "🔴 SPIKE " : "🟢 Normal";
            Console.WriteLine($"[{sensor.AssetName}][{sensor.Counter}] {statusIcon} | RMS: {payload.rms} | Temp: {payload.temp} | HTTP: {(int)response.StatusCode}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[{sensor.AssetName}] ❌ Error: {ex.Message}");
        }
    }

    await Task.Delay(TimeSpan.FromSeconds(intervalSeconds));
}

// DTOs
class AssetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

class SensorDto
{
    public int Id { get; set; }
    public int AssetId { get; set; }
}

class SensorInfo
{
    public int AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public int SensorId { get; set; }
    public int Counter { get; set; }
}