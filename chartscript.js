var myChart;

$(document).ready(function () {

    generateChart();
    
});

function updateChart(){
    myChart.destroy();
    generateChart();
};

function generateChart(){
    const ctx = document.getElementById('saleChart').getContext('2d');

    let sales = JSON.parse(localStorage.getItem('sales'));

    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const salesByMonth = Array(12).fill(0); // For sales quantity
    const valueByMonth = Array(12).fill(0); // For sales value

    function parseDate(dateStr) {
        return moment(dateStr, [
            moment.ISO_8601,
            'DD-MM-YYYY',
            'DD/MM/YYYY',
            'MMMM Do YYYY',
            'MMMM D, YYYY',
            'MMM Do YYYY',
            'MMM D, YYYY',
            'D MMMM YYYY',
            'D MMM YYYY',
            'Do MMMM YYYY',
            'dddd, D MMMM YYYY',
            'D MMMM YYYY, h:mm:ss a',
            'dddd, MMMM D YYYY',
            'ddd, D MMM YYYY',
            'LL',
            'LLL',
            'LLLL',
        ], true); // Add more formats if needed
    }

    // Aggregate data
    sales.forEach(sale => {
        const date = parseDate(sale.date);
        const month = date.isValid() ? date.month() : -1; // Get month index (0 for January, 1 for February, etc.)

        if (month >= 0) {
            salesByMonth[month] += parseInt(sale.quantity);
            valueByMonth[month] += parseInt(sale.total);
        }
    });

    myChart = new Chart(ctx, {
        type: 'line',
    data: {
        labels: months, // X-axis labels
        datasets: [
            {
                label: 'Satış Miktarı', // Label for sales quantity
                data: salesByMonth, // Data points for sales quantity
                borderWidth: 2, // Line width
                yAxisID: 'y-axis-quantity', // Use left y-axis
            },
            {
                label: 'Satış Değeri', // Label for sales value
                data: valueByMonth, // Data points for sales value
                borderWidth: 2, // Line width
                yAxisID: 'y-axis-value', // Use right y-axis
            }
        ]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Aylar'
                }
            },
            'y-axis-quantity': {
                position: 'left',
                title: {
                    display: true,
                    text: 'Satış Miktarı'
                },
                beginAtZero: true
            },
            'y-axis-value': {
                position: 'right',
                title: {
                    display: true,
                    text: 'Satış Değeri'
                },
                beginAtZero: true,
                grid: {
                    drawOnChartArea: false // Hide grid lines for the right y-axis
                }
            }
        }
    }
    });
}