describe('API Automation Testing on reqres.in', () => {

  // 1. GET: List Users
  it('1. Should get list of users successfully', () => {
    cy.request('GET', 'https://reqres.in/api/users?page=1').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.page).to.eq(1);
      expect(response.body.data).to.be.an('array');
    });
  });

  // 2. GET: Single User
  it('2. Should get a single user successfully', () => {
    cy.request('GET', 'https://reqres.in/api/users/2').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.id).to.eq(2);
      expect(response.body.data.email).to.include('@reqres.in');
    });
  });

  // 3. GET: Single User Not Found (404)
  it('3. Should return 404 when user not found', () => {
    cy.request({
      method: 'GET',
      url: 'https://reqres.in/api/users/23',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.deep.eq({});
    });
  });

  // 4. GET: List Resource (Unknown)
  it('4. Should get list of unknown resources successfully', () => {
    cy.request('GET', 'https://reqres.in/api/unknown').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.per_page).to.eq(6);
    });
  });

  // 5. GET: Single Resource
  it('5. Should get a single resource successfully', () => {
    cy.request('GET', 'https://reqres.in/api/unknown/2').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.name).to.eq('fuchsia rose');
    });
  });

  // 6. GET: Single Resource Not Found (404)
  it('6. Should return 404 when resource not found', () => {
    cy.request({
      method: 'GET',
      url: 'https://reqres.in/api/unknown/23',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.deep.eq({});
    });
  });

  // 7. POST: Create User
  it('7. Should create a new user successfully', () => {
    cy.request('POST', 'https://reqres.in/api/users', {
      name: 'morpheus',
      job: 'leader'
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.name).to.eq('morpheus');
      expect(response.body.job).to.eq('leader');
      expect(response.body).to.have.property('id');
    });
  });

  // 8. PUT: Update User
  it('8. Should update user completely using PUT', () => {
    cy.request('PUT', 'https://reqres.in/api/users/2', {
      name: 'morpheus',
      job: 'zion resident'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.job).to.eq('zion resident');
      expect(response.body).to.have.property('updatedAt');
    });
  });

  // 9. PATCH: Update User Partially
  it('9. Should update user partially using PATCH', () => {
    cy.request('PATCH', 'https://reqres.in/api/users/2', {
      job: 'senior leader'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.job).to.eq('senior leader');
      expect(response.body).to.have.property('updatedAt');
    });
  });

  // 10. DELETE: Delete User
  it('10. Should delete user successfully', () => {
    cy.request('DELETE', 'https://reqres.in/api/users/2').then((response) => {
      expect(response.status).to.eq(204);
    });
  });

  // 11. POST: Register Successful
  it('11. Should register user successfully', () => {
    cy.request('POST', 'https://reqres.in/api/register', {
      email: 'eve.holt@reqres.in',
      password: 'pistol'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      expect(response.body.id).to.eq(4);
    });
  });

  // 12. POST: Login Successful
  it('12. Should login user successfully', () => {
    cy.request('POST', 'https://reqres.in/api/login', {
      email: 'eve.holt@reqres.in',
      password: 'cityslicers'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
    });
  });

});