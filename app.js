var medicines = [
	{name: "Paracetamol", stock: 120, expiry: "12-2026"},
	{name: "Ibuprofen", stock: 85, expiry: "06-2026"},
	{name: "Amoxicillin", stock: 42, expiry: "03-2027"},
	{name: "Crocin", stock: 30, expiry: "09-2026"},
	{name: "Azithromycin", stock: 15, expiry: "01-2027"},
	{name: "Metformin", stock: 200, expiry: "11-2026"},
	{name: "Cetirizine", stock: 60, expiry: "07-2027"},
	{name: "Pantoprazole", stock: 48, expiry: "04-2026"}
];

var requestCount = 0;

document.getElementById("year").textContent = new Date().getFullYear();
renderTable(medicines);
loadDropdown();
updateStats();

document.getElementById("search-input").addEventListener("input", function () {
	var q = this.value.toLowerCase();
	var filtered = medicines.filter(function (m) {
		return m.name.toLowerCase().includes(q);
	});

	renderTable(filtered);
});

document.getElementById("submit-btn").addEventListener("click", handleSubmit);
document.getElementById("reset-btn").addEventListener("click", resetForm);

function renderTable(data) {
	var tbody = document.getElementById("inv-body");
	var noResults = document.getElementById("no-results");

	tbody.innerHTML = "";

	if (data.length === 0) {
		noResults.style.display = "block";
		return;
	}

	noResults.style.display = "none";

	for (var i = 0; i < data.length; i++) {
		var med = data[i];
		var tr = document.createElement("tr");

		if (med.stock < 50) {
			tr.classList.add("low-stock");
		}

		tr.innerHTML =
			"<td>" + (i + 1) + "</td>" +
			"<td>" + med.name + "</td>" +
			"<td>" + med.stock + "</td>" +
			"<td>" + med.expiry + "</td>" +
			"<td><button class='btn-small' onclick='prefill(\"" + med.name + "\")'>Request</button></td>";

		tbody.appendChild(tr);
	}
}

function loadDropdown() {
	var select = document.getElementById("medselect");
	var currentValue = select.value;

	select.innerHTML = '<option value="">-- Select Medicine --</option>';

	for (var i = 0; i < medicines.length; i++) {
		var opt = document.createElement("option");
		opt.value = medicines[i].name;
		opt.textContent = medicines[i].name;
		select.appendChild(opt);
	}

	if (currentValue) {
		select.value = currentValue;
	}
}

function updateStats() {
	var low = 0;
	var total = 0;

	for (var i = 0; i < medicines.length; i++) {
		total += medicines[i].stock;
		if (medicines[i].stock < 50) {
			low++;
		}
	}

	document.getElementById("stock-total").textContent = medicines.length;
	document.getElementById("stock-low").textContent = low;
	document.getElementById("stock-units").textContent = total;
	document.getElementById("stock-requests").textContent = requestCount;
}

function prefill(name) {
	document.getElementById("medselect").value = name;
	document.getElementById("request-form").scrollIntoView({behavior: "smooth"});
}

function handleSubmit() {
	var emp = document.getElementById("empname");
	var med = document.getElementById("medselect");
	var qty = document.getElementById("quantity");
	var reason = document.getElementById("reason");
	var qtyValue = parseInt(qty.value, 10);
	var selectedMed = findMedicine(med.value);
	var valid = true;

	clearErrors();

	if (emp.value.trim() === "") {
		emp.classList.add("error");
		document.getElementById("erremp").classList.add("show");
		valid = false;
	}

	if (med.value === "") {
		med.classList.add("error");
		document.getElementById("errmed").classList.add("show");
		valid = false;
	}

	if (qty.value === "" || qtyValue <= 0 || Number.isNaN(qtyValue)) {
		qty.classList.add("error");
		document.getElementById("errqty").textContent = "Quantity must be greater than 0.";
		document.getElementById("errqty").classList.add("show");
		valid = false;
	} else if (selectedMed && qtyValue > selectedMed.stock) {
		qty.classList.add("error");
		document.getElementById("errqty").textContent = "Quantity cannot be more than available stock.";
		document.getElementById("errqty").classList.add("show");
		valid = false;
	}

	if (!valid) {
		return;
	}

	selectedMed.stock -= qtyValue;
	requestCount++;

	addLogRow(emp.value.trim(), med.value, qtyValue, reason.value.trim());
	renderTable(medicines);
	loadDropdown();
	updateStats();
	showToast("Request submitted successfully!");
	resetForm();

	document.getElementById("log").scrollIntoView({behavior: "smooth"});
}

function addLogRow(emp, med, qty, reason) {
	var tbody = document.getElementById("log-body");
	document.getElementById("empty-log").style.display = "none";

	var now = new Date();
	var date = now.toLocaleDateString() + " " + now.toLocaleTimeString();
	var tr = document.createElement("tr");

	tr.innerHTML =
		"<td>" + requestCount + "</td>" +
		"<td>" + emp + "</td>" +
		"<td>" + med + "</td>" +
		"<td>" + qty + "</td>" +
		"<td>" + (reason || "-") + "</td>" +
		"<td>" + date + "</td>";

	tbody.insertBefore(tr, tbody.firstChild);
}

function resetForm() {
	document.getElementById("empname").value = "";
	document.getElementById("medselect").value = "";
	document.getElementById("quantity").value = "";
	document.getElementById("reason").value = "";
	clearErrors();
}

function clearErrors() {
	document.getElementById("empname").classList.remove("error");
	document.getElementById("medselect").classList.remove("error");
	document.getElementById("quantity").classList.remove("error");
	document.getElementById("erremp").classList.remove("show");
	document.getElementById("errmed").classList.remove("show");
	document.getElementById("errqty").classList.remove("show");
	document.getElementById("errqty").textContent = "Quantity must be greater than 0.";
}

function findMedicine(name) {
	for (var i = 0; i < medicines.length; i++) {
		if (medicines[i].name === name) {
			return medicines[i];
		}
	}

	return null;
}

function showToast(msg) {
	var toast = document.getElementById("toast");
	toast.textContent = msg;
	toast.classList.add("show");

	setTimeout(function () {
		toast.classList.remove("show");
	}, 3000);
}
