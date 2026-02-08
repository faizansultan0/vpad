const BasePage = require("./BasePage");

class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    this.nameInput = 'input[name="name"], input[placeholder*="name" i]';
    this.emailInput = 'input[type="email"]';
    this.passwordInput = 'input[name="password"], input[type="password"]';
    this.confirmPasswordInput =
      'input[name="confirmPassword"], input[placeholder*="confirm" i]';
    this.registerButton = 'button[type="submit"]';
    this.errorMessage = ".text-red-500, .text-red-600, [role='alert']";
    this.loginLink = 'a[href="/login"]';
  }

  async navigate() {
    await super.navigate("/register");
  }

  async register(name, email, password, confirmPassword = null) {
    await this.fill(this.nameInput, name);
    await this.fill(this.emailInput, email);

    const passwordInputs = await this.page.$$('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].fill(password);
      await passwordInputs[1].fill(confirmPassword || password);
    } else {
      await this.fill(this.passwordInput, password);
    }

    await this.click(this.registerButton);
  }

  async getErrorMessage() {
    try {
      await this.waitForSelector(this.errorMessage, { timeout: 5000 });
      return await this.getText(this.errorMessage);
    } catch {
      return null;
    }
  }

  async isRegisterFormVisible() {
    return (
      (await this.isVisible(this.emailInput)) &&
      (await this.isVisible(this.registerButton))
    );
  }

  async goToLogin() {
    await this.click(this.loginLink);
  }
}

module.exports = RegisterPage;
