const BasePage = require("./BasePage");

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.sidebar = ".sidebar, nav, [data-testid='sidebar']";
    this.userMenu = "[data-testid='user-menu'], .user-menu";
    this.logoutButton = "button:has-text('Logout'), [data-testid='logout']";
    this.usersLink = "a[href*='users'], [data-testid='users']";
    this.adminsLink = "a[href*='admins'], [data-testid='admins']";
    this.statsCard = ".stats-card, [data-testid='stats']";
  }

  async navigate() {
    await super.navigate("/");
  }

  async isDashboardVisible() {
    await this.waitForPageLoad();
    return await this.isVisible(this.statsCard);
  }

  async logout() {
    if (await this.isVisible(this.userMenu)) {
      await this.click(this.userMenu);
    }
    await this.waitForSelector(this.logoutButton, { timeout: 5000 });
    await this.click(this.logoutButton);
  }

  async goToUsers() {
    await this.click(this.usersLink);
  }

  async goToAdmins() {
    await this.click(this.adminsLink);
  }
}

module.exports = DashboardPage;
