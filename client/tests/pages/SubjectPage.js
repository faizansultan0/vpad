const BasePage = require("./BasePage");

class SubjectPage extends BasePage {
  constructor(page) {
    super(page);
    this.subjectList = "[data-testid='subject-list'], .subject-list, .subjects";
    this.subjectCard = "[data-testid='subject-card'], .subject-card";
    this.addSubjectButton =
      "button:has-text('Add Subject'), button:has-text('New Subject'), [data-testid='add-subject']";
    this.subjectNameInput =
      "input[name='name'], input[placeholder*='subject' i]";
    this.saveButton = "button[type='submit'], button:has-text('Save')";
    this.loader = ".loader, .loading, [data-testid='loader'], .animate-spin";
    this.emptyState =
      ":has-text('No subjects'), :has-text('No notes'), [data-testid='empty-state']";
  }

  async navigate(semesterId) {
    if (semesterId) {
      await super.navigate(`/semesters/${semesterId}/subjects`);
    }
  }

  async waitForSubjectsLoad() {
    await this.page.waitForLoadState("networkidle");
    // Wait for loader to disappear if present
    try {
      await this.page.waitForSelector(this.loader, {
        state: "hidden",
        timeout: 10000,
      });
    } catch {
      // Loader might not be present
    }
  }

  async getSubjectCount() {
    await this.waitForSubjectsLoad();
    const subjects = await this.page.$$(this.subjectCard);
    return subjects.length;
  }

  async isEmptyStateVisible() {
    try {
      return await this.isVisible(this.emptyState);
    } catch {
      return false;
    }
  }

  async addSubject(name) {
    await this.click(this.addSubjectButton);
    await this.fill(this.subjectNameInput, name);
    await this.click(this.saveButton);
  }

  async clickSubject(index = 0) {
    const subjects = await this.page.$$(this.subjectCard);
    if (subjects[index]) {
      await subjects[index].click();
    }
  }

  async getSubjectNames() {
    await this.waitForSubjectsLoad();
    const subjects = await this.page.$$(this.subjectCard);
    const names = [];
    for (const subject of subjects) {
      const name = await subject.textContent();
      names.push(name.trim());
    }
    return names;
  }
}

module.exports = SubjectPage;
