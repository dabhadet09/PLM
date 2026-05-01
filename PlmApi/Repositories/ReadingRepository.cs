using Microsoft.EntityFrameworkCore;
using PlmApi.Data;
using PlmApi.Models;

namespace PlmApi.Repositories;

public class ReadingRepository : Repository<Reading>
{
    public ReadingRepository(AppDbContext context) : base(context) { }

    public async Task<PagedResult<Reading>> GetPagedReadingsAsync(
        int assetId, DateTime from, DateTime to, int page, int pageSize)
    {
        var query = _context.Readings
            .Include(r => r.Sensor)
            .Where(r => r.Sensor.AssetId == assetId &&
                        r.Timestamp >= from &&
                        r.Timestamp <= to)
            .OrderByDescending(r => r.Timestamp);

        var totalCount = await query.CountAsync();
        var data = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Reading>
        {
            Data = data,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IEnumerable<object>> GetDailyAverageAsync(int assetId)
    {
        return await _context.Readings
            .Include(r => r.Sensor)
            .Where(r => r.Sensor.AssetId == assetId)
            .GroupBy(r => r.Timestamp.Date)
            .Select(g => new
            {
                Date = g.Key,
                AvgRms = g.Average(r => r.Rms)
            })
            .OrderBy(x => x.Date)
            .ToListAsync<object>();
    }
}