using Microsoft.AspNetCore.Mvc;
using StockDashboard.Api.Services;

namespace StockDashboard.Api.Controllers;

[ApiController]
[Route("api/stocks")]
public class StocksController : ControllerBase
{
    private readonly YahooFinanceService _stockService;
    private readonly ILogger<StocksController> _logger;

    public StocksController(
        YahooFinanceService stockService,
        ILogger<StocksController> logger)
    {
        _stockService = stockService;
        _logger = logger;
    }

    [HttpGet("{symbol}")]
    public async Task<IActionResult> GetStock(string symbol)
    {
        if (string.IsNullOrWhiteSpace(symbol))
        {
            return BadRequest(new
            {
                error = "Stock symbol is required."
            });
        }

        try
        {
            var data = await _stockService
                .GetStockDataAsync(symbol.ToUpper());

            return Ok(data);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(502, new
            {
                error = ex.Message
            });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to retrieve stock data for {Symbol}", symbol);
            return StatusCode(502, new
            {
                error = "Unable to retrieve stock data."
            });
        }
    }
}