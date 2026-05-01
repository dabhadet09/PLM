using PlmApi.Data;
using PlmApi.Models;
using PlmApi.Repositories;

namespace PlmApi.Services;

public class MaintenanceService
{
    private readonly ThresholdRepository _thresholdRepo;
    private readonly TicketRepository _ticketRepo;
    private readonly AppDbContext _context;

    public MaintenanceService(
        ThresholdRepository thresholdRepo,
        TicketRepository ticketRepo,
        AppDbContext context)
    {
        _thresholdRepo = thresholdRepo;
        _ticketRepo = ticketRepo;
        _context = context;
    }

    public async Task EvaluateThresholds(Reading reading)
    {
        // Get threshold for this asset
        var threshold = await _thresholdRepo.GetByAssetIdAsync(reading.Sensor.AssetId);
        if (threshold == null) return;

        // Check if breach occurred
        bool breached = reading.Rms > threshold.RmsMax || reading.Temp > threshold.TempMax;
        if (!breached) return;

        // Duplicate guard — skip if open ticket already exists
        var openCount = await _ticketRepo.GetOpenTicketCountAsync(reading.Sensor.AssetId);
        if (openCount > 0) return;

        // Wrap ticket creation in transaction
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var ticket = new Ticket
            {
                AssetId = reading.Sensor.AssetId,
                ReadingId = reading.Id,
                Type = "Threshold Breach",
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            await _ticketRepo.AddAsync(ticket);
            await tx.CommitAsync();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}