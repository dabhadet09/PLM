using Microsoft.AspNetCore.Mvc;
using PlmApi.Models;
using PlmApi.Repositories;

namespace PlmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ThresholdsController : ControllerBase
{
    private readonly ThresholdRepository _repo;

    public ThresholdsController(ThresholdRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _repo.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var threshold = await _repo.GetByIdAsync(id);
        return threshold == null ? NotFound() : Ok(threshold);
    }

    [HttpGet("asset/{assetId}")]
    public async Task<IActionResult> GetByAssetId(int assetId)
    {
        var threshold = await _repo.GetByAssetIdAsync(assetId);
        return threshold == null ? NotFound() : Ok(threshold);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Threshold threshold)
    {
        await _repo.AddAsync(threshold);
        return CreatedAtAction(nameof(GetById), new { id = threshold.Id }, threshold);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Threshold threshold)
    {
        if (id != threshold.Id) return BadRequest();
        await _repo.UpdateAsync(threshold);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }
}