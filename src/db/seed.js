import db from "./database.js";

// Helper function to run a query and log result
const runQuery = (sql, params = []) => {
	return new Promise((resolve, reject) => {
		db.run(sql, params, function (err) {
			if (err) {
				console.error(`Error executing: ${sql}`);
				console.error(err.message);
				reject(err);
			} else {
				console.log(`Successfully executed: ${sql}`);
				resolve(this);
			}
		});
	});
};

// Helper function to get a single row
const getRow = (sql, params = []) => {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) {
				console.error(`Error executing: ${sql}`);
				console.error(err.message);
				reject(err);
			} else {
				resolve(row);
			}
		});
	});
};

// Create users
async function createUsers() {
	console.log("Creating users...");
	try {
		// Check if users already exist
		const usersExist = await getRow("SELECT COUNT(*) as count FROM users");

		if (usersExist.count === 0) {
			await runQuery(
				"INSERT INTO users (username, salt, hashed_password) VALUES (?, ?, ?)",
				["aldona", "salt123", "hashedpassword123"]
			);

			await runQuery(
				"INSERT INTO users (username, salt, hashed_password) VALUES (?, ?, ?)",
				["bronius", "salt456", "hashedpassword456"]
			);

			console.log("✅ Users created successfully");
		} else {
			console.log("⚠️ Users already exist - skipping creation");
		}
	} catch (err) {
		console.error("❌ Failed to create users");
	}
}

// Create flashcard sets and cards
async function createFlashcardSets() {
	console.log("Creating flashcard sets and cards...");
	try {
		// Check if flashcard sets already exist
		const setsExist = await getRow(
			"SELECT COUNT(*) as count FROM flashcard_sets"
		);

		if (setsExist.count === 0) {
			// Empty flashcard set for aldona
			const emptySet = await runQuery(
				"INSERT INTO flashcard_sets (title, user_id) VALUES (?, ?)",
				["Spanish Vocabulary", "aldona"]
			);
			console.log(`Created empty set with ID: ${emptySet.lastID}`);

			// Flashcard set with 1 card for bronius
			const oneCardSet = await runQuery(
				"INSERT INTO flashcard_sets (title, user_id) VALUES (?, ?)",
				["Biology Basics", "bronius"]
			);

			await runQuery(
				"INSERT INTO flashcards (set_id, question, answer) VALUES (?, ?, ?)",
				[
					oneCardSet.lastID,
					"What is photosynthesis?",
					"The process by which plants convert light energy into chemical energy",
				]
			);
			console.log(`Created set with 1 card, ID: ${oneCardSet.lastID}`);

			// Flashcard set with 10 cards for aldona
			const tenCardSet = await runQuery(
				"INSERT INTO flashcard_sets (title, user_id) VALUES (?, ?)",
				["World History", "aldona"]
			);

			const historyCards = [
				["When did World War I begin?", "1914"],
				[
					"Who was the first president of the United States?",
					"George Washington",
				],
				["In which year did the Berlin Wall fall?", "1989"],
				[
					"Who wrote the Declaration of Independence?",
					"Thomas Jefferson",
				],
				["When did the French Revolution begin?", "1789"],
				["Who was the first Emperor of Rome?", "Augustus"],
				["In which year did Columbus reach the Americas?", "1492"],
				[
					"Who was the leader of the Soviet Union during the Cuban Missile Crisis?",
					"Nikita Khrushchev",
				],
				[
					"When did the Renaissance period begin approximately?",
					"14th century",
				],
				[
					"Who was the Egyptian queen who allied with Mark Antony?",
					"Cleopatra",
				],
			];

			for (const card of historyCards) {
				await runQuery(
					"INSERT INTO flashcards (set_id, question, answer) VALUES (?, ?, ?)",
					[tenCardSet.lastID, card[0], card[1]]
				);
			}

			console.log(`Created set with 10 cards, ID: ${tenCardSet.lastID}`);
			console.log("✅ Flashcard sets created successfully");
		} else {
			console.log("⚠️ Flashcard sets already exist - skipping creation");
		}
	} catch (err) {
		console.error("❌ Failed to create flashcard sets");
	}
}

// Create quizzes, questions, and answers
async function createQuizzes() {
	console.log("Creating quizzes...");
	try {
		// Check if quizzes already exist
		const quizzesExist = await getRow(
			"SELECT COUNT(*) as count FROM quizzes"
		);

		if (quizzesExist.count === 0) {
			// Empty quiz for aldona
			await runQuery(
				"INSERT INTO quizzes (name, is_public, user_id) VALUES (?, ?, ?)",
				["Geography Basics", 1, "aldona"]
			);
			console.log("Created empty quiz");

			// Quiz with 1 question for bronius
			const oneQuestionQuiz = await runQuery(
				"INSERT INTO quizzes (name, is_public, user_id) VALUES (?, ?, ?)",
				["Math Quiz", 0, "bronius"]
			);

			const mathQuestion = await runQuery(
				"INSERT INTO questions (quiz_id, text) VALUES (?, ?)",
				[oneQuestionQuiz.lastID, "What is 2 + 2?"]
			);

			await runQuery(
				"INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)",
				[mathQuestion.lastID, "3", 0]
			);
			await runQuery(
				"INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)",
				[mathQuestion.lastID, "4", 1]
			);
			await runQuery(
				"INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)",
				[mathQuestion.lastID, "5", 0]
			);
			await runQuery(
				"INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)",
				[mathQuestion.lastID, "None of the above", 0]
			);

			console.log("Created quiz with 1 question");

			// Quiz with 10 questions for aldona
			const tenQuestionQuiz = await runQuery(
				"INSERT INTO quizzes (name, is_public, user_id) VALUES (?, ?, ?)",
				["Literature Masterpieces", 1, "aldona"]
			);

			const literatureQuestions = [
				"Who wrote 'Pride and Prejudice'?",
				"Which Shakespearean play features the character Macbeth?",
				"Who is the author of 'One Hundred Years of Solitude'?",
				"Which novel begins with the line 'Call me Ishmael'?",
				"Who wrote '1984'?",
				"Which author created the character Sherlock Holmes?",
				"What is the name of the protagonist in 'The Great Gatsby'?",
				"Who wrote 'The Divine Comedy'?",
				"Which novel features the character Atticus Finch?",
				"Who is the author of 'War and Peace'?",
			];

			const literatureAnswers = [
				[
					["Jane Austen", 1],
					["Emily Brontë", 0],
					["Charles Dickens", 0],
					["Virginia Woolf", 0],
				],
				[
					["Macbeth", 1],
					["Hamlet", 0],
					["Othello", 0],
					["King Lear", 0],
				],
				[
					["Gabriel García Márquez", 1],
					["Isabel Allende", 0],
					["Pablo Neruda", 0],
					["Jorge Luis Borges", 0],
				],
				[
					["Moby-Dick", 1],
					["The Old Man and the Sea", 0],
					["Treasure Island", 0],
					["The Adventures of Huckleberry Finn", 0],
				],
				[
					["George Orwell", 1],
					["Aldous Huxley", 0],
					["Ray Bradbury", 0],
					["H.G. Wells", 0],
				],
				[
					["Arthur Conan Doyle", 1],
					["Agatha Christie", 0],
					["Edgar Allan Poe", 0],
					["Wilkie Collins", 0],
				],
				[
					["Jay Gatsby", 0],
					["Nick Carraway", 1],
					["Tom Buchanan", 0],
					["Daisy Buchanan", 0],
				],
				[
					["Dante Alighieri", 1],
					["Giovanni Boccaccio", 0],
					["Niccolò Machiavelli", 0],
					["Francesco Petrarca", 0],
				],
				[
					["To Kill a Mockingbird", 1],
					["The Catcher in the Rye", 0],
					["The Grapes of Wrath", 0],
					["Of Mice and Men", 0],
				],
				[
					["Leo Tolstoy", 1],
					["Fyodor Dostoevsky", 0],
					["Anton Chekhov", 0],
					["Ivan Turgenev", 0],
				],
			];

			for (let i = 0; i < literatureQuestions.length; i++) {
				const question = await runQuery(
					"INSERT INTO questions (quiz_id, text) VALUES (?, ?)",
					[tenQuestionQuiz.lastID, literatureQuestions[i]]
				);

				for (const answer of literatureAnswers[i]) {
					await runQuery(
						"INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)",
						[question.lastID, answer[0], answer[1]]
					);
				}
			}

			console.log("Created quiz with 10 questions");
			console.log("✅ Quizzes created successfully");
		} else {
			console.log("⚠️ Quizzes already exist - skipping creation");
		}
	} catch (err) {
		console.error("❌ Failed to create quizzes");
	}
}

// Main function to execute all data creation
async function seedDatabase() {
	console.log("Starting database seeding...");
	try {
		//await createUsers();
		await createFlashcardSets();
		await createQuizzes();
		console.log("✅ Database seeding completed successfully");
	} catch (err) {
		console.error("❌ Database seeding failed");
		console.error(err);
	} finally {
		process.exit(0);
	}
}

// Run the seeding process
seedDatabase();
