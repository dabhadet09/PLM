using PlmApi.Repositories;

namespace PlmApi.Services;

public class AggregationService
{
    private readonly ReadingRepository _readingRepo;

    public AggregationService(ReadingRepository readingRepo)
    {
        _readingRepo = readingRepo;
    }

    public async Task<IEnumerable<object>> GetDailyAverage(int assetId)
    {
        return await _readingRepo.GetDailyAverageAsync(assetId);
    }
}