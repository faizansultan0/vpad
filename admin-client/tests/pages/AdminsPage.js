const BasePage = require("./BasePage");

class AdminsPage extends BasePage {
  constructor(page) {
    super(page);
    this.adminList = "[data-testid='admin-list'], .admin-list";
    this.adminCard = "[data-testid='admin-card'], .admin-card";
    this.inviteButton =
      "button:has-text('Invite Admin'), [data-testid='invite-admin']";
    this.promoteButton =
      "button:has-text('Promote'), [data-testid='promote-user']";
    this.emailInput = 'input[type="email"]';
    this.permissionCheckbox = 'input[type="checkbox"]';
    this.submitButton = "button[type='submit'], button:has-text('Send')";
    this.modal = "[role='dialog'], .modal, .MuiDialog-root";
  }

  async navigate() {
    await super.navigate("/admins");
  }

  async getAdminCount() {
    await this.waitForPageLoad();
    const admins = await this.page.$$(".admin-card, [data-testid='admin-card']");
    return admins.length;
  }

  async openInviteModal() {
    await this.click(this.inviteButton);
    await this.waitForSelector(this.modal, { timeout: 5000 });
  }

  async inviteAdmin(email, permissions = []) {
    await this.openInviteModal();
    await this.fill(this.emailInput, email);

    for (const perm of permissions) {
      const checkbox = this.page.locator(
        `input[type="checkbox"]:near(:text("${perm}"))`
      );
      if ((await checkbox.count()) > 0) {
        await checkbox.first().check();
      }
    }

    await this.click(this.submitButton);
  }

  async isModalVisible() {
    return await this.isVisible(this.modal);
  }
}

module.exports = AdminsPage;
