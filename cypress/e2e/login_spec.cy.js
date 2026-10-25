describe('Login Feature Test Suite', () => {
  beforeEach(() => {
    // Membuka halaman login OrangeHRM sebelum setiap test case dijalankan
    cy.visit("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login");
  });

  it('TC-LOG-01: Login dengan kredensial valid', () => {
    cy.get("input[name='username']").type('Admin');
    cy.get("input[name='password']").type('admin123');
    cy.get("button[type='submit']").click();

    // Assertion: Berhasil masuk ke Dashboard utama
    cy.url().should('include', '/dashboard/index');
  });

  it('TC-LOG-02: Login dengan password salah', () => {
    cy.get("input[name='username']").type('Admin');
    cy.get("input[name='password']").type('wrongpassword');
    cy.get("button[type='submit']").click();

    // Assertion: Muncul pesan error 'Invalid credentials'
    cy.get('.oxd-alert-content-text').should('be.visible').and('contain', 'Invalid credentials');
  });

  it('TC-LOG-03: Login dengan username salah', () => {
    cy.get("input[name='username']").type('WrongUser');
    cy.get("input[name='password']").type('admin123');
    cy.get("button[type='submit']").click();

    // Assertion: Muncul pesan error 'Invalid credentials'
    cy.get('.oxd-alert-content-text').should('be.visible').contains('Invalid credentials');
  });

  it('TC-LOG-04: Login dengan field kosong', () => {
    cy.get("button[type='submit']").click();

    // Assertion: Muncul pesan 'Required' di bawah masing-masing field
    cy.get('.oxd-input-field-error-message').should('have.length', 2); // (2 pesan error = username & password)
    cy.get('.oxd-input-field-error-message').first().should('contain', 'Required'); // pesan error username
    cy.get('.oxd-input-field-error-message').last().should('contain', 'Required'); // pesan error password
  });

  it('TC-LOG-05: Login dengan username kosong', () => {
    cy.get("input[name='password']").type('admin123');
    cy.get("button[type='submit']").click();

    // Assertion: Muncul pesan 'Required' pada field username
    cy.get("input[name='username']")
      .parents('.oxd-input-group')
      .find('.oxd-input-field-error-message')
      .should('have.text', 'Required');
  });

  it('TC-LOG-06: Login dengan password kosong', () => {
    cy.get("input[name='username']").type('Admin');
    cy.get("button[type='submit']").click();
    
    // Assertion: Muncul pesan 'Required' pada field password
    cy.get('.oxd-input-field-error-message').should('be.visible').and('contain', 'Required');
  });

  it('TC-LOG-07: Fitur Forgot Password', () => {
    cy.get('.orangehrm-login-forgot-header').click();
    
    // Assertion: Dialihkan ke halaman reset password
    cy.url().should('include', '/auth/requestPasswordResetCode');
    cy.get('.orangehrm-forgot-password-title').should('contain', 'Reset Password');
  });

  it('TC-LOG-08: Visibilitas password (Mask/Unmask)', () => {
    cy.get("input[name='password']").type('admin123');
    
    // Assertion: Standar OrangeHRM field password terenkripsi/tertutup titik hitam
    cy.get("input[name='password']").should('have.attr', 'type', 'password');
  });

  it('TC-LOG-09: Submit login via tombol Enter', () => {
    cy.get("input[name='username']").type('Admin');
    cy.get("input[name='password']").type('admin123{enter}');
    
    // Assertion: Sistem memproses login dan masuk ke dashboard via shortcut Enter
    cy.url().should('include', '/dashboard/index');
  });

  it('TC-LOG-10: Fungsi Logout', () => {
    // Login terlebih dahulu untuk mencapai Dashboard
    cy.get("input[name='username']").type('Admin');
    cy.get("input[name='password']").type('admin123');
    cy.get("button[type='submit']").click();
    cy.url().should('include', '/dashboard/index');

    // Proses Logout
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();

    // Assertion: Pengguna keluar dan kembali ke halaman login
    cy.url().should('include', '/auth/login');
    cy.get("button[type='submit']").should('be.visible');
  });

  it('TC-LOG-11: Sensitivitas karakter khusus pada username', () => {
    cy.get("input[name='username']").type('Admin@#');
    cy.get("input[name='password']").type('admin123');
    cy.get("button[type='submit']").click();
    
    // Assertion: Muncul pesan error 'Invalid credentials'
    cy.get('.oxd-alert-content-text').should('be.visible').and('contain', 'Invalid credentials');
  });

  it('TC-LOG-12: Case sensitivity password', () => {
    cy.get("input[name='username']").type('Admin');
    cy.get("input[name='password']").type('ADMIN123');
    cy.get("button[type='submit']").click();
    
    // Assertion: Muncul pesan error 'Invalid credentials' karena password case-sensitive
    cy.get('.oxd-alert-content-text').should('be.visible').and('contain', 'Invalid credentials');
  });
})