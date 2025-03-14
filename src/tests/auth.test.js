import request from 'supertest';
import { app } from '../server.js';
import db from '../db/database.js';

beforeAll(async () => {
  await db.exec('CREATE TABLE IF NOT EXISTS users (username TEXT NOT NULL PRIMARY KEY, salt TEXT NOT NULL, hashed_password TEXT NOT NULL)');
});

afterEach(async () => {
  await db.exec('DELETE FROM users');
});

afterAll(async () => {
  await db.exec('DROP TABLE users');
	await new Promise((resolve) => {
		db.close(() => {
			resolve();
		});
	});
});

describe('Authentication', () => {
  test('Register with valid credentials', async () => {
    // Test registration success
	const res = await request(app)
	  .post('/auth/register')
	  .send({
		  username: 'testuser',
		  password: 'testpass'
	  });
	expect(res.statusCode).toBe(200);
  });

  test('Register with existing username', async () => {
    // Test 409 conflict
  });

  test('Login with valid credentials', async () => {
    // Test login success
  });

  test('Login with invalid credentials', async () => {
    // Test 401 unauthorized
  });

  test('Get user when authenticated', async () => {
    // Test user info retrieval
  });

  test('Get user when not authenticated', async () => {
    // Test 401 unauthorized
  });

  test('Logout success', async () => {
    // Test session cleared
  });
});
