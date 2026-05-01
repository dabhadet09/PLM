using Microsoft.EntityFrameworkCore;
using PlmApi.Data;
using PlmApi.Models;

namespace PlmApi.Repositories;

public class TicketRepository : Repository<Ticket>
{
    public TicketRepository(AppDbContext context) : base(context) { }

    public async Task<int> GetOpenTicketCountAsync(int assetId) =>
        await _context.Tickets
            .CountAsync(t => t.AssetId == assetId && t.Status == "Open");

    public async Task<IEnumerable<Ticket>> GetTicketsByAssetAsync(int assetId) =>
        await _context.Tickets
            .Where(t => t.AssetId == assetId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
}