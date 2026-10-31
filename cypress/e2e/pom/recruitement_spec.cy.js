import loginPage from "../../support/pages/login.page";
import recruitmentPage from "../../support/pages/recruitement.page";

describe('Recruitment Feature Test Suite - POM', () => {
  let loginData, recData;

  before(() => {
    cy.fixture('loginData').then((d) => { loginData = d; });
    cy.fixture('recruitmentData').then((d) => { recData = d; });
  });

  beforeEach(() => {
    loginPage.visit();
    loginPage.login(loginData.validUser.username, loginData.validUser.password);
    recruitmentPage.visitRecruitment();
  });

  it('TC-REC-01: Navigate to Recruitment page', () => {
    cy.intercept('GET', '**/api/v2/recruitment/candidates*').as('getCandidates');
    recruitmentPage.verifyRecruitmentPage();
    cy.wait('@getCandidates').its('response.statusCode').should('eq', 200);
  });

  it('TC-REC-02: Add new candidate with complete data', () => {
    cy.intercept('POST', '**/api/v2/recruitment/candidates').as('addCandidate');
    recruitmentPage.clickAddCandidate();
    recruitmentPage.fillCandidateForm(recData.candidate, recData.vacancy);
    recruitmentPage.saveCandidate();
    cy.wait('@addCandidate').its('response.statusCode').should('be.oneOf', [200, 201]);
    recruitmentPage.verifyCandidateAddedSuccess();
  });

  it('TC-REC-03: Add candidate without mandatory fields', () => {
    cy.intercept('GET', '**/api/v2/recruitment/vacancies*').as('getVacancies');
    recruitmentPage.clickAddCandidate();
    cy.wait('@getVacancies');
    recruitmentPage.saveCandidate();
    recruitmentPage.verifyMandatoryValidation();
  });

  it('TC-REC-04: Add candidate with invalid email format', () => {
    recruitmentPage.clickAddCandidate();
    cy.get("input[name='firstName']").type('Candidate');
    cy.get("input[name='lastName']").type('InvalidEmail');
    cy.get('.oxd-form-row').contains('Email').parent().next().find('input').type('invalidemail-format-without-atsign');
    recruitmentPage.saveCandidate();
    recruitmentPage.verifyInvalidEmailFormat();
  });

  it('TC-REC-05: Filter candidates by Job Title', () => {
    cy.intercept('GET', '**/api/v2/recruitment/candidates?*jobId=*').as('filterJob');
    recruitmentPage.selectJobTitleFilter(recData.vacancy);
    recruitmentPage.clickSearch();
    cy.wait('@filterJob').its('response.statusCode').should('eq', 200);
    recruitmentPage.verifyCandidatesTableExists();
  });

  it('TC-REC-06: Access Vacancies tab', () => {
    cy.intercept('GET', '**/api/v2/recruitment/vacancies*').as('vacanciesList');
    cy.contains('a', 'Vacancies').click();
    cy.wait('@vacanciesList').its('response.statusCode').should('eq', 200);
    recruitmentPage.verifyVacanciesTab();
  });

  it('TC-REC-07: Check candidate resume attachment', () => {
    cy.intercept('GET', '**/api/v2/recruitment/candidates/*/file*').as('downloadResume');
    recruitmentPage.verifyRecruitmentPage();
    cy.get('body').then(($body) => {
      if ($body.find('.bi-download').length > 0) {
        cy.get('.bi-download').first().click();
        cy.wait('@downloadResume');
      }
    });
  });

  it('TC-REC-08: Delete candidate record with response stubbing', () => {
    cy.intercept('DELETE', '**/api/v2/recruitment/candidates*', { statusCode: 200, body: { data: [1], message: "Successfully Deleted" } }).as('deleteReq');
    cy.get('body').then(($body) => {
      if ($body.find('.bi-trash').length > 0) {
        cy.get('.bi-trash').first().click();
        cy.get('.oxd-button--label-danger').click();
        cy.wait('@deleteReq');
      }
    });
  });
});