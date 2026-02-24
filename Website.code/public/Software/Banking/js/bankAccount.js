// AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
class bankAccount {
  constructor(accountNumber, accountHolder, balance = 0) {
    this.accountNumber = accountNumber;
    this.accountHolder = accountHolder;
    this.balance = balance;
  }

  deposit(amount) {
    if (amount > 0) {
      this.balance += amount;
      console.log(`Deposited: £${amount}. New balance: £${this.balance}.`);
    } else {
      console.log("Deposit amount must be positive.");
    }
    this.displayAccountInfo();
  }

  withdraw(amount) {
    if (amount > 0 && amount <= this.balance) {
      this.balance -= amount;
      console.log(`Withdrew: £${amount}. New balance: £${this.balance}.`);
    } else if (amount > this.balance) {
      console.log("Insufficient funds for withdrawal.");
    } else {
      console.log("Withdrawal amount must be positive.");
    }
    this.displayAccountInfo();
  }

  checkBalance() {
    return this.balance;
  }

  getAccountInfo() {
    return {
      accountNumber: this.accountNumber,
      accountHolder: this.accountHolder,
      balance: this.balance,
    };
  }

  displayAccountInfo() {
    const info = this.getAccountInfo();
    document.getElementById("account-balance").textContent =
      `Balance: £${info.balance}`;
    document.getElementById("account-number").textContent =
      `Account Number: ${info.accountNumber}`;
    document.getElementById("account-holder").textContent =
      `Account Holder: ${info.accountHolder}`;
  }
}
export default bankAccount;
