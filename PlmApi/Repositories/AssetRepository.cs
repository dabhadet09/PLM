using Microsoft.EntityFrameworkCore;
using PlmApi.Data;
using PlmApi.Models;

namespace PlmApi.Repositories;

public class AssetRepository : Repository<Asset>
{
    public AssetRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Asset>> GetAssetsWithViolationsAsync()
    {
        var since = DateTime.UtcNow.AddHours(-24);
        return await _context.Assets
            .Where(a => a.Sensors.Any(s =>
                s.Readings.Any(r =>
                    r.Timestamp > since &&
                    (_context.Thresholds.Any(t =>
                        t.AssetId == a.Id &&
                        (r.Rms > t.RmsMax || r.Temp > t.TempMax))))))
            .ToListAsync();
    }
}