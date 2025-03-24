import request from "supertest";
import { createServer } from "../server.js";
import db from "../db/database.js";

let server;

beforeAll(async () => {
  server = createServer(3001);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY, quiz_id INTEGER, text TEXT NOT NULL, FOREIGN KEY(quiz_id) REFERENCES quizzes(id));
    CREATE TABLE IF NOT EXISTS answers (id INTEGER PRIMARY KEY, question_id INTEGER, text TEXT NOT NULL, is_correct INTEGER, FOREIGN KEY(question_id) REFERENCES questions(id));
  `);
});

afterEach(async () => {
  await db.exec("DELETE FROM quizzes");
  await db.exec("DELETE FROM questions");
  await db.exec("DELETE FROM answers");
});

afterAll(async () => {
  return new Promise((resolve) => {
    db.close(() => {
      server.close(() => resolve());
    });
  });
});

describe("Quiz API", () => {
  test("Create a new quiz", async () => {
    const res = await request(server).post("/quizzes").send({
      name: "Sample Quiz",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", "Sample Quiz");
  });

  test("Create a new question for a quiz", async () => {
    const quizRes = await request(server).post("/quizzes").send({
      name: "Sample Quiz",
    });
    const quizId = quizRes.body.id;

    const questionRes = await request(server)
      .post(`/quizzes/${quizId}/questions`)
      .send({
        text: "What is 2 + 2?",
        answers: [
          { text: "4", isCorrect: true },
          { text: "3", isCorrect: false },
        ],
      });

    expect(questionRes.statusCode).toBe(200);
    expect(questionRes.body).toHaveProperty("success", true);
    expect(questionRes.body).toHaveProperty("id");
    expect(questionRes.body).toHaveProperty("text", "What is 2 + 2?");
    expect(questionRes.body.answers).toHaveLength(2);
  });

  test("Modify an existing question", async () => {
    const quizRes = await request(server).post("/quizzes").send({
      name: "Sample Quiz",
    });
    const quizId = quizRes.body.id;

    const questionRes = await request(server)
      .post(`/quizzes/${quizId}/questions`)
      .send({
        text: "What is 2 + 2?",
        answers: [
          { text: "4", isCorrect: true },
          { text: "3", isCorrect: false },
        ],
      });
    const questionId = questionRes.body.id;

    const updateRes = await request(server)
      .put(`/quizzes/${quizId}/questions/${questionId}`)
      .send({
        text: "What is 3 + 3?",
        answers: [
          { text: "6", isCorrect: true },
          { text: "5", isCorrect: false },
        ],
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toHaveProperty("success", true);
    expect(updateRes.body).toHaveProperty("text", "What is 3 + 3?");
    expect(updateRes.body.answers).toHaveLength(2);
    expect(updateRes.body.answers[0]).toHaveProperty("text", "6");
    expect(updateRes.body.answers[0]).toHaveProperty("isCorrect", true);
  });

  test("Fail to create a quiz with no name", async () => {
    const res = await request(server).post("/quizzes").send({});
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
  
  test("Create a question with no text", async () => {
    const quizRes = await request(server).post("/quizzes").send({
      name: "Sample Quiz",
    });
    const quizId = quizRes.body.id;
  
    const questionRes = await request(server)
      .post(`/quizzes/${quizId}/questions`)
      .send({
        answers: [
          { text: "4", isCorrect: true },
          { text: "3", isCorrect: false },
        ],
      });
  
    expect(questionRes.statusCode).toBe(200);
    expect(questionRes.body).toHaveProperty("success", true);
    expect(questionRes.body).toHaveProperty("id");
    expect(questionRes.body.answers).toHaveLength(2);
  });
});