document.addEventListener("DOMContentLoaded", async () => {
    const monthlyTableContainer = document.getElementById("monthly-table-container");
    const monthlyTitle = document.getElementById("monthly-title");
    const monthlyTableBody = document.querySelector("#monthly-table tbody");
    const monthlyMessage = document.getElementById("monthly-message");

    const yearlyTableContainer = document.getElementById("yearly-table-container");
    const yearlyTitle = document.getElementById("yearly-title");
    const yearlyTableBody = document.querySelector("#yearly-table tbody");
    const yearlyMessage = document.getElementById("yearly-message");

    try {
        const response = await axios.get('');
        const data = response.data;

        if (data.monthly && data.monthly.length > 0) {
            displayMonthlyReport(data.monthly, "Monthly Report");
        } else {
            monthlyMessage.style.display = "block";
        }

        if (data.yearly && data.yearly.length > 0) {
            displayYearlyReport(data.yearly, "Yearly Report");
        } else {
            yearlyMessage.style.display = "block";
        }
    } catch (err) {
        console.error(err);
        alert("Failed to fetch the report. Please try again later.");
    }

    function displayMonthlyReport(data, title) {
        monthlyTitle.innerText = title;
        monthlyTableBody.innerHTML = "";
        monthlyTableContainer.style.display = "block";
        monthlyMessage.style.display = "none";

        data.forEach((expense) => {
            const row = document.createElement("tr");
            row.innerHTML = `
          <td>${expense.date}</td>
          <td>${expense.description}</td>
          <td>${expense.category}</td>
          <td>${expense.amount}</td>
        `;
            monthlyTableBody.appendChild(row);
        });
    }

    function displayYearlyReport(data, title) {
        yearlyTitle.innerText = title;
        yearlyTableBody.innerHTML = "";
        yearlyTableContainer.style.display = "block";
        yearlyMessage.style.display = "none";

        data.forEach((month) => {
            const row = document.createElement("tr");
            row.innerHTML = `
          <td>${month.month}</td>
          <td>${month.totalExpense}</td>
        `;
            yearlyTableBody.appendChild(row);
        });
    }
});  