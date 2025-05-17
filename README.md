# Learn2 - a platform to reach your studying goals

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


