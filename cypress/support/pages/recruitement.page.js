class RecruitmentPage {
  visitRecruitment() {
    cy.get('.oxd-sidepanel-body').contains('Recruitment').click();
  }

  clickAddCandidate() {
    cy.contains('button', 'Add').click();
  }

  fillCandidateForm(candidateData, vacancy) {
    cy.get("input[name='firstName']").type(candidateData.firstName);
    cy.get("input[name='middleName']").type(candidateData.middleName);
    cy.get("input[name='lastName']").type(candidateData.lastName);

    if (vacancy) {
      cy.get('.oxd-select-wrapper').click();
      cy.contains('.oxd-select-option', vacancy).click();
    }

    cy.get('.oxd-form-row').contains('Email').parent().next().find('input').type(candidateData.email);
    cy.get('.oxd-form-row').contains('Contact Number').parent().next().find('input').type(candidateData.contact);
    cy.get("input[placeholder='Enter comma seperated words...']").type(candidateData.keywords);
  }

  saveCandidate() {
    cy.get("button[type='submit']").click();
  }

  selectJobTitleFilter(title) {
    cy.get('.oxd-select-wrapper').eq(0).click();
    cy.contains('.oxd-select-option', title).click();
  }

  clickSearch() {
    cy.get("button[type='submit']").click({ force: true });
  }

  verifyRecruitmentPage() {
    cy.url().should('include', '/recruitment/viewCandidates');
    cy.get('.oxd-topbar-header-breadcrumb').should('contain', 'Recruitment');
  }

  verifyCandidateAddedSuccess() {
    cy.get('.oxd-toast').should('be.visible').and('contain', 'Successfully Saved');
    cy.url().should('include', '/recruitment/addCandidate');
  }

  verifyMandatoryValidation() {
    cy.get('.oxd-input-field-error-message').should('be.visible').and('contain', 'Required');
  }

  verifyInvalidEmailFormat() {
    cy.get('.oxd-input-field-error-message').should('contain', 'Expected format: admin@example.com');
  }

  verifyVacanciesTab() {
    cy.url().should('include', '/recruitment/viewJobVacancy');
  }

  verifyCandidatesTableExists() {
    cy.get('.oxd-table-card').should('have.length.at.least', 1);
  }
}

export default new RecruitmentPage();