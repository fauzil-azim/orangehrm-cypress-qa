class DirectoryPage {
  visitDirectory() {
    cy.get('.oxd-sidepanel-body').contains('Directory').click();
  }

  fillEmployeeName(name) {
    cy.get("input[placeholder='Type for hints...']").clear().type(name);
    if (name) {
      cy.wait(1000);
      cy.get('.oxd-autocomplete-dropdown').then(($drop) => {
        if ($drop.find('.oxd-autocomplete-option').length > 0) {
          cy.get('.oxd-autocomplete-option').first().click();
        }
      });
    }
  }

  selectJobTitle(title) {
    cy.get('.oxd-select-wrapper').eq(0).click();
    cy.contains('.oxd-select-option', title).click();
  }

  selectLocation(location) {
    cy.get('.oxd-select-wrapper').eq(1).click();
    cy.contains('.oxd-select-option', location).click();
  }

  clickSearch() {
    cy.get("button[type='submit']").click({ force: true });
  }

  clickReset() {
    cy.get("button[type='reset']").contains('Reset').click();
  }

  verifyDirectoryPage() {
    cy.url().should('include', '/directory/viewDirectory');
    cy.get('.oxd-topbar-header-breadcrumb').should('contain', 'Directory');
  }

  verifyResultsExist() {
    cy.get('.orangehrm-directory-card').should('have.length.at.least', 1);
  }

  verifyNoRecordsFound() {
    cy.get('.oxd-toast').should('be.visible').and('contain', 'No Records Found');
  }

  verifyFormCleared() {
    cy.get("input[placeholder='Type for hints...']").should('have.value', '');
  }

  verifyAutocompleteDropdown() {
    cy.get('.oxd-autocomplete-dropdown').should('be.visible');
  }
}

export default new DirectoryPage();