import request from "supertest";
import { createServer } from "../server.js";
import db from "../db/database.js";

// Remove the jest import - it's globally available in test files

let server;
let originalRun;
let originalAll;
let originalGet;

beforeAll(async () => {
  // Save original db functions before any tests run
  originalRun = db.run;
  originalAll = db.all;
  originalGet = db.get;

  server = createServer(3003);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS flashcard_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      set_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      FOREIGN KEY(set_id) REFERENCES flashcard_sets(id)
    );
  `);
});

beforeEach(() => {
  // Reset the mocks before each test
  if (db.run.mockRestore) db.run.mockRestore();
  if (db.all.mockRestore) db.all.mockRestore();
  if (db.get.mockRestore) db.get.mockRestore();
});

afterEach(async () => {
  await db.exec("DELETE FROM flashcards");
  await db.exec("DELETE FROM flashcard_sets");
});

afterAll(async () => {
  // Restore original functions
  db.run = originalRun;
  db.all = originalAll;
  db.get = originalGet;

  return new Promise((resolve) => {
    db.close(() => {
      server.close(() => resolve());
    });
  });
});

describe("Flashcard API", () => {
  describe("Set Operations", () => {
    test("Create new flashcard set", async () => {
      const res = await request(server)
        .post("/sets")
        .send({ title: "Spanish Verbs" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        title: "Spanish Verbs",
        success: true,
      });
    });

    test("Create set with empty title should not pass", async () => {
      const res = await request(server).post("/sets").send({ title: "" });

      expect(res.statusCode).toBe(400);
    });

    test("Get all flashcard sets", async () => {
      await request(server).post("/sets").send({ title: "Test Set" });

      const res = await request(server).get("/sets");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Retrieve a single set", async () => {
      const setRes = await request(server)
        .post("/sets")
        .send({ title: "Test Set" });

      const res = await request(server).get(`/sets/${setRes.body.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ title: "Test Set" });
    });

    test("Retrieve non-existent set", async () => {
      const res = await request(server).get("/sets/999");

      expect(res.statusCode).toBe(404);
      expect(res.body).toMatchObject({ error: "Set not found" });
    });

    describe("Error handling", () => {
      test("Error when creating set causes 500 status", async () => {
        // Mock db.run to simulate a database error
        const originalRun = db.run;
        db.run = jest.fn((query, params, callback) => {
          if (query.includes("INSERT INTO flashcard_sets")) {
            callback(new Error("Database error"));
          } else {
            originalRun(query, params, callback);
          }
        });

        const res = await request(server)
          .post("/sets")
          .send({ title: "Test Set" });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty("error");
        db.run = originalRun;
      });

      test("Error when fetching all sets causes 500 status", async () => {
        const originalAll = db.all;
        db.all = jest.fn((query, params, callback) => {
          if (query.includes("SELECT * FROM flashcard_sets")) {
            callback(new Error("Database error"));
          } else {
            originalAll(query, params, callback);
          }
        });

        const res = await request(server).get("/sets");

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty("error");
        db.all = originalAll;
      });

      test("Error when fetching a single set causes 500 status", async () => {
        // First create a set
        const setRes = await request(server)
          .post("/sets")
          .send({ title: "Test Set" });

        // Then mock an error for the get request
        const originalGet = db.get;
        db.get = jest.fn((query, params, callback) => {
          if (query.includes("SELECT * FROM flashcard_sets WHERE id")) {
            callback(new Error("Database error"));
          } else {
            originalGet(query, params, callback);
          }
        });

        const res = await request(server).get(`/sets/${setRes.body.id}`);

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty("error");
        db.get = originalGet;
      });
    });
  });

  describe("Card Operations", () => {
    let testSetId;

    beforeEach(async () => {
      const setRes = await request(server)
        .post("/sets")
        .send({ title: "Test Set" });
      testSetId = setRes.body.id;
    });

    test("Add card to set", async () => {
      const res = await request(server).post(`/sets/${testSetId}/cards`).send({
        front: "What is 'hello' in Spanish?",
        back: "Hola",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("question");
    });

    test("Add card with empty question should not pass", async () => {
      const res = await request(server).post(`/sets/${testSetId}/cards`).send({
        front: "",
        back: "Valid answer",
      });

      expect(res.statusCode).toBe(400);
    });

    test("Get cards for a set", async () => {
      const res = await request(server).get(`/sets/${testSetId}/cards`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Delete a card", async () => {
      const cardRes = await request(server)
        .post(`/sets/${testSetId}/cards`)
        .send({ front: "Q", back: "A" });

      const deleteRes = await request(server).delete(
        `/sets/${testSetId}/cards/${cardRes.body.id}`,
      );

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body).toEqual({ success: true });
    });

    describe("Error handling", () => {
      test("Error when fetching cards causes 500 status", async () => {
        const originalAll = db.all;
        db.all = jest.fn((query, params, callback) => {
          if (query.includes("SELECT * FROM flashcards")) {
            callback(new Error("Database error"));
          } else {
            originalAll(query, params, callback);
          }
        });

        const res = await request(server).get(`/sets/${testSetId}/cards`);

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty("error");
        db.all = originalAll;
      });

      test("Error when adding card causes 500 status", async () => {
        const originalRun = db.run;
        db.run = jest.fn((query, params, callback) => {
          if (query.includes("INSERT INTO flashcards")) {
            callback(new Error("Database error"));
          } else {
            originalRun(query, params, callback);
          }
        });

        const res = await request(server)
          .post(`/sets/${testSetId}/cards`)
          .send({ front: "Question", back: "Answer" });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty("error");
        db.run = originalRun;
      });

      // TODO: fix this test. currently it invokes operating system to kill jest worker process and fail the entire test suite
      test.skip("Error when fetching newly created card causes 500 status", async () => {
        // Create a spy that allows the insert to succeed but fails on the select
        const originalRun = db.run;
        const originalGet = db.get;

        db.run = jest.fn((query, params, callback) => {
          if (query.includes("INSERT INTO flashcards")) {
            // Call the callback with the context that has lastID
            callback.call({ lastID: 999 });
          } else {
            originalRun(query, params, callback);
          }
        });

        db.get = jest.fn((query, params, callback) => {
          if (query.includes("SELECT * FROM flashcards WHERE id")) {
            callback(new Error("Database error"));
          } else {
            originalGet(query, params, callback);
          }
        });

        const res = await request(server)
          .post(`/sets/${testSetId}/cards`)
          .send({ front: "Question", back: "Answer" });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty("error");

        db.run = originalRun;
        db.get = originalGet;
      });

      test("Error when deleting card causes 500 status", async () => {
        // First create a card
        const cardRes = await request(server)
          .post(`/sets/${testSetId}/cards`)
          .send({ front: "Delete Test", back: "Answer" });

        // Then mock an error for delete
        const originalRun = db.run;
        db.run = jest.fn((query, params, callback) => {
          if (query.includes("DELETE FROM flashcards")) {
            callback(new Error("Database error"));
          } else {
            originalRun(query, params, callback);
          }
        });

        const res = await request(server).delete(
          `/sets/${testSetId}/cards/${cardRes.body.id}`,
        );

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty("error");
        db.run = originalRun;
      });
    });
  });
});
