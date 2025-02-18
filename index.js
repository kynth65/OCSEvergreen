document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded"); // View Management
  const views = {
    login: document.getElementById("loginView"),
    calculator: document.getElementById("calculatorView"),
    result: document.getElementById("resultView"),
  };

  // Debug check if elements are found
  console.log("Views found:", {
    login: !!views.login,
    calculator: !!views.calculator,
    result: !!views.result,
  });

  function showView(viewName) {
    console.log("Attempting to show view:", viewName);

    // First hide all views
    Object.values(views).forEach((view) => {
      if (view) {
        view.style.display = "none";
        view.classList.remove("active");
        console.log("Hidden view");
      }
    });

    // Then show the selected view
    if (views[viewName]) {
      views[viewName].style.display = "block";
      views[viewName].classList.add("active");
      console.log("Shown view:", viewName);
    } else {
      console.error("View not found:", viewName);
    }
  }

  // Login View Logic
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");

    console.log("Form submitted"); // Debug log
    console.log("Password entered:", password); // Debug log

    if (password === "OCSGREEN") {
      console.log("Password correct"); // Debug log
      localStorage.setItem("isAuthenticated", "true");
      showView("calculator");
    } else {
      console.log("Password incorrect"); // Debug log
      error.textContent = "Incorrect password. Please try again.";
      error.classList.remove("hidden");
      document.getElementById("password").value = "";
    }
  });

  // Calculator View Logic
  let formData = {
    clientName: "",
    project: "BEESCAPES",
    phoneNumber: "",
    reservationDate: "",
    blockLot: "",
    pricePerSqm: "",
    lotArea: "",
    paymentType: "SPOTCASH",
    installmentYears: "2",
    paymentMonth: "",
    paymentDay: "",
    paymentYear: "",
  };

  let calculations = {
    totalPrice: 0,
    downPayment: 0,
    monthlyPayment: 0,
    balancePayment: 0,
  };

  // Handle form input changes
  document
    .getElementById("calculatorForm")
    .querySelectorAll("input, select")
    .forEach((input) => {
      input.addEventListener("change", function (e) {
        formData[e.target.name] = e.target.value;
        calculatePrices();
      });
    });

  // Handle payment type changes
  document
    .querySelector('select[name="paymentType"]')
    .addEventListener("change", function (e) {
      const installmentYearsContainer = document.getElementById(
        "installmentYearsContainer"
      );
      if (e.target.value === "INSTALLMENT") {
        installmentYearsContainer.classList.remove("hidden");
      } else {
        installmentYearsContainer.classList.add("hidden");
      }
    });

    function calculatePrices() {
      if (formData.pricePerSqm && formData.lotArea) {
        let basePrice = parseFloat(formData.pricePerSqm) * parseFloat(formData.lotArea);
        let downPayment = 0;
        let balance = 0;
        let monthlyPayment = 0;
  
        if (formData.paymentType === "INSTALLMENT") {
          // Calculate 20% downpayment without including reservation fee
          downPayment = basePrice * 0.2;
          balance = basePrice - downPayment;
          const months = parseInt(formData.installmentYears) * 12;
          monthlyPayment = balance / months;
        }
  
        calculations = {
          totalPrice: basePrice,
          downPayment, // This is now just the downpayment without reservation fee
          monthlyPayment,
          balancePayment: balance
        };
        updateCalculationsDisplay();
      }
    }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function updateCalculationsDisplay() {
    const calculationsDiv = document.getElementById("calculations");
    const installmentDetails = document.getElementById("installmentDetails");
    const spotcashNote = document.getElementById("spotcashNote");
    const paymentTypeTitle = document.getElementById("paymentTypeTitle");

    if (calculations.totalPrice > 0) {
      calculationsDiv.classList.remove("hidden");

      document.getElementById("totalPrice").textContent = `₱ ${formatCurrency(
        calculations.totalPrice
      )}`;

      if (formData.paymentType === "INSTALLMENT") {
        paymentTypeTitle.textContent = "INSTALLMENT BREAKDOWN";
        installmentDetails.classList.remove("hidden");
        spotcashNote.classList.add("hidden");

        document.getElementById(
          "downPayment"
        ).textContent = `₱ ${formatCurrency(calculations.downPayment)}`;
        document.getElementById("balance").textContent = `₱ ${formatCurrency(
          calculations.balancePayment
        )}`;
        document.getElementById(
          "monthlyPayment"
        ).textContent = `₱ ${formatCurrency(calculations.monthlyPayment)}`;
        document.getElementById("installmentTerms").innerHTML = `Terms: ${
          formData.installmentYears
        } years (${parseInt(formData.installmentYears) * 12} months)<br>
                 Reservation fee ₱20,000.00 is deductible from down payment.`;
      } else {
        paymentTypeTitle.textContent = "SPOTCASH PAYMENT";
        installmentDetails.classList.add("hidden");
        spotcashNote.classList.remove("hidden");
      }
    } else {
      calculationsDiv.classList.add("hidden");
    }
  }

  document.getElementById("createOCS").addEventListener("click", function () {
    localStorage.setItem("formData", JSON.stringify(formData));
    localStorage.setItem("calculations", JSON.stringify(calculations));
    showView("result");
    loadResult();
  });

  // Result View Logic
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function calculateEndDate(month, year, years) {
    if (!month || !year) return "Not specified";
    const startDate = new Date(`${month} ${formData.paymentDay}, ${year}`);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + parseInt(years));
    endDate.setMonth(endDate.getMonth() - 1);
    return formatDate(endDate);
  }

  function loadResult() {
    const pdfContent = document.getElementById("pdfContent");
    pdfContent.innerHTML = `
        <div class="text-center section">
            <h1 style="color: #228B22; font-size: 24px; margin-bottom: 8px;">Evergreen Realty Philippines</h1>
            <h2 style="color: #228B22; font-size: 18px;">Official Computation Sheet (OCS)</h2>
        </div>
  
        <div class="section">
            <h3 class="section-title">Client Information</h3>
            <div class="grid">
                <div class="grid-row">
                    <div class="grid-cell label">Client Name:</div>
                    <div class="grid-cell value">${formData.clientName}</div>
                    <div class="grid-cell label">Contact Number:</div>
                    <div class="grid-cell value">${formData.phoneNumber}</div>
                </div>
                <div class="grid-row">
                    <div class="grid-cell label">Reservation Date:</div>
                    <div class="grid-cell value">${formatDate(
                      formData.reservationDate
                    )}</div>
                    <div class="grid-cell label">Block and Lot Number:</div>
                    <div class="grid-cell value">${formData.blockLot}</div>
                </div>
            </div>
        </div>
  
        <div class="section">
            <h3 class="section-title">Property Details</h3>
            <div class="grid">
                <div class="grid-row">
                    <div class="grid-cell label">Project:</div>
                    <div class="grid-cell value">${formData.project}</div>
                    <div class="grid-cell label">Lot Area:</div>
                    <div class="grid-cell value">${formData.lotArea} sq.m.</div>
                </div>
                <div class="grid-row">
                    <div class="grid-cell label">Price per sq.m.:</div>
                    <div class="grid-cell value">₱ ${formatCurrency(
                      formData.pricePerSqm
                    )}</div>
                    <div class="grid-cell label">Type:</div>
                    <div class="grid-cell value">Agricultural</div>
                </div>
            </div>
        </div>
  
        <div class="section">
            <div class="breakdown-header">BREAKDOWN OF PAYMENT</div>
            ${
              formData.paymentType === "INSTALLMENT"
                ? generateInstallmentBreakdown()
                : generateSpotcashBreakdown()
            }
        </div>`;
  }

  function generateInstallmentBreakdown() {
    return `
        <div class="grid">
             <div class="payment-grid total-price-row">
                <div>TOTAL CONTRACT PRICE</div>
                <div class="text-right">₱ ${formatCurrency(calculations.totalPrice)}</div>
            </div>
            <div class="payment-grid breakdown-section highlight-coral">
                <div>DOWNPAYMENT</div>
                <div class="text-right">₱ ${formatCurrency(calculations.downPayment)}</div>
            </div>
            <div class="payment-grid">
                <div>Reservation Fee</div>
                <div class="text-right">₱ 20,000.00</div>
            </div>
            <div class="payment-grid">
                <div>Due Date</div>
                <div class="text-right italic">${formData.paymentMonth} ${formData.paymentDay}, ${formData.paymentYear}</div>
            </div>
            
            <div class="payment-grid breakdown-section highlight-coral">
                <div>BALANCE PAYMENT</div>
                <div class="text-right">₱ ${formatCurrency(calculations.balancePayment)}</div>
            </div>
            <div class="payment-grid">
                <div class="italic">${formData.installmentYears} years</div>
                <div class="text-right">Monthly Installment</div>
            </div>
            <div class="payment-grid">
                <div class="italic">Every 30th of the month</div>
                <div class="text-right highlighted">₱ ${formatCurrency(calculations.monthlyPayment)}</div>
            </div>
            <div class="payment-grid">
                <div class="italic">${parseInt(formData.installmentYears) * 12} months</div>
                <div></div>
            </div>
            <div class="payment-grid">
                <div>Date Start</div>
            <div class="text-right italic">${formData.paymentMonth} ${formData.paymentDay}, ${formData.paymentYear}</div>
            </div>
            <div class="payment-grid">
                <div>Date End</div>
                <div class="text-right italic">${calculateEndDate(formData.paymentMonth, formData.paymentYear, formData.installmentYears)}</div>
            </div>
        </div>`;
  }

  function generateSpotcashBreakdown() {
    return `
        <div class="grid">
            <div class="payment-grid total-price-row">
                <div>TOTAL CONTRACT PRICE</div>
                <div class="text-right">₱ ${formatCurrency(calculations.totalPrice)}</div>
            </div>
            <div class="payment-grid breakdown-section highlight-coral">
                <div>SPOTCASH</div>
                <div class="text-right">₱ ${formatCurrency(calculations.totalPrice)}</div>
            </div>
            <div class="payment-grid">
                <div class="italic" style="color: #dc2626;">Shall be payable within a month, reservation fee</div>
            </div>
            <div class="payment-grid">
                <div class="italic" style="color: #dc2626;">₱ 20,000.00 is deductible.</div>
            </div>
            <div class="payment-grid">
                <div>Due Date</div>
            <div class="text-right italic">${formData.paymentMonth} ${formData.paymentDay}, ${formData.paymentYear}</div>
            </div>
            <div class="payment-grid">
                <div>Total Amount</div>
                <div class="text-right">₱ ${formatCurrency(calculations.totalPrice)}</div>
            </div>
        </div>`;
  }

  document.getElementById("downloadPDF").addEventListener("click", function () {
    const element = document.getElementById("pdfContent");
    const opt = {
      margin: 1,
      filename: `OCS-${formData.clientName.replace(/\s+/g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  });

  document
    .getElementById("backToCalculator")
    .addEventListener("click", function () {
      showView("calculator");
    });

  // Initialize the app
  function initialize() {
    console.log("Initializing app"); // Debug log
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    console.log("Is authenticated:", isAuthenticated); // Debug log
    if (!isAuthenticated) {
      showView("login");
    } else {
      showView("calculator");
    }
  }

  // Start the app
  initialize();
});
