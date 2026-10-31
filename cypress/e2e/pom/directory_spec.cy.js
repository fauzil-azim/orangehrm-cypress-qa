import loginPage from "../../support/pages/login.page";
import directoryPage from "../../support/pages/directory.page";

describe('Directory Feature Test Suite - POM', () => {
  let loginData, dirData;

  before(() => {
    cy.fixture('loginData').then((d) => { loginData = d; });
    cy.fixture('directoryData').then((d) => { dirData = d; });
  });

  beforeEach(() => {
    loginPage.visit();
    loginPage.login(loginData.validUser.username, loginData.validUser.password);
    directoryPage.visitDirectory();
  });

  it('TC-DIR-01: Navigate to Directory page', () => {
    // Intercept Employees API
    cy.intercept('GET', '**/api/v2/directory/employees*').as('getDirectory');
    directoryPage.verifyDirectoryPage();
    cy.wait('@getDirectory').its('response.statusCode').should('eq', 200);
  });

  it('TC-DIR-02: Search by valid employee name', () => {
    // Intercept Filter Query
    cy.intercept('GET', '**/api/v2/directory/employees?limit=*').as('filterName');
    directoryPage.fillEmployeeName(dirData.validName);
    directoryPage.clickSearch();
    cy.wait('@filterName');
    directoryPage.verifyResultsExist();
  });

  it('TC-DIR-03: Search by Job Title', () => {
    // Intercept Job Title API
    cy.intercept('GET', '**/api/v2/directory/employees*jobTitleId=*').as('filterJob');
    directoryPage.selectJobTitle(dirData.jobTitle);
    directoryPage.clickSearch();
    cy.wait('@filterJob').its('response.statusCode').should('eq', 200);
    directoryPage.verifyResultsExist();
  });

  it('TC-DIR-04: Search by Location', () => {
    // Intercept Location API
    cy.intercept('GET', '**/api/v2/directory/employees*locationId=*').as('filterLoc');
    directoryPage.selectLocation(dirData.location);
    directoryPage.clickSearch();
    cy.wait('@filterLoc');
    directoryPage.verifyResultsExist();
  });

  it('TC-DIR-05: Search non-existent employee', () => {
    // Intercept Stub Empty Result
    cy.intercept('GET', '**/api/v2/directory/employees*', { statusCode: 200, body: { data: [], meta: { total: 0 } } }).as('emptyReq');
    directoryPage.fillEmployeeName(dirData.invalidName);
    directoryPage.clickSearch();
    cy.wait('@emptyReq');
    directoryPage.verifyNoRecordsFound();
  });

  it('TC-DIR-06: Reset search form', () => {
    // Intercept Initial State API
    cy.intercept('GET', '**/api/v2/directory/employees*').as('resetState');
    directoryPage.selectJobTitle(dirData.jobTitle);
    directoryPage.clickReset();
    cy.wait('@resetState');
    directoryPage.verifyFormCleared();
  });

  it('TC-DIR-07: Test Autocomplete feature on employee search', () => {
    // Intercept Hint API
    cy.intercept('GET', '**/api/v2/directory/employees*').as('employeeHints');
    cy.get("input[placeholder='Type for hints...']").type('Peter');
    cy.wait('@employeeHints');
    directoryPage.verifyAutocompleteDropdown();
  });

  it('TC-DIR-08: Combined search by Name, Job Title, and Location', () => {
    // Intercept Combined Search
    cy.intercept('GET', '**/api/v2/directory/employees*').as('combinedReq');
    directoryPage.fillEmployeeName(dirData.validName);
    directoryPage.selectJobTitle(dirData.jobTitle);
    directoryPage.selectLocation(dirData.location);
    directoryPage.clickSearch();
    cy.wait('@combinedReq').its('response.statusCode').should('eq', 200);
  });
});