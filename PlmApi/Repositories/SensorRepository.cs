using PlmApi.Data;
using PlmApi.Models;

namespace PlmApi.Repositories;

public class SensorRepository : Repository<Sensor>
{
    public SensorRepository(AppDbContext context) : base(context) { }
}