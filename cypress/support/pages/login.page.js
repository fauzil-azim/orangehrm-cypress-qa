class LoginPage {
  // Navigasi ke halaman login
  visit() {
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  }

  // Mengisi field username
  fillUsername(username) {
    if (username) {
      cy.get("input[name='username']").clear().type(username);
    }
  }

  // Mengisi field password
  fillPassword(password) {
    if (password) {
      cy.get("input[name='password']").clear().type(password);
      this.verifyPasswordMasked();
    }
  }

  // Klik tombol login
  submitLogin() {
    cy.get("button[type='submit']").click();
  }

  // Aksi login lengkap
  login(username, password) {
    this.fillUsername(username);
    this.fillPassword(password);
    this.submitLogin();
  }

  // Aksi login menggunakan tombol Enter
  loginWithEnter(username, password) {
    this.fillUsername(username);
    if (password) {
      cy.get("input[name='password']").clear().type(`${password}{enter}`);
    }
  }

  // Klik link Forgot Password
  clickForgotPassword() {
    cy.get('.orangehrm-login-forgot-header').click();
  }

  // Aksi Logout
  logout() {
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
  }

  // Assertion: Berhasil masuk ke dashboard
  verifyDashboard() {
    cy.url().should('include', '/dashboard/index');
    cy.get('.oxd-topbar-header-breadcrumb').should('contain', 'Dashboard');
  }

  // Assertion: Pesan error kredensial salah
  verifyErrorMessage(expectedText) {
    cy.get('.oxd-alert-content-text').should('be.visible').and('contain', expectedText);
  }

  // Assertion: Pesan error field wajib (Required)
  verifyFieldError(expectedText) {
    cy.get('.oxd-input-field-error-message').should('be.visible').and('contain', expectedText);
  }

  // Assertion: Jumlah pesan error pada field kosong
  verifyMultipleFieldErrors(count) {
    cy.get('.oxd-input-field-error-message').should('have.length', count);
  }

  // Assertion: Berada di halaman Reset Password
  verifyResetPasswordPage() {
    cy.url().should('include', '/auth/requestPasswordResetCode');
    cy.get('.orangehrm-forgot-password-title').should('contain', 'Reset Password');
  }

  // Assertion: Masking password (type='password')
  verifyPasswordMasked() {
    cy.get("input[name='password']").should('have.attr', 'type', 'password');
  }

  // Assertion: Kembali ke halaman login
  verifyLoginPage() {
    cy.url().should('include', '/auth/login');
    cy.get("button[type='submit']").should('be.visible');
  }
}

export default new LoginPage();