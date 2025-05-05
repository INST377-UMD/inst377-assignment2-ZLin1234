// === Stock Chart with Polygon API and Voice Commands ===

const apiKey = 'PEjF1kaVpnVi_GqFtZ5NcWXYPrtBRJq1';
const chartCtx = document.getElementById('stock-chart').getContext('2d');
let stockChart;

// Handle lookup button click

document.getElementById('lookup-button').addEventListener('click', async () => {
  const ticker = document.getElementById('ticker').value.toUpperCase();
  const days = parseInt(document.getElementById('day-range').value);

  if (!ticker || isNaN(days)) {
    alert('Please enter a valid stock ticker and number of days!');
    return;
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${formatDate(start)}/${formatDate(end)}?adjusted=true&sort=asc&limit=120&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      alert('No data found for this ticker.');
      return;
    }

    const labels = data.results.map(entry => new Date(entry.t).toLocaleDateString());
    const values = data.results.map(entry => entry.c);

    if (stockChart) stockChart.destroy();

    stockChart = new Chart(chartCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${ticker} Closing Prices`,
          data: values,
          borderColor: 'blue',
          backgroundColor: 'lightblue',
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    alert('Error fetching stock data.');
  }
});

// Reddit Trending Stocks 
fetch('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03')
  .then(res => res.json())
  .then(data => {
    const tableBody = document.querySelector('#reddit-table tbody');
    data.slice(0, 5).forEach(stock => {
      const row = document.createElement('tr');
      const icon = stock.sentiment === 'Bullish'
        ? '<img src="https://cdn-icons-png.flaticon.com/512/6978/6978349.png" alt="Bullish" width="100" height="100">'
        : '<img src="https://cdn-icons-png.flaticon.com/512/6410/6410261.png" alt="Bearish" width="100" height="100">';

      row.innerHTML = `
        <td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
        <td>${stock.no_of_comments}</td>
        <td>${icon}</td>
      `;
      tableBody.appendChild(row);
    });
  });

function startListening() {
    if (annyang) {
      const commands = {
        "hello": () => alert("Hello World!"),
  
        "change the color to *color": (color) => {
          document.body.style.backgroundColor = color;
        },
  
        "navigate to *page": (page) => {
          window.location.href = page.toLowerCase() + ".html";
        },
  
        "lookup *stock": (stock) => {
          const upperTicker = stock.toUpperCase();
          document.getElementById('ticker').value = upperTicker;
          document.getElementById('day-range').value = 30;
  
          
          document.getElementById('lookup-button').click();
        }
      };
  
      annyang.addCommands(commands);
      annyang.start();
    }
  }
  