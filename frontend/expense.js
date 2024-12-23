const expenseForm = document.getElementById("expenseForm");
const expenseTableBody = document.getElementById("expenseTable").querySelector("tbody");
const token = window.localStorage.getItem("token");

function addExpenseRow(expense, index) {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${expense.amount}</td>
    <td>${expense.description}</td>
    <td>${expense.category}</td>
    <td><button class="delete-btn" data-index="${expense.id}">Delete</button></td>
  `;
    expenseTableBody.appendChild(row);
}

async function loadExpenses() {
    await axios.get(`http://localhost:3000/expense`, { headers: { Authorization: token } })
        .then((res) => {
            const expenses = res.data;
            expenseTableBody.innerHTML = "";
            if (expenses.length === 0) {
                const row = document.createElement("tr");
                row.innerHTML = `
                <td colspan="4">No expenses found</td>
              `;
                expenseTableBody.appendChild(row);
                return;
            } else {
                expenses.forEach((expense, index) => {
                    addExpenseRow(expense, index);
                });
            }
        }).catch((err) => {
            console.log(err);
        });

}

expenseForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    await axios.post("http://localhost:3000/expense", { amount, description, category }, { headers: { Authorization: token } })
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

        await axios.delete(`http://localhost:3000/expense/${index}`, { headers: { Authorization: token } })
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
    await axios.post("http://localhost:3000/premium", {}, { headers: { Authorization: token } })
        .then((res) => {
            console.log(res.data);
            const options = {
                key: res.data.key_id,
                amount: res.data.order.amount,
                currency: "INR",
                name: "Expense Tracker",
                description: "Upgrade to premium",
                order_id: res.data.order.id,
                handler: async function (response) {
                    console.log(response)
                    await axios.put("http://localhost:3000/premium", { orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, status: "Success" }, { headers: { Authorization: token } })
                        .then((res) => {
                            window.localStorage.setItem("status", "true");
                            const premiumStatus = document.getElementById("premiumInfo");
                            const premiumSection = document.getElementById("premiumSection");
                            premiumSection.style.display = "none";
                            premiumStatus.style.display = "flex";
                            console.log(res.data);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                },
                callback_url: 'http://127.0.0.1:5500/frontend/expense.html',
            }
            const rzp1 = new Razorpay(options);

            rzp1.on('payment.failed', async function (response) {
                await axios.put("http://localhost:3000/premium", { orderId: response.error.metadata.order_id, paymentId: response.error.metadata.payment_id, status: "Failed" }, { headers: { Authorization: token } })
                    .then((res) => {
                        console.log(res.data);
                    }).catch((err) => {
                        console.log(err);
                    });
            })
            rzp1.open();
        })
        .catch((err) => {
            console.log(err);
        });
})

window.addEventListener("DOMContentLoaded", (e) => {
    e.preventDefault();
    loadExpenses();
    const premiumSection = document.getElementById("premiumSection");
    const premiumStatus = document.getElementById("premiumInfo");
    const status = window.localStorage.getItem("status");
    if (status.toString() === "false") {
        premiumSection.style.display = "flex";
    } else {
        premiumStatus.style.display = "flex";
    }
})

const showLeaderboardButton = document.getElementById("showLeaderboard");
const leaderboardModal = document.getElementById("leaderboardModal");
const closeModal = document.getElementById("closeModal");
const leaderboardTable = document.getElementById("leaderboardTable");

showLeaderboardButton.addEventListener("click", () => {
    fetchLeaderboard();
    leaderboardModal.style.display = "flex";
});

async function fetchLeaderboard() {
    await axios.get("http://localhost:3000/premium/leaderboard", { headers: { Authorization: token } })
        .then((res) => {
            renderLeaderboard(res.data);
        }).catch((err) => {
            console.log(err);
        });
}

function renderLeaderboard(data) {
    leaderboardTable.innerHTML = "";
    data.forEach((user, index) => {
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