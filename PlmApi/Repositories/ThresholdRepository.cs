using Microsoft.EntityFrameworkCore;
using PlmApi.Data;
using PlmApi.Models;

namespace PlmApi.Repositories;

public class ThresholdRepository : Repository<Threshold>
{
    public ThresholdRepository(AppDbContext context) : base(context) { }

    public async Task<Threshold?> GetByAssetIdAsync(int assetId) =>
        await _context.Thresholds.FirstOrDefaultAsync(t => t.AssetId == assetId);
}