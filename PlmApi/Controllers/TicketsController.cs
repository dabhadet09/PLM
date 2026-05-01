using Microsoft.AspNetCore.Mvc;
using PlmApi.Models;
using PlmApi.Repositories;

namespace PlmApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
	private readonly TicketRepository _repo;

	public TicketsController(TicketRepository repo)
	{
		_repo = repo;
	}

	[HttpGet]
	public async Task<IActionResult> GetAll() =>
		Ok(await _repo.GetAllAsync());

	[HttpGet("{id}")]
	public async Task<IActionResult> GetById(int id)
	{
		var ticket = await _repo.GetByIdAsync(id);
		return ticket == null ? NotFound() : Ok(ticket);
	}

	[HttpGet("asset/{assetId}")]
	public async Task<IActionResult> GetByAsset(int assetId) =>
		Ok(await _repo.GetTicketsByAssetAsync(assetId));

	[HttpGet("open-count/{assetId}")]
	public async Task<IActionResult> GetOpenCount(int assetId) =>
		Ok(await _repo.GetOpenTicketCountAsync(assetId));

	[HttpPost]
	public async Task<IActionResult> Create(Ticket ticket)
	{
		ticket.CreatedAt = DateTime.UtcNow;
		await _repo.AddAsync(ticket);
		return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
	}

	[HttpPut("{id}")]
	public async Task<IActionResult> Update(int id, Ticket ticket)
	{
		if (id != ticket.Id) return BadRequest();
		await _repo.UpdateAsync(ticket);
		return NoContent();
	}

	[HttpPatch("{id}/status")]
	public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
	{
		var ticket = await _repo.GetByIdAsync(id);
		if (ticket == null) return NotFound();
		ticket.Status = status;
		await _repo.UpdateAsync(ticket);
		return NoContent();
	}

	[HttpDelete("{id}")]
	public async Task<IActionResult> Delete(int id)
	{
		await _repo.DeleteAsync(id);
		return NoContent();
	}
}
