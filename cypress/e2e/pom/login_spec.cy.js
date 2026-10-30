import loginPage from "../../support/pages/login.page";

describe('Login Feature Test Suite - POM', () => {
  let testData;

  before(() => {
    cy.fixture("loginData").then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    loginPage.visit();
  });

  it('TC-LOG-01: Login dengan kredensial valid', () => {
    loginPage.login(testData.validUser.username, testData.validUser.password);
    loginPage.verifyDashboard();
  });

  it('TC-LOG-02: Login dengan password salah', () => {
    loginPage.login(testData.invalidPasswordUser.username, testData.invalidPasswordUser.password);
    loginPage.verifyErrorMessage('Invalid credentials');
  });

  it('TC-LOG-03: Login dengan username salah', () => {
    loginPage.login(testData.invalidUsernameUser.username, testData.invalidUsernameUser.password);
    loginPage.verifyErrorMessage('Invalid credentials');
  });

  it('TC-LOG-04: Login dengan field kosong', () => {
    loginPage.submitLogin();
    loginPage.verifyMultipleFieldErrors(2);
    loginPage.verifyFieldError('Required');
  });

  it('TC-LOG-05: Login dengan username kosong', () => {
    loginPage.fillPassword(testData.validUser.password);
    loginPage.submitLogin();
    loginPage.verifyFieldError('Required');
  });

  it('TC-LOG-06: Login dengan password kosong', () => {
    loginPage.fillUsername(testData.validUser.username);
    loginPage.submitLogin();
    loginPage.verifyFieldError('Required');
  });

  it('TC-LOG-07: Fitur Forgot Password', () => {
    loginPage.clickForgotPassword();
    loginPage.verifyResetPasswordPage();
  });

  it('TC-LOG-08: Visibilitas password (Mask/Unmask)', () => {
    loginPage.fillPassword(testData.validUser.password);
    loginPage.verifyPasswordMasked();
  });

  it('TC-LOG-09: Submit login via tombol Enter', () => {
    loginPage.loginWithEnter(testData.validUser.username, testData.validUser.password);
    loginPage.verifyDashboard();
  });

  it('TC-LOG-10: Fungsi Logout', () => {
    loginPage.login(testData.validUser.username, testData.validUser.password);
    loginPage.verifyDashboard();
    loginPage.logout();
    loginPage.verifyLoginPage();
  });

  it('TC-LOG-11: Sensitivitas karakter khusus pada username', () => {
    loginPage.login(testData.specialCharUser.username, testData.specialCharUser.password);
    loginPage.verifyErrorMessage('Invalid credentials');
  });

  it('TC-LOG-12: Case sensitivity password', () => {
    loginPage.login(testData.caseSensitiveUser.username, testData.caseSensitiveUser.password);
    loginPage.verifyErrorMessage('Invalid credentials');
  });
});