import request from 'supertest';
import { createServer } from '../server.js';
import db from '../db/database.js';

let server;

beforeAll(async () => {
	server = createServer(3001);
  await db.exec('CREATE TABLE IF NOT EXISTS users (username TEXT NOT NULL PRIMARY KEY, salt TEXT NOT NULL, hashed_password TEXT NOT NULL)');
});

afterEach(async () => {
  await db.exec('DELETE FROM users');
});

afterAll(async () => {
  return new Promise((resolve) => {
    db.exec('DROP TABLE users', () => {
      db.close(() => {
        server.close(() => resolve());
      });
    });
  });
});

describe('Authentication', () => {
  test('Register with valid credentials', async () => {
    // Test registration success
	const res = await request(server)
	  .post('/auth/register')
	  .send({
		  username: 'testuser',
		  password: 'testpass'
	  });
	expect(res.statusCode).toBe(200);
  });

  test('Register with existing username', async () => {
    // Test 409 conflict
	  throw new Error('Need to implement');
  });

  test('Login with valid credentials', async () => {
    // Test login success
	  throw new Error('Need to implement');
  });

  test('Login with invalid credentials', async () => {
    // Test 401 unauthorized
	  throw new Error('Need to implement');
  });

  test('Get user when authenticated', async () => {
    // Test user info retrieval
	  throw new Error('Need to implement');
  });

  test('Get user when not authenticated', async () => {
    // Test 401 unauthorized
	  throw new Error('Need to implement');
  });

  test('Logout success', async () => {
    // Test session cleared
	  throw new Error('Need to implement');
  });
});
