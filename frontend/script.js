const resultContainer = document.getElementById('result');
document.getElementById('myForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const symbol = document.getElementById('stock').value.trim().toUpperCase();
    resultContainer.textContent = 'Loading...';

    try {
        const response = await fetch(
            `http://localhost:5001/api/stocks/${encodeURIComponent(symbol)}`,
            {
                headers: {
                    Accept: 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const jsonData = await response.json();
        resultContainer.textContent = JSON.stringify(jsonData, null, 2);
    } catch (error) {
        resultContainer.textContent = `Error: ${error.message}`;
        console.error('Request failed:', error);
    }
});