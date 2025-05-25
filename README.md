# Learn2 

![home](https://github.com/user-attachments/assets/be892c1c-6bd1-4457-963e-e5df9481998a)

## Overview

Learn2 is built around evidence-based learning techniques—active recall and spaced repetition—to help you retain information more efficiently and confidently. At its core, the platform offers two complementary study modes: flashcards for bite-sized, rapid-fire review and multiple-choice quizzes for deeper, contextual understanding. In the flashcard view, you see a prompt (word, concept or question) and actively search your memory for the answer; after revealing the back side, you rate how well you recalled it. That self-assessment drives the spacing algorithm, ensuring that cards you find easy are shown less often, while those you struggle with reappear sooner to reinforce your weak spots.  

Quizzes take you beyond simple recall by presenting questions with one or more correct answers in a randomized order. Immediate, per-question feedback highlights both successes and mistakes, helping you learn from errors in real time. All quiz attempts are logged, so you can revisit specific questions later or track trends in your accuracy over time.  

Behind the scenes, Learn2 seamlessly unites these study modes into a single session. You can switch back and forth between flashcards and quizzes without leaving the Study view, maintaining focus and momentum. Every interaction—answers, ratings, timestamps—is recorded and fed into the Statistics dashboard, where you’ll find up-to-the-minute insights on your progress: total reviews, accuracy percentages, and which items are due for another pass.  

By combining a clean, distraction-free interface with proven cognitive techniques, Learn2 keeps you engaged, motivated and in control of your learning journey. Whether you’re tackling language vocabulary, technical concepts or exam preparation, the platform adapts to your pace and highlights exactly where you should focus next.  

---

## Core Features

### 1. Flashcards with Adaptive Reviews  
Flashcards are at the core of Learn2’s methodology. In a single-page editor you define a prompt (“front”) and its answer or explanation (“back”). During study sessions, each card appears one at a time; after recalling the answer, you select from a simple quality scale (e.g. “Poor”, “Okay”, “Good”). Your choice is recorded and available in the Statistics dashboard, helping you pinpoint which cards to revisit.

Each card tracks:
- **Review Count**: how often you’ve practiced it  
- **Last Reviewed**: the date and time of your most recent session  
- **Quality History**: a log of past self-assessments  

These metrics surface in your daily overview so you can see where to focus next.

### 2. Multiple-Choice Quizzes  
Quizzes let you test your knowledge with structured questions. You add any number of choices and mark one or more as correct. When you take a quiz, answers are shuffled to prevent memorization of positions. Immediate feedback highlights correct and incorrect selections, reinforcing learning in real time. Each attempt is logged—complete with timestamps and scores—so you can track your improvement over time.

![viewer](https://github.com/user-attachments/assets/8c258ae6-a1f0-4f50-8d43-e69f1b45da30)

### 3. Unified Study Mode  
Whether you’re working through flashcards or quizzes, the Study view delivers a seamless experience. Select a deck or quiz set, then progress through items one by one. Answers and ratings save automatically—no page reloads—so you can pause and resume at will without losing your place.

### 4. Real-Time Statistics Dashboard  
Learn2’s Statistics page provides on-demand insights into your study habits. Data is pulled directly from the built-in SQLite database (`app.db`) and rendered as:
- **Total Reviews per Set**  
- **Overall Accuracy Percentage**  
- **Review Frequency Graphs**  
- **“Needs Practice” Lists** for items below a chosen accuracy threshold

  
![stat](https://github.com/user-attachments/assets/7fa41cd4-c356-48e3-bb3b-3260ea09d455)


Charts and tables update instantly as you study or add new material, giving you a clear picture of your progress.

---

## Workflow & Usage

1. **Registration & Login**

   - Navigate to `/register` to create a new account with a username and password.  
   - All credentials and profiles live in the same SQLite file, ensuring seamless data management.

2. **Creating Study Materials**  
   - Click **Create** on the homepage.  
   - Choose **Flashcards** or **Quiz**, enter a descriptive title, then start adding items.  
   - Use the inline editor to type prompts, answers and select correct options—everything happens in one view for maximum speed.

3. **Studying**

 ![dash](https://github.com/user-attachments/assets/2f5de589-2e16-47e0-bf65-eaa2810a5153)

   - From the homepage, select a flashcard deck or quiz set and hit **Study**.  
   - For flashcards, view the front, recall the answer mentally, then click a quality button.  
   - For quizzes, select answers, submit, and review immediate feedback.  
   - You can stop at any time; Learn2 remembers your place so you can resume later.

5. **Reviewing Performance**  
   - Head to **Statistics** to see how you’ve been doing.  
   - Filter by date ranges or by specific decks/quizzes to focus on weak spots.  
   - Export data directly from the SQLite file if you want to run custom analyses or back up your progress.

---
## Installation
1. Clone the repository
```bash
git clone https://github.com/s7eamy/learn-to.git
```

2. Install the dependencies
```bash
npm install
```

3. Run the frontend and backend servers
```bash
npm run dev # frontend
node --watch src/server.js # backend
```

## Usage

**1. Register an user**

Go to `localhost:5173/register` and create an user. The user will be saved in `app.db`.

**2. Login as the created user or any of the sample users**

Go to `localhost:5173/login` and login as your user or use one of the two sample users:
a) User: aldona, password: aldona
b) User: bronius, password: bronius

**3. Create study material**

As an user, you have two options to choose from:
a) flashcard sets - sets of flashcards that have a front side and a back side. 
b) quizzes - sets of questions that can have multiple answers to choose from.
Click on the Create button in the homepage, choose your type and specify a name for the set/quiz. Then you will be redirected to the set/quiz page.

Here you can add cards/questions. Fill them up as you'd like!

**4. Study**

Now, once you've got the material, click on Study! You will be asked questions or shown cards. If you're studying flashcards, you'll have to measure how well you remember the back side after each card. This is done to track your statistics and studying progress.

**5. Track your stats!**

You racked up some studying hours. Now what?
There is the possibility to check your progress! Head over to the statistics page and find insights about your efficiency.

## Architecture

### Frontend
Frontend uses React + Vite.js. Everything is stored in `src/components/`. The frontend components are served via port 5173, which is the port you use to actually access the platform. 

### Backend
Backend uses Node.js runtime. Backend routes can be found in `src/routes/`. The backend server is running on port 3000. The frontend server is configured in such a way that if we need to access the backend API, we use the `/api` endpoint, which acts as a proxy to `localhost:3000`. For example, if we want to fetch flashcards, we could directly call GET `localhost:3000/flashcards`, but we instead do GET `localhost:5173/api/flashcards`.

### Database
For simplicity sake, database used is a local SQLite instance as seen in `app.db` file. Database is directly accessed from the backend APIs.

## Quality Assurance

Unit tests were implemented during the third sprint, however, they weren't maintained as the API and frontend changed, so they are not functional in the end result. Tests can be found in `src/tests/`.

Furthermore, a static analysis CI/CD pipeline was set up to check for Prettier formatting and ESLint rules. A custom rule was written to check for unnecessary `console.log()` calls. The custom rule can be found in `eslint-rules/`, the CI/CD pipeline in `.github/workflows/`. 

## Developers

Developed by four Software Systems students from Kaunas University of Technology (KTU):
* s7eamy (E8390) - architecture lead, backend engineering, backend unit tests, CI/CD
* MyciuS (E8610) - frontend implementation, backend engineering, backend unit tests
* PerfectJokester - backend engineering
* xmivte (E8013) - UI/UX design, frontend implementation, frontend unit tests


