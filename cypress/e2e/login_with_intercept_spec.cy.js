describe('Login Feature Test Suite With Intercept', () => {
  beforeEach(() => {
    // Membuka halaman login OrangeHRM sebelum setiap test case dijalankan
    cy.visit("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login");
  });

  it('TC-LOG-01: Login dengan kredensial valid', () => {
    // Intercept: request submit login & request data dashboard setelah login
    cy.intercept('POST', '**/auth/validate').as('loginValid');
    cy.intercept('GET', '**/api/v2/dashboard/employees/action-summary').as('dashboardActionSummary');

    cy.get("input[name='username']").type('Admin');
    cy.get("input[name='password']").type('admin123');
    cy.get("button[type='submit']").click();

    // Validasi intercept: login diproses dan diarahkan ke dashboard
    cy.wait('@loginValid').then(({ request, response }) => {
      expect(request.body).to.include('username=Admin');
      expect(request.body).to.include('password=admin123');
      expect(response.statusCode).to.eq(302);
      expect(response.headers.location).to.include('/dashboard/index');
    });
    // Validasi intercept: data dashboard berhasil dimuat
    cy.wait('@dashboardActionSummary').its('response.statusCode').should('eq', 200);

    // Assertion: Berhasil masuk ke Dashboard utama
    cy.url().should('include', '/dashboard/index');
  });

  it('TC-LOG-02: Login dengan password salah', () => {
    // Intercept: request submit login
    cy.intercept('POST', '**/auth/validate').as('loginWrongPassword');

    cy.get("input[name='username']").type('Admin');
    cy.get("input[name='password']").type('wrongpassword');
    cy.get("button[type='submit']").click();

    // Validasi intercept: password salah terkirim, server mengembalikan user ke halaman login
    cy.wait('@loginWrongPassword').then(({ request, response }) => {
      expect(request.body).to.include('password=wrongpassword');
      expect(response.statusCode).to.eq(302);
      expect(response.headers.location).to.match(/\/auth\/login$/);
      expect(response.headers.location).to.not.include('dashboard');
    });

    // Assertion: Muncul pesan error 'Invalid credentials'
    cy.get('.oxd-alert-content-text').should('be.visible').and('contain', 'Invalid credentials');
  });

  it('TC-LOG-03: Login dengan username salah', () => {
    // Intercept: halaman login yang dimuat ulang setelah login gagal (redirect target)
    cy.intercept('GET', /\/auth\/login(\?.*)?$/).as('loginPageReload');

    cy.get("input[name='username']").type('WrongUser');
    cy.get("input[name='password']").type('admin123');
    cy.get("button[type='submit']").click();

    // Validasi intercept: halaman login dimuat kembali dengan sukses sebagai HTML
    cy.wait('@loginPageReload').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.headers['content-type']).to.include('text/html');
    });

    // Assertion: Muncul pesan error 'Invalid credentials'
    cy.get('.oxd-alert-content-text').should('be.visible').contains('Invalid credentials');
  });

  it('TC-LOG-04: Login dengan field kosong', () => {
    // Intercept: request submit login (seharusnya tidak pernah terkirim)
    cy.intercept('POST', '**/auth/validate').as('loginSubmitEmpty');

    cy.get("button[type='submit']").click();

    // Assertion: Muncul pesan 'Required' di bawah masing-masing field
    cy.get('.oxd-input-field-error-message').should('have.length', 2); // (2 pesan error = username & password)
    cy.get('.oxd-input-field-error-message').first().should('contain', 'Required'); // pesan error username
    cy.get('.oxd-input-field-error-message').last().should('contain', 'Required'); // pesan error password

    // Validasi intercept: validasi client-side mencegah form dikirim ke server
    cy.get('@loginSubmitEmpty.all').should('have.length', 0);
  });

  it('TC-LOG-05: Login dengan username kosong', () => {
    // Intercept: seluruh request POST (password tidak boleh terkirim ke endpoint mana pun)
    cy.intercept({ method: 'POST', url: '**' }).as('anyPostRequest');

    cy.get("input[name='password']").type('admin123');
    cy.get("button[type='submit']").click();

    // Assertion: Muncul pesan 'Required' pada field username
    cy.get("input[name='username']")
      .parents('.oxd-input-group')
      .find('.oxd-input-field-error-message')
      .should('have.text', 'Required');

    // Validasi intercept: tidak ada request POST sama sekali
    cy.get('@anyPostRequest.all').should('have.length', 0);
  });

  it('TC-LOG-06: Login dengan password kosong', () => {
    // Intercept: navigasi ke dashboard (seharusnya tidak terjadi)
    cy.intercept('GET', '**/dashboard/**').as('dashboardNavigation');

    cy.get("input[name='username']").type('Admin');
    cy.get("button[type='submit']").click();

    // Assertion: Muncul pesan 'Required' pada field password
    cy.get('.oxd-input-field-error-message').should('be.visible').and('contain', 'Required');

    // Validasi intercept: user tetap di halaman login dan tidak ada akses ke dashboard
    cy.get('@dashboardNavigation.all').should('have.length', 0);
    cy.url().should('include', '/auth/login');
  });

  it('TC-LOG-07: Fitur Forgot Password', () => {
    // Intercept: halaman reset password
    cy.intercept('GET', '**/auth/requestPasswordResetCode').as('forgotPasswordPage');

    cy.get('.orangehrm-login-forgot-header').click();

    // Validasi intercept: halaman reset password dimuat sebagai HTML dengan status 200
    cy.wait('@forgotPasswordPage').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.headers['content-type']).to.include('text/html');
    });

    // Assertion: Dialihkan ke halaman reset password
    cy.url().should('include', '/auth/requestPasswordResetCode');
    cy.get('.orangehrm-forgot-password-title').should('contain', 'Reset Password');
  });

  it('TC-LOG-09: Submit login via tombol Enter', () => {
    // Intercept: request submit login & halaman dashboard hasil redirect
    cy.intercept('POST', '**/auth/validate').as('loginViaEnter');
    cy.intercept('GET', '**/dashboard/index').as('dashboardPage');

    cy.get("input[name='username']").type('Admin');
    cy.get("input[name='password']").type('admin123{enter}');

    // Validasi intercept: dikirim via POST (bukan GET), kredensial tidak muncul di URL
    cy.wait('@loginViaEnter').then(({ request }) => {
      expect(request.method).to.eq('POST');
      expect(request.url).to.not.include('password');
      expect(request.headers['content-type']).to.include('application/x-www-form-urlencoded');
    });
    // Validasi intercept: dashboard dimuat dengan sukses
    cy.wait('@dashboardPage').its('response.statusCode').should('eq', 200);

    // Assertion: Sistem memproses login dan masuk ke dashboard via shortcut Enter
    cy.url().should('include', '/dashboard/index');
  });

  it('TC-LOG-10: Fungsi Logout', () => {
    // Login terlebih dahulu untuk mencapai Dashboard
    cy.get("input[name='username']").type('Admin');
    cy.get("input[name='password']").type('admin123');
    cy.get("button[type='submit']").click();
    cy.url().should('include', '/dashboard/index');

    // Intercept: request logout (didaftarkan sebelum aksi logout)
    cy.intercept('GET', '**/auth/logout').as('logoutRequest');

    // Proses Logout
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();

    // Validasi intercept: server mengalihkan ke halaman login
    cy.wait('@logoutRequest').then(({ response }) => {
      expect(response.statusCode).to.eq(302);
      expect(response.headers.location).to.match(/\/auth\/login$/);
    });

    // Assertion: Pengguna keluar dan kembali ke halaman login
    cy.url().should('include', '/auth/login');
    cy.get("button[type='submit']").should('be.visible');
  });

  it('TC-LOG-11: Sensitivitas karakter khusus pada username', () => {
    // Intercept: request submit login dengan karakter khusus
    cy.intercept('POST', '**/auth/validate').as('loginSpecialChar');

    cy.get("input[name='username']").type('Admin@#');
    cy.get("input[name='password']").type('admin123');
    cy.get("button[type='submit']").click();

    // Validasi intercept: karakter khusus ter-encode dengan benar (@ -> %40, # -> %23)
    cy.wait('@loginSpecialChar').then(({ request, response }) => {
      expect(request.body).to.include('username=Admin%40%23');
      expect(response.statusCode).to.eq(302);
      expect(response.headers.location).to.match(/\/auth\/login$/);
    });

    // Assertion: Muncul pesan error 'Invalid credentials'
    cy.get('.oxd-alert-content-text').should('be.visible').and('contain', 'Invalid credentials');
  });

  it('TC-LOG-12: Case sensitivity password', () => {
    // Intercept: request submit login dengan password huruf besar
    cy.intercept('POST', '**/auth/validate').as('loginCasePassword');

    cy.get("input[name='username']").type('Admin');
    cy.get("input[name='password']").type('ADMIN123');
    cy.get("button[type='submit']").click();

    // Validasi intercept: casing password dikirim apa adanya & tidak ada akses ke dashboard
    cy.wait('@loginCasePassword').then(({ request, response }) => {
      expect(request.body).to.include('password=ADMIN123');
      expect(request.body).to.not.include('password=admin123');
      expect(response.statusCode).to.eq(302);
      expect(response.headers.location).to.not.include('dashboard');
    });

    // Assertion: Muncul pesan error 'Invalid credentials' karena password case-sensitive
    cy.get('.oxd-alert-content-text').should('be.visible').and('contain', 'Invalid credentials');
  });
})