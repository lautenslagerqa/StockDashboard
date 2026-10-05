using System.Text.Json;
using StockDashboard.Api.Models;

namespace StockDashboard.Api.Services;

public class YahooFinanceService
{
    private readonly HttpClient _httpClient;

    public YahooFinanceService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<List<DailyStockData>> GetStockDataAsync(
        string symbol)
    {
        var now = DateTimeOffset.UtcNow;
        var start = now.AddDays(-5).ToUnixTimeSeconds();
        var end = now.ToUnixTimeSeconds();

        var url =
            $"https://query1.finance.yahoo.com/v8/finance/chart/" +
            $"{Uri.EscapeDataString(symbol)}" +
            $"?period1={start}" +
            $"&period2={end}" +
            $"&interval=15m" +
            $"&events=history";

        using var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"Yahoo Finance returned {response.StatusCode}");
        }

        var json = await response.Content.ReadAsStringAsync();

        Console.WriteLine("Yahoo response:");
        Console.WriteLine(json);

        var yahooData = JsonSerializer.Deserialize<YahooResponse>(
            json,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        var result = yahooData?.Chart?.Result?.FirstOrDefault();

        if (result == null)
        {
            throw new InvalidOperationException(
                $"Yahoo Finance returned no data. Response: {json}");
        }

        var quote = result.Indicators.Quote.First();

        var days = new Dictionary<string, DailyData>();

        for (int i = 0; i < result.Timestamp.Length; i++)
        {
            if (quote.Low[i] == null ||
                quote.High[i] == null)
            {
                continue;
            }

            var day = DateTimeOffset
                .FromUnixTimeSeconds(result.Timestamp[i])
                .ToString("yyyy-MM-dd");

            if (!days.ContainsKey(day))
            {
                days[day] = new DailyData();
            }

            days[day].Lows.Add(quote.Low[i]!.Value);
            days[day].Highs.Add(quote.High[i]!.Value);

            if (quote.Volume[i] != null)
            {
                days[day].Volume += quote.Volume[i]!.Value;
            }
        }

        return days.Select(x => new DailyStockData
        {
            Day = x.Key,

            LowAverage = Math.Round(
                x.Value.Lows.Average(), 4),

            HighAverage = Math.Round(
                x.Value.Highs.Average(), 4),

            Volume = x.Value.Volume

        }).ToList();
    }

    private class DailyData
    {
        public List<double> Lows { get; } = [];

        public List<double> Highs { get; } = [];

        public long Volume { get; set; }
    }

    private class YahooResponse
    {
        public Chart Chart { get; set; } = new();
    }

    private class Chart
    {
        public List<ChartResult>? Result { get; set; }
    }

    private class ChartResult
    {
        public long[] Timestamp { get; set; } = [];

        public Indicators Indicators { get; set; } = new();
    }

    private class Indicators
    {
        public List<Quote> Quote { get; set; } = [];
    }

    private class Quote
    {
        public double?[] Low { get; set; } = [];

        public double?[] High { get; set; } = [];

        public long?[] Volume { get; set; } = [];
    }
}