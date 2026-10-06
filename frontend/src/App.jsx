import { useState } from 'react';

function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
}

function formatDay(day) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${day}T00:00:00Z`));
}

function App() {
  const [symbol, setSymbol] = useState('');
  const [searchedSymbol, setSearchedSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');
    setStockData(null);
    setSearchedSymbol(normalizedSymbol);

    try {
      const response = await fetch(`/api/stocks/${encodeURIComponent(normalizedSymbol)}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        let message = `The server returned status ${response.status}.`;
        try {
          const body = await response.json();
          if (typeof body.error === 'string') {
            message = body.error;
          }
        } catch {
          // Use the status message when the response body is not JSON.
        }
        throw new Error(message);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('The server returned an unexpected response.');
      }

      setStockData(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load stock data.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Market Watch home">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>Market Watch</span>
        </a>
        <span className="topbar-note">Your market, at a glance</span>
      </header>

      <section className="dashboard" aria-labelledby="page-title">
        <div className="intro">
          <p className="eyebrow">MARKET OVERVIEW</p>
          <h1 id="page-title">Stock dashboard</h1>
          <p className="intro-copy">
            Look up recent trading activity and daily price averages for a stock.
          </p>
        </div>

        <form className="search-card" onSubmit={handleSubmit}>
          <label htmlFor="stock-symbol">Stock symbol</label>
          <div className="search-row">
            <input
              id="stock-symbol"
              name="stock"
              type="text"
              autoComplete="off"
              placeholder="Try AAPL"
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              required
            />
            <button type="submit" disabled={isLoading || !symbol.trim()}>
              {isLoading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Loading
                </>
              ) : (
                'Search stocks'
              )}
            </button>
          </div>
          <p className="field-hint">Enter a ticker symbol, such as AAPL or MSFT.</p>
        </form>

        {error && (
          <div className="message error-message" role="alert">
            <span className="message-icon" aria-hidden="true">!</span>
            <div>
              <strong>Couldn’t load {searchedSymbol}</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {stockData && (
          <section className="results-card" aria-live="polite" aria-labelledby="results-title">
            <div className="results-heading">
              <div>
                <p className="eyebrow">RECENT ACTIVITY</p>
                <h2 id="results-title">{searchedSymbol} daily averages</h2>
              </div>
              <span className="result-count">
                {stockData.length} {stockData.length === 1 ? 'day' : 'days'}
              </span>
            </div>

            {stockData.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Trading day</th>
                      <th scope="col">Average low</th>
                      <th scope="col">Average high</th>
                      <th scope="col">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((record) => (
                      <tr key={record.day}>
                        <td className="date-cell">{formatDay(record.day)}</td>
                        <td>${formatNumber(record.lowAverage, 4)}</td>
                        <td>${formatNumber(record.highAverage, 4)}</td>
                        <td>{formatNumber(record.volume, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-results">No recent trading data was returned for this symbol.</p>
            )}
          </section>
        )}

        {!stockData && !error && !isLoading && (
          <div className="empty-state">
            <span className="chart-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M7 37.5h34M10 31l9-9 7 6 12-14" />
                <path d="M30 14h8v8" />
              </svg>
            </span>
            <h2>Start with a stock symbol</h2>
            <p>Search above to see recent daily averages and trading volume.</p>
          </div>
        )}
      </section>
      <footer className="footer">Market data is provided by the Stock Dashboard API.</footer>
    </main>
  );
}

export default App;
