// AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
import bankAccount from "./bankAccount.js";

// Create instances of bankAccount for testing
const accounts = [
  new bankAccount("123456789", "John Doe", 1000),
  new bankAccount("987654321", "Jane Smith", 500),
  new bankAccount("555555555", "Empty Account", 0),
  new bankAccount("444444444", "Negative Balance", -500),
  new bankAccount("333333333", "Richie Rich", 1000000),
];

// Populate the select element
const accountSelect = document.getElementById("account-select");

accounts.forEach((account) => {
  const option = document.createElement("option");
  option.value = account.accountNumber;
  option.textContent = account.accountHolder;
  accountSelect.appendChild(option);
});

// Track selected account
let selectedAccount = accounts[0];
accountSelect.addEventListener("change", (e) => {
  const found = accounts.find((acc) => acc.accountNumber == e.target.value);
  if (found) {
    selectedAccount = found;
    selectedAccount.displayAccountInfo();
  } else {
    // Handle the case where no account is found
    selectedAccount = null;
    console.warn("No account found for value:", e.target.value);
  }
  console.log("Selected value:", e.target.value);
  console.log("Accounts:", accounts);
  // You can now use selectedAccount for future actions
});

// Button event listeners
document.getElementById("deposit-button").addEventListener("click", () => {
  const amount = parseFloat(prompt("Enter deposit amount:"));
  if (selectedAccount) {
    selectedAccount.deposit(amount);
  } else {
    console.log("No account selected for deposit.");
  }
});

document.getElementById("withdraw-button").addEventListener("click", () => {
  const amount = parseFloat(prompt("Enter withdrawal amount:"));
  if (selectedAccount) {
    selectedAccount.withdraw(amount);
  } else {
    console.log("No account selected for withdrawal.");
  }
});

document
  .getElementById("check-balance-button")
  .addEventListener("click", () => {
    if (selectedAccount) {
      alert(`Current balance: £${selectedAccount.checkBalance()}`);
    } else {
      console.log("No account selected to check balance.");
    }
  });

// Transaction log functionality
const transactionLog = document.getElementById("transactions-list");

function logTransaction(message) {
  const logEntry = document.createElement("li");
  logEntry.textContent = message;
  transactionLog.appendChild(logEntry);
}

// Override deposit and withdraw methods to include logging
const originalDeposit = bankAccount.prototype.deposit;
bankAccount.prototype.deposit = function (amount) {
  originalDeposit.call(this, amount);
  logTransaction(
    `Deposited £${amount} to account ${this.accountNumber}. New balance: £${this.balance}.`,
  );
};

const originalWithdraw = bankAccount.prototype.withdraw;
bankAccount.prototype.withdraw = function (amount) {
  originalWithdraw.call(this, amount);
  logTransaction(
    `Withdrew £${amount} from account ${this.accountNumber}. New balance: £${this.balance}.`,
  );
};

// Initial display
selectedAccount.displayAccountInfo();
