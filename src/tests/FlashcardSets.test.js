import request from "supertest";
import { createServer } from "../server.js";
import db from "../db/database.js";

let server;

beforeAll(async () => {
    server = createServer(3002);
    await db.exec(`
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      set_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      FOREIGN KEY(set_id) REFERENCES sets(id)
    );
  `);
});

afterEach(async () => {
    await db.exec("DELETE FROM cards");
    await db.exec("DELETE FROM sets");
});

afterAll(async () => {
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

            expect(res.statusCode).toBe(200);
            expect(res.body).toMatchObject({
                title: "Spanish Verbs",
                success: true
            });
        });

        test("Create set with empty title should pass(no validation)", async () => {
            const res = await request(server)
                .post("/sets")
                .send({ title: "" });

            expect(res.statusCode).toBe(200);
        });

        test("Get all flashcard sets", async () => {
            await request(server)
                .post("/sets")
                .send({ title: "Test Set" });

            const res = await request(server).get("/sets");

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
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
            const res = await request(server)
                .post(`/sets/${testSetId}/cards`)
                .send({
                    front: "What is 'hello' in Spanish?",
                    back: "Hola"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("question");
        });

        test("Add card with empty question should pass(no validation)", async () => {
            const res = await request(server)
                .post(`/sets/${testSetId}/cards`)
                .send({
                    front: "",
                    back: "Valid answer"
                });

            expect(res.statusCode).toBe(200);
        });

        test("Get cards for a set", async () => {
            const res = await request(server)
                .get(`/sets/${testSetId}/cards`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        test("Delete a card", async () => {
            const cardRes = await request(server)
                .post(`/sets/${testSetId}/cards`)
                .send({ front: "Q", back: "A" });

            const deleteRes = await request(server)
                .delete(`/sets/${testSetId}/cards/${cardRes.body.id}`);

            expect(deleteRes.statusCode).toBe(200);
            expect(deleteRes.body).toEqual({ success: true });
        });
    });
});