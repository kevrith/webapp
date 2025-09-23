// Section switching
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Format number with commas
function formatPrice(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Data
let tray = [];
let expenses = [];
let orders = [];
let expenseChart, reportChart;

// Load products
async function loadProducts() {
  const res = await fetch("products.json");
  const data = await res.json();
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  data.products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="product-image">
      <h3>${p.name}</h3>
      <p>Price: ${formatPrice(p.price)} KES</p>
      <button class="add-btn" onclick="addToTray('${p.id}', '${p.name}', ${p.price})">Add to Tray</button>
    `;
    list.appendChild(div);
  });
}

// Tray logic
function addToTray(id, name, price) {
  tray.push({ id, name, price });
  renderTray();
}

function renderTray() {
  const container = document.getElementById("tray-items");
  container.innerHTML = "";
  let total = 0;
  tray.forEach((item, index) => {
    total += item.price;
    container.innerHTML += `<p>${item.name} - ${formatPrice(item.price)} KES 
      <button onclick="removeTrayItem(${index})">Remove</button></p>`;
  });
  document.getElementById("tray-total").innerText = formatPrice(total);
}

function removeFromTray(index) {
  tray.splice(index, 1);
  renderTray();
}

function finalizeTray() {
  if (tray.length === 0) {
    alert("Your tray is empty!");
    return;
  }

  const orderTotal = tray.reduce((sum, item) => sum + item.price, 0);

  // Record order
  orders.push({ date: new Date().toISOString().split("T")[0], amount: orderTotal });

  // Auto expense (simulate stock cost = 70% of sales. Which gives 30% profit)
  const stockCost = Math.round(orderTotal * 0.7);
  addExpense("Stock Purchase", stockCost, new Date().toISOString().split("T")[0], "Stock");

  alert(`Purchase completed! Total: ${formatPrice(orderTotal)} KES`);

  tray = [];
  renderTray();
  updateReport();
}

// Expense Tracker
document.getElementById("expense-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("expense-name").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const date = document.getElementById("expense-date").value;
  const category = document.getElementById("expense-category").value;
  addExpense(name, amount, date, category);
  this.reset();
});

function addExpense(name, amount, date, category) {
  expenses.push({ name, amount, date, category });
  renderExpenses();
  updateChart();
  updateReport();
}

function renderExpenses() {
  const list = document.getElementById("expense-list");
  list.innerHTML = "";
  expenses.forEach(exp => {
    list.innerHTML += `<li>${exp.date} - ${exp.name}: ${formatPrice(exp.amount)} KES (${exp.category})</li>`;
  });
}

function updateChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const categories = [...new Set(expenses.map(e => e.category))];
  const totals = categories.map(cat => 
    expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  );

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: categories,
      datasets: [{
        data: totals,
        backgroundColor: ["#f44336", "#2196f3", "#4caf50", "#ff9800"]
      }]
    }
  });
}

// Profit & Loss Report
function updateReport() {
  const revenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const net = revenue - totalExpenses;

  document.getElementById("revenue").innerText = revenue;
  document.getElementById("expenses").innerText = totalExpenses;
  document.getElementById("net").innerText = net;

  const ctx = document.getElementById("reportChart").getContext("2d");
  if (reportChart) reportChart.destroy();
  reportChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Revenue", "Expenses", "Net Profit/Loss"],
      datasets: [{
        label: "KES",
        data: [revenue, totalExpenses, net],
        backgroundColor: ["#4caf50", "#f44336", "#2196f3"]
      }]
    }
  });
}

// Init
loadProducts();
