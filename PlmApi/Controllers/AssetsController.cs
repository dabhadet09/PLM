using Microsoft.AspNetCore.Mvc;
using PlmApi.Models;
using PlmApi.Repositories;

namespace PlmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssetsController : ControllerBase
{
    private readonly AssetRepository _repo;

    public AssetsController(AssetRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _repo.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var asset = await _repo.GetByIdAsync(id);
        return asset == null ? NotFound() : Ok(asset);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Asset asset)
    {
        await _repo.AddAsync(asset);
        return CreatedAtAction(nameof(GetById), new { id = asset.Id }, asset);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Asset asset)
    {
        if (id != asset.Id) return BadRequest();
        await _repo.UpdateAsync(asset);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("violations")]
    public async Task<IActionResult> GetViolations() =>
        Ok(await _repo.GetAssetsWithViolationsAsync());
}