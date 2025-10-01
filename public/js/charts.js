// charts.js
document.addEventListener("DOMContentLoaded", () => {
    const calorieChart = document.getElementById("calorieChart");
    const macroChart = document.getElementById("macroChart");
    const hydratation = document.getElementById("hydratation");

    hydratation.height = 400;

    new Chart(calorieChart, {
        type: "line",
        data: {
            labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
            datasets: [
                {
                    label: "Calories",
                    data: [1700, 1850, 1780, 1900, 1700, 2100, 1900],
                    fill: true,
                    borderColor: "#16a34a",
                    backgroundColor: "rgba(22, 163, 74, 0.1)",
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 550 },
                    grid: { color: "#e5e7eb" },
                },
                x: { grid: { display: false } },
            },
        },
    });

    new Chart(macroChart, {
        type: "line",
        data: {
            labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
            datasets: [
                {
                    label: "Glucides",
                    data: [180, 190, 185, 200, 175, 240, 200],
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                },
                {
                    label: "Lipides",
                    data: [60, 65, 62, 68, 60, 75, 70],
                    borderColor: "#f97316",
                    backgroundColor: "rgba(249, 115, 22, 0.1)",
                    tension: 0.4,
                },
                {
                    label: "Protéines",
                    data: [70, 75, 72, 78, 70, 85, 80],
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "#e5e7eb" },
                },
                x: {
                    grid: { display: false },
                },
            },
        },
    });

    new Chart(hydratation, {
        type: "bar",
        data: {
            labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
            datasets: [{
                data: [1.5, 0.7, 2, 1.2, 1, 1.7, 1.4],
                backgroundColor: '#0EA5E9',
            },]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 0.3 },
                    grid: { color: "#e5e7eb" },
                },
                x: {
                    grid: { display: true },
                },
            },
        },
    });
});

