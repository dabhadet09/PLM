using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlmApi.Data;
using PlmApi.Models;
using PlmApi.Repositories;
using PlmApi.Services;

namespace PlmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReadingsController : ControllerBase
{
    private readonly ReadingRepository _repo;
    private readonly MaintenanceService _maintenanceService;
    private readonly AppDbContext _context;

    public ReadingsController(
        ReadingRepository repo,
        MaintenanceService maintenanceService,
        AppDbContext context)
    {
        _repo = repo;
        _maintenanceService = maintenanceService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _repo.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var reading = await _repo.GetByIdAsync(id);
        return reading == null ? NotFound() : Ok(reading);
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int assetId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _repo.GetPagedReadingsAsync(assetId, from, to, page, pageSize);
        return Ok(result);
    }

    [HttpGet("daily-average/{assetId}")]
    public async Task<IActionResult> GetDailyAverage(int assetId) =>
        Ok(await _repo.GetDailyAverageAsync(assetId));

    [HttpPost]
    public async Task<IActionResult> Create(Reading reading)
    {
        reading.Timestamp = DateTime.UtcNow;
        await _repo.AddAsync(reading);

        // Load sensor with AssetId for threshold evaluation
        reading.Sensor = await _context.Sensors.FindAsync(reading.SensorId)
            ?? throw new Exception("Sensor not found");

        // Evaluate thresholds and auto-create ticket if breached
        await _maintenanceService.EvaluateThresholds(reading);

        return CreatedAtAction(nameof(GetById), new { id = reading.Id }, reading);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Reading reading)
    {
        if (id != reading.Id) return BadRequest();
        await _repo.UpdateAsync(reading);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("ingest")]
    public async Task<IActionResult> Ingest([FromBody] IoTPayload payload)
    {
        var reading = new Reading
        {
            SensorId = payload.SensorId,
            Rms = payload.Rms,
            Temp = payload.Temp,
            Timestamp = DateTime.UtcNow
        };

        await _repo.AddAsync(reading);

        // Load sensor for threshold evaluation
        reading.Sensor = await _context.Sensors.FindAsync(reading.SensorId)
            ?? throw new Exception("Sensor not found");

        await _maintenanceService.EvaluateThresholds(reading);

        return Ok(new { message = "Reading ingested", readingId = reading.Id });
    }
}