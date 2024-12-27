const expenseForm = document.getElementById("expenseForm");
const expenseTableBody = document.getElementById("expenseTable").querySelector("tbody");
const paginationContainer = document.getElementById("pagination");
const itemsPerPageDropdown = document.getElementById("itemsPerPage");
const token = window.localStorage.getItem("token");
const downloadReportButton = document.getElementById("downloadReport");

let currentPage = 1;

function addExpenseRow(expense) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${expense.amount}</td>
        <td>${expense.description}</td>
        <td>${expense.category}</td>
        <td><button class="delete-btn" data-id="${expense.id}">Delete</button></td>
    `;
    expenseTableBody.appendChild(row);
}

function renderPagination(totalPages, currentPage) {
    paginationContainer.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.classList.add("pagination-btn");
        if (i === currentPage) button.classList.add("active");

        button.addEventListener("click", () => {
            loadExpenses(i);
        });

        paginationContainer.appendChild(button);
    }
}

itemsPerPageDropdown.addEventListener("change", (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    loadExpenses(currentPage, itemsPerPage);
});

async function loadExpenses(page = 1, limit=5) {
    try{
        const response = await axios.get(`http://16.171.224.52:3000/expense?page=${page}&limit=${limit} `, {
            headers: { Authorization: token },
        });
        const { expenses, totalPages } = response.data;

        expenseTableBody.innerHTML = "";
        expenses.forEach(addExpenseRow);
        renderPagination(totalPages, page);
    } catch (error) {
        console.error("Failed to fetch expenses:", error);
    }
}

expenseForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    await axios.post("http://16.171.224.52:3000/expense", { amount, description, category }, { headers: { Authorization: token } })
        .then((res) => {
            console.log(res.data);
        })
        .catch((err) => {
            console.log(err);
        });
    loadExpenses();
    expenseForm.reset();
});

expenseTableBody.addEventListener("click", async function (e) {
    if (e.target.classList.contains("delete-btn")) {
        const index = e.target.getAttribute("data-index");

        await axios.delete(`http://16.171.224.52:3000/expense/${index}`, { headers: { Authorization: token } })
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) => {
                console.log(err);
            });

        loadExpenses();
    }
});

const rzpButton = document.getElementById('rzp-button1')
rzpButton.addEventListener('click', async function (e) {
    e.preventDefault();
    await axios.post("http://16.171.224.52:3000/premium", {}, { headers: { Authorization: token } })
        .then((res) => {
            const options = {
                key: res.data.key_id,
                amount: res.data.order.amount,
                currency: "INR",
                name: "Expense Tracker",
                description: "Upgrade to premium",
                order_id: res.data.order.id,
                handler: async function (response) {
                    await axios.put("http://16.171.224.52:3000/premium", { orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, status: "Success" }, { headers: { Authorization: token } })
                        .then((res) => {
                            window.localStorage.setItem("status", "true");
                            const premiumStatus = document.getElementById("premiumInfo");
                            const premiumSection = document.getElementById("premiumSection");
                            premiumSection.style.display = "none";
                            premiumStatus.style.display = "flex";
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                },
                callback_url: 'http://127.0.0.1:5500/frontend/expense.html',
            }
            const rzp1 = new Razorpay(options);
            rzp1.open();
        })
        .catch((err) => {
            console.log(err);
        });
});

window.addEventListener("DOMContentLoaded", (e) => {
    loadExpenses();
    fetchDownloadedReports();
    const premiumSection = document.getElementById("premiumSection");
    const premiumStatus = document.getElementById("premiumInfo");
    const status = window.localStorage.getItem("status");
    if (status === "false") {
        premiumSection.style.display = "flex";
    } else {
        premiumStatus.style.display = "flex";
    }
});

const showLeaderboardButton = document.getElementById("showLeaderboard");
const leaderboardModal = document.getElementById("leaderboardModal");
const closeModal = document.getElementById("closeModal");
const leaderboardTable = document.getElementById("leaderboardTable");

showLeaderboardButton.addEventListener("click", () => {
    fetchLeaderboard();
    leaderboardModal.style.display = "flex";
});

async function fetchLeaderboard() {
    await axios.get("http://16.171.224.52:3000/premium/leaderboard", { headers: { Authorization: token } })
        .then((res) => {
            renderLeaderboard(res.data);
        }).catch((err) => {
            console.log(err);
        });
}

function renderLeaderboard(data) {
    leaderboardTable.innerHTML = "";
    data.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.totalExpense}</td>
    `;
        leaderboardTable.appendChild(row);
    });
}

closeModal.addEventListener("click", () => {
    leaderboardModal.style.display = "none";
});

downloadReportButton.addEventListener("click",async () => {
    await downloadReport();
    await fetchDownloadedReports();
});

async function downloadReport() {
    await axios.get("http://16.171.224.52:3000/expense/download", { headers: { Authorization: token } })
        .then((res) => {
            const link = res.data.fileUrl;
            window.open(link, "_blank");
        }).catch((err) => {
            console.log(err);
        });
}

async function fetchDownloadedReports() {
    try {
        const response = await axios.get("http://16.171.224.52:3000/expense/downloaded", {
            headers: { Authorization: token },
        });
        const reports = response.data;
        const reportList = document.getElementById("reportList");
        reportList.innerHTML = "";

        if (reports.length === 0) {
            reportList.innerHTML = `<p style="text-align: center; color: #6c757d;">No reports downloaded yet.</p>`;
            return;
        }
        reports.forEach((report, index) => {
            const reportItem = document.createElement("div");
            reportItem.classList.add("report-item");
            reportItem.innerHTML = `
            <span>Report ${index + 1} (User ID: ${report.userId})</span>
            <a href="${report.fileUrl}" target="_blank" download>Download</a>
        `;
            reportList.appendChild(reportItem);
        });
    } catch (error) {
        console.error("Failed to fetch downloaded reports:", error);
        reportList.innerHTML = `<li>Error fetching reports.</li>`;
    }
}