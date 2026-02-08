const BasePage = require("./BasePage");

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.emailInput = 'input[type="email"]';
    this.passwordInput = 'input[type="password"]';
    this.loginButton = 'button[type="submit"]';
    this.errorMessage = ".text-red-500, .text-red-600, [role='alert']";
    this.registerLink = 'a[href="/register"]';
    this.forgotPasswordLink = 'a[href="/forgot-password"]';
  }

  async navigate() {
    await super.navigate("/login");
  }

  async login(email, password) {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  async getErrorMessage() {
    try {
      await this.waitForSelector(this.errorMessage, { timeout: 5000 });
      return await this.getText(this.errorMessage);
    } catch {
      return null;
    }
  }

  async isLoginFormVisible() {
    return (
      (await this.isVisible(this.emailInput)) &&
      (await this.isVisible(this.passwordInput))
    );
  }

  async goToRegister() {
    await this.click(this.registerLink);
  }

  async goToForgotPassword() {
    await this.click(this.forgotPasswordLink);
  }
}

module.exports = LoginPage;
