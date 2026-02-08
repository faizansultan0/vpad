const BasePage = require("./BasePage");

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.sidebar = ".sidebar, nav, [data-testid='sidebar']";
    this.userMenu = "[data-testid='user-menu'], .user-menu, .avatar";
    this.logoutButton =
      "button:has-text('Logout'), button:has-text('Sign out'), [data-testid='logout']";
    this.institutionsLink =
      "a[href*='institution'], [data-testid='institutions']";
    this.notesLink = "a[href*='notes'], [data-testid='notes']";
    this.profileLink = "a[href*='profile'], [data-testid='profile']";
  }

  async navigate() {
    await super.navigate("/dashboard");
  }

  async isDashboardVisible() {
    await this.waitForPageLoad();
    const url = this.page.url();
    return url.includes("/dashboard") || url.includes("/institutions");
  }

  async logout() {
    if (await this.isVisible(this.userMenu)) {
      await this.click(this.userMenu);
    }
    await this.waitForSelector(this.logoutButton, { timeout: 5000 });
    await this.click(this.logoutButton);
  }

  async goToInstitutions() {
    await this.click(this.institutionsLink);
  }

  async goToNotes() {
    await this.click(this.notesLink);
  }

  async goToProfile() {
    await this.click(this.profileLink);
  }

  async getCurrentUser() {
    try {
      const userElement = await this.page.$(".user-name, [data-testid='user-name']");
      if (userElement) {
        return await userElement.textContent();
      }
      return null;
    } catch {
      return null;
    }
  }
}

module.exports = DashboardPage;
