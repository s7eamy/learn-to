import request from 'supertest';
import { createServer, sessionStore } from '../server.js';
import db from '../db/database.js';

let server;

beforeAll(async () => {
	server = createServer(3001);
  await db.exec('CREATE TABLE IF NOT EXISTS users (username TEXT NOT NULL PRIMARY KEY, salt TEXT NOT NULL, hashed_password TEXT NOT NULL)');
});

afterEach(async () => {
  await db.exec('DELETE FROM users');
	sessionStore.clear();
});

afterAll(async () => {
  return new Promise((resolve) => {
      db.close(() => {
        server.close(() => resolve());
      });
  });
});

describe('Authentication', () => {
  test.each([
	  ['testuser', 'testpass'],
	  ['UPPERCASE', 'testpass'],
	  ['numb3rs123', 'testpass'],
	  ['sy!mb0ls#?', 'testpass']
  ])('Register with valid credentials', async (user, passw) => {
    	// Test registration success
	const res = await request(server)
	  .post('/auth/register')
	  .send({
		  username: user,
		  password: passw
	  });
	expect(res.statusCode).toBe(200);
  });

  test('Register with existing username', async () => {
	// Test 409 conflict
	await request(server)
	  .post('/auth/register')
	  .send({
		  username: 'existinguser',
		  password: 'uniquepass'
	  });

	const res = await request(server)
	  .post('/auth/register')
	  .send({
		  username: 'existinguser',
		  password: 'different'
	  });

	expect(res.statusCode).toBe(409);
  });

  test('Login with valid credentials', async () => {
    // Test login success
	await request(server)
	  .post('/auth/register')
	  .send({
		  username: 'testuser',
		  password: 'testpass'
	  });
	const res = await request(server)
	  .post('/auth/login')
	  .send({
		  username: 'testuser',
		  password: 'testpass'
	  });

	expect(res.statusCode).toBe(200);
	expect(res.body.message).toBe('Login successful');
  });

  test('Login with invalid credentials', async () => {
    // Test 401 unauthorized
	const res = await request(server)
	  .post('/auth/login')
	  .send({
		  username: 'testuser',
		  password: 'testpass'
	  });
	expect(res.statusCode).toBe(401);
	expect(res.body.message).toBe('Incorrect username or password.');
  });

  test('Get user when authenticated', async () => {
	// Test user info retrieval
	// Register and login first
	await request(server)
		.post('/auth/register')
		.send({
			username: 'testuser',
			password: 'testpass'
	});

	const agent = request.agent(server);
	await agent
		.post('/auth/login')
		.send({
			username: 'testuser',
			password: 'testpass'
	});

	// Test user info endpoint
	const res = await agent.get('/auth/user');
	expect(res.statusCode).toBe(200);
	expect(res.body.username).toBe('testuser');
  });

  test('Get user when not authenticated', async () => {
	// Test 401 unauthorized
	const res = await request(server)
	  .get('/auth/user');
	
	expect(res.statusCode).toBe(401);
	expect(res.body.message).toBe('Unauthorized');
  });

  test('Logout success', async () => {
    // Test session cleared
	// Register and login first
	await request(server)
		.post('/auth/register')
		.send({
			username: 'testuser',
			password: 'testpass'
	});

	const agent = request.agent(server);
	await agent
		.post('/auth/login')
		.send({
			username: 'testuser',
			password: 'testpass'
	});

	// Test logout
	const res = await agent.get('/auth/logout');
	expect(res.statusCode).toBe(302); // Redirect status

	// Verify logged out by checking user endpoint
	const userRes = await agent.get('/auth/user');
	expect(userRes.statusCode).toBe(401);
  });
});
