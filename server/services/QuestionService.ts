import { GameSettings, Question } from "../../shared/types";
import { v4 as uuidv4 } from "uuid";

interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface TriviaResponse {
  response_code: number;
  results: TriviaQuestion[];
}

interface QuizAPIQuestion {
  id: number;
  question: string;
  description: string | null;
  answers: {
    answer_a: string;
    answer_b: string;
    answer_c: string;
    answer_d: string;
    answer_e: string | null;
    answer_f: string | null;
  };
  multiple_correct_answers: string;
  correct_answers: {
    answer_a_correct: string;
    answer_b_correct: string;
    answer_c_correct: string;
    answer_d_correct: string;
    answer_e_correct: string;
    answer_f_correct: string;
  };
  explanation: string | null;
  tip: string | null;
  tags: Array<{ name: string }>;
  category: string;
  difficulty: string;
}

interface QuizAPIResponse {
  error?: string;
  results?: QuizAPIQuestion[];
}

export class QuestionService {
  private fallbackQuestions: Question[] = [
    {
      id: uuidv4(),
      question: "Quelle est la capitale de la France ?",
      options: ["Londres", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      category: "Géographie",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Combien font 2 + 2 ?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "4",
      category: "Mathématiques",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Qui a peint la Joconde ?",
      options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Monet"],
      correctAnswer: "Leonardo da Vinci",
      category: "Art",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quelle est la planète la plus proche du Soleil ?",
      options: ["Vénus", "Mercure", "Mars", "Terre"],
      correctAnswer: "Mercure",
      category: "Science",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "En quelle année a eu lieu la Révolution française ?",
      options: ["1789", "1792", "1799", "1804"],
      correctAnswer: "1789",
      category: "Histoire",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quel est l'élément chimique avec le symbole 'O' ?",
      options: ["Or", "Oxygène", "Osmium", "Olivier"],
      correctAnswer: "Oxygène",
      category: "Science",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Qui a écrit 'Les Misérables' ?",
      options: [
        "Victor Hugo",
        "Émile Zola",
        "Gustave Flaubert",
        "Marcel Proust",
      ],
      correctAnswer: "Victor Hugo",
      category: "Littérature",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Combien y a-t-il de continents sur Terre ?",
      options: ["5", "6", "7", "8"],
      correctAnswer: "7",
      category: "Géographie",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quelle est la vitesse de la lumière dans le vide ?",
      options: ["300 000 km/s", "150 000 km/s", "450 000 km/s", "600 000 km/s"],
      correctAnswer: "300 000 km/s",
      category: "Science",
      difficulty: "hard",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Qui a composé 'La 9ème Symphonie' ?",
      options: ["Mozart", "Bach", "Beethoven", "Chopin"],
      correctAnswer: "Beethoven",
      category: "Musique",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quel est le plus grand océan du monde ?",
      options: ["Atlantique", "Indien", "Arctique", "Pacifique"],
      correctAnswer: "Pacifique",
      category: "Géographie",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question:
        "En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?",
      options: ["1967", "1969", "1971", "1973"],
      correctAnswer: "1969",
      category: "Histoire",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quelle est la formule chimique de l'eau ?",
      options: ["H2O", "CO2", "NaCl", "CH4"],
      correctAnswer: "H2O",
      category: "Science",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Qui a inventé le téléphone ?",
      options: [
        "Thomas Edison",
        "Alexander Graham Bell",
        "Nikola Tesla",
        "Benjamin Franklin",
      ],
      correctAnswer: "Alexander Graham Bell",
      category: "Histoire",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Combien de côtés a un hexagone ?",
      options: ["5", "6", "7", "8"],
      correctAnswer: "6",
      category: "Mathématiques",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quelle est la monnaie du Japon ?",
      options: ["Yuan", "Won", "Yen", "Ringgit"],
      correctAnswer: "Yen",
      category: "Culture générale",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Qui a écrit '1984' ?",
      options: [
        "George Orwell",
        "Aldous Huxley",
        "Ray Bradbury",
        "Isaac Asimov",
      ],
      correctAnswer: "George Orwell",
      category: "Littérature",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quelle est la plus haute montagne du monde ?",
      options: ["K2", "Mont Everest", "Kangchenjunga", "Lhotse"],
      correctAnswer: "Mont Everest",
      category: "Géographie",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Combien de joueurs y a-t-il dans une équipe de football ?",
      options: ["10", "11", "12", "13"],
      correctAnswer: "11",
      category: "Sport",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quelle est la langue la plus parlée au monde ?",
      options: ["Anglais", "Espagnol", "Chinois Mandarin", "Hindi"],
      correctAnswer: "Chinois Mandarin",
      category: "Culture générale",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quel est le plus petit pays du monde ?",
      options: ["Monaco", "Vatican", "Nauru", "Saint-Marin"],
      correctAnswer: "Vatican",
      category: "Géographie",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Combien de cordes a une guitare classique ?",
      options: ["4", "5", "6", "7"],
      correctAnswer: "6",
      category: "Musique",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quelle est la devise de la France ?",
      options: [
        "Liberté, Égalité, Fraternité",
        "Dieu et mon droit",
        "E pluribus unum",
        "In God we trust",
      ],
      correctAnswer: "Liberté, Égalité, Fraternité",
      category: "Culture générale",
      difficulty: "easy",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Qui a développé la théorie de la relativité ?",
      options: [
        "Isaac Newton",
        "Albert Einstein",
        "Galileo Galilei",
        "Stephen Hawking",
      ],
      correctAnswer: "Albert Einstein",
      category: "Science",
      difficulty: "medium",
      timeLimit: 30,
    },
    {
      id: uuidv4(),
      question: "Quel est le plus long fleuve du monde ?",
      options: ["Amazone", "Nil", "Mississippi", "Yangtsé"],
      correctAnswer: "Nil",
      category: "Géographie",
      difficulty: "medium",
      timeLimit: 30,
    },
  ];

  async getQuestions(settings: GameSettings): Promise<Question[]> {
    console.log("Récupération des questions avec les paramètres:", settings);

    try {
      const triviaQuestions = await this.fetchFromTriviaAPI(settings);
      if (triviaQuestions.length >= settings.questionCount) {
        console.log(
          `✅ ${triviaQuestions.length} questions récupérées depuis Open Trivia DB`
        );
        return triviaQuestions.slice(0, settings.questionCount);
      }

      const quizAPIQuestions = await this.fetchFromQuizAPI(settings);
      if (quizAPIQuestions.length >= settings.questionCount) {
        console.log(
          `✅ ${quizAPIQuestions.length} questions récupérées depuis QuizAPI`
        );
        return quizAPIQuestions.slice(0, settings.questionCount);
      }

      const combinedQuestions = [...triviaQuestions, ...quizAPIQuestions];
      if (combinedQuestions.length >= settings.questionCount) {
        console.log(
          `✅ ${combinedQuestions.length} questions combinées des APIs`
        );
        return combinedQuestions.slice(0, settings.questionCount);
      }
    } catch (error) {
      console.warn("❌ Erreur lors de la récupération depuis les APIs:", error);
    }

    console.log("📚 Utilisation des questions de fallback");
    return this.getFallbackQuestions(settings);
  }

  private async fetchFromTriviaAPI(
    settings: GameSettings
  ): Promise<Question[]> {
    try {
      const baseUrl = "https://opentdb.com/api.php";
      const params = new URLSearchParams({
        amount: Math.min(settings.questionCount, 50).toString(),
        type: "multiple",
      });

      if (settings.category && settings.category !== "any") {
        params.append("category", settings.category);
      }

      if (settings.difficulty && settings.difficulty !== "mixed") {
        params.append("difficulty", settings.difficulty);
      }

      const url = `${baseUrl}?${params}`;
      console.log("🌐 Requête Open Trivia DB:", url);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "QuizMaster/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as TriviaResponse;

      if (data.response_code !== 0) {
        console.warn(`⚠️ Open Trivia DB error code: ${data.response_code}`);
        return [];
      }

      return data.results.map((q) =>
        this.transformTriviaQuestion(q, settings.timePerQuestion)
      );
    } catch (error) {
      console.error("❌ Erreur Open Trivia DB:", error);
      return [];
    }
  }

  private async fetchFromQuizAPI(settings: GameSettings): Promise<Question[]> {
    try {
      const baseUrl = "https://quizapi.io/api/v1/questions";
      const params = new URLSearchParams({
        limit: Math.min(settings.questionCount, 20).toString(),
      });

      const categoryMap: { [key: string]: string } = {
        "9": "general_knowledge",
        "17": "science",
        "21": "sport_and_leisure",
        "22": "geography",
        "23": "history",
        "25": "art_and_literature",
        "27": "animals",
      };

      if (
        settings.category &&
        settings.category !== "any" &&
        categoryMap[settings.category]
      ) {
        params.append("category", categoryMap[settings.category]);
      }

      if (settings.difficulty && settings.difficulty !== "mixed") {
        params.append("difficulty", settings.difficulty);
      }

      const url = `${baseUrl}?${params}`;
      console.log("🌐 Requête QuizAPI:", url);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "QuizMaster/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as QuizAPIQuestion[];

      if (!Array.isArray(data)) {
        console.warn("⚠️ QuizAPI: Réponse invalide");
        return [];
      }

      return data
        .filter((q) => q.multiple_correct_answers === "false")
        .map((q) => this.transformQuizAPIQuestion(q, settings.timePerQuestion))
        .filter((q) => q.options.length === 4);
    } catch (error) {
      console.error("❌ Erreur QuizAPI:", error);
      return [];
    }
  }

  private transformTriviaQuestion(
    triviaQ: TriviaQuestion,
    timeLimit: number
  ): Question {
    const decodeHtml = (html: string) => {
      return html
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ");
    };

    const options = [...triviaQ.incorrect_answers, triviaQ.correct_answer]
      .map(decodeHtml)
      .sort(() => Math.random() - 0.5);

    return {
      id: uuidv4(),
      question: decodeHtml(triviaQ.question),
      options,
      correctAnswer: decodeHtml(triviaQ.correct_answer),
      category: decodeHtml(triviaQ.category),
      difficulty: triviaQ.difficulty as "easy" | "medium" | "hard",
      timeLimit,
    };
  }

  private transformQuizAPIQuestion(
    quizQ: QuizAPIQuestion,
    timeLimit: number
  ): Question {
    const answers = Object.entries(quizQ.answers)
      .filter(([_, value]) => value !== null && value.trim() !== "")
      .map(([_, value]) => value as string);

    const correctAnswerKey = Object.entries(quizQ.correct_answers).find(
      ([_, value]) => value === "true"
    )?.[0];

    if (!correctAnswerKey) {
      throw new Error("Pas de bonne réponse trouvée");
    }

    const answerKey = correctAnswerKey.replace(
      "_correct",
      ""
    ) as keyof typeof quizQ.answers;
    const correctAnswer = quizQ.answers[answerKey];

    if (!correctAnswer) {
      throw new Error("Bonne réponse invalide");
    }

    const options = answers.sort(() => Math.random() - 0.5);

    return {
      id: uuidv4(),
      question: quizQ.question,
      options,
      correctAnswer,
      category: quizQ.category || "Général",
      difficulty: (quizQ.difficulty || "medium") as "easy" | "medium" | "hard",
      timeLimit,
    };
  }

  private getFallbackQuestions(settings: GameSettings): Question[] {
    let questions = [...this.fallbackQuestions];

    if (settings.difficulty && settings.difficulty !== "mixed") {
      questions = questions.filter((q) => q.difficulty === settings.difficulty);
    }

    questions = questions.sort(() => Math.random() - 0.5);

    const selectedQuestions = questions.slice(0, settings.questionCount);

    while (selectedQuestions.length < settings.questionCount) {
      const remaining = settings.questionCount - selectedQuestions.length;
      const toAdd = questions.slice(0, remaining);
      selectedQuestions.push(...toAdd.map((q) => ({ ...q, id: uuidv4() })));
    }

    return selectedQuestions.map((q) => ({
      ...q,
      timeLimit: settings.timePerQuestion,
    }));
  }

  addCustomQuestions(questions: Omit<Question, "id">[]): void {
    const questionsWithId = questions.map((q) => ({
      ...q,
      id: uuidv4(),
    }));
    this.fallbackQuestions.push(...questionsWithId);
  }

  getAvailableCategories(): { id: string; name: string }[] {
    return [
      { id: "any", name: "Toutes catégories" },
      { id: "9", name: "Culture générale" },
      { id: "17", name: "Science & Nature" },
      { id: "21", name: "Sports" },
      { id: "22", name: "Géographie" },
      { id: "23", name: "Histoire" },
      { id: "24", name: "Politique" },
      { id: "25", name: "Art & Littérature" },
      { id: "26", name: "Célébrités" },
      { id: "27", name: "Animaux" },
    ];
  }

  getQuestionStats(): {
    total: number;
    byCategory: { [key: string]: number };
    byDifficulty: { [key: string]: number };
  } {
    const byCategory: { [key: string]: number } = {};
    const byDifficulty: { [key: string]: number } = {};

    this.fallbackQuestions.forEach((q) => {
      byCategory[q.category] = (byCategory[q.category] || 0) + 1;
      byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    });

    return {
      total: this.fallbackQuestions.length,
      byCategory,
      byDifficulty,
    };
  }
}
