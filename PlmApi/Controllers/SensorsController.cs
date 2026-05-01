using Microsoft.AspNetCore.Mvc;
using PlmApi.Models;
using PlmApi.Repositories;

namespace PlmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SensorsController : ControllerBase
{
    private readonly SensorRepository _repo;

    public SensorsController(SensorRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _repo.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var sensor = await _repo.GetByIdAsync(id);
        return sensor == null ? NotFound() : Ok(sensor);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Sensor sensor)
    {
        await _repo.AddAsync(sensor);
        return CreatedAtAction(nameof(GetById), new { id = sensor.Id }, sensor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Sensor sensor)
    {
        if (id != sensor.Id) return BadRequest();
        await _repo.UpdateAsync(sensor);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }
}