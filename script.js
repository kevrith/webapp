const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const ctx = document.getElementById("expenseChart").getContext("2d");

let expenses = [];
let editingIndex = null;
let exchangeRates = {};

// Fetch exchange rates (base USD)
async function fetchRates(base = "USD") {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    const data = await res.json();
    exchangeRates = data.rates;
    console.log("Exchange rates loaded:", exchangeRates);
  } catch (err) {
    console.error("Error fetching exchange rates:", err);
  }
}

// Convert any currency to KES
function convertToKES(amount, currency) {
  if (!exchangeRates["KES"] || !exchangeRates[currency]) return amount;
  const rateToBase = exchangeRates[currency];
  const rateKES = exchangeRates["KES"];
  return (amount / rateToBase) * rateKES;
}

// Add expense
expenseForm.addEventListener("submit", e => {
  e.preventDefault();
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const currency = document.getElementById("currency").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  const amountKES = convertToKES(amount, currency);

  if (editingIndex !== null) {
    expenses[editingIndex] = { description, amount, currency, amountKES, category, date };
    editingIndex = null;
  } else {
    expenses.push({ description, amount, currency, amountKES, category, date });
  }

  renderExpenses();
  expenseForm.reset();
});

// Render expenses list
function renderExpenses() {
  expenseList.innerHTML = "";
  let total = 0;

  expenses.forEach((exp, index) => {
    total += exp.amountKES;

    const li = document.createElement("li");
    li.innerHTML = `
      ${exp.date} - ${exp.description} (${exp.category}): ${exp.amount} ${exp.currency} 
      = ${exp.amountKES.toFixed(2)} KES
      <span>
        <button class="edit-btn" onclick="editExpense(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteExpense(${index})">Delete</button>
      </span>
    `;
    expenseList.appendChild(li);
  });

  totalEl.textContent = total.toFixed(2);
  updateChart();
}

// Edit expense
window.editExpense = function(index) {
  const exp = expenses[index];
  document.getElementById("description").value = exp.description;
  document.getElementById("amount").value = exp.amount;
  document.getElementById("currency").value = exp.currency;
  document.getElementById("category").value = exp.category;
  document.getElementById("date").value = exp.date;
  editingIndex = index;
};

// Delete expense
window.deleteExpense = function(index) {
  expenses.splice(index, 1);
  renderExpenses();
};

// Chart.js
let chart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: [],
    datasets: [{ data: [], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] }]
  }
});

function updateChart() {
  const categories = {};
  expenses.forEach(exp => {
    categories[exp.category] = (categories[exp.category] || 0) + exp.amountKES;
  });

  chart.data.labels = Object.keys(categories);
  chart.data.datasets[0].data = Object.values(categories);
  chart.update();
}

// Initial load
fetchRates("USD");
