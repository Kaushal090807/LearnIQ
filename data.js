// Starter curriculum and a small sample question bank. Add/edit topics to match a learner's syllabus.
const initialSubjects = [
  { id: "math", name: "Mathematics", description: "Algebra, geometry and number skills", topics: ["Algebra", "Geometry", "Fractions"] },
  { id: "science", name: "Science", description: "Physics, chemistry and biology foundations", topics: ["Physics", "Chemistry", "Biology"] },
  { id: "english", name: "English", description: "Reading, grammar and writing", topics: ["Grammar", "Comprehension", "Writing"] }
];

const questionBank = [
  { id: 1, subject: "Mathematics", topic: "Algebra", question: "Solve: 3x + 5 = 20", options: ["x = 3", "x = 5", "x = 7", "x = ฟ"], answer: 1, explanation: "Subtract 5 from both sides, then divide by 3. x = 5." },
  { id: 2, subject: "Mathematics", topic: "Fractions", question: "What is 1/2 + 1/4?", options: ["1/4", "2/6", "3/4", "1"], answer: 2, explanation: "Convert 1/2 to 2/4. Then 2/4 + 1/4 = 3/4." },
  { id: 3, subject: "Mathematics", topic: "Geometry", question: "How many degrees are in the interior angles of a triangle?", options: ["90°", "180°", "270°", "360°"], answer: 1, explanation: "The interior angles of every triangle sum to 180°." },
  { id: 4, subject: "Science", topic: "Physics", question: "What is the SI unit of force?", options: ["Joule", "Watt", "Newton", "Pascal"], answer: 2, explanation: "Force is measured in newtons (N)." },
  { id: 5, subject: "Science", topic: "Chemistry", question: "What is the chemical symbol for oxygen?", options: ["Ox", "O", "Og", "Oy"], answer: 1, explanation: "The chemical symbol for oxygen is O." },
  { id: 6, subject: "Science", topic: "Biology", question: "Which cell structure contains most genetic information?", options: ["Nucleus", "Cell wall", "Ribosome", "Vacuole"], answer: 0, explanation: "In eukaryotic cells, most DNA is stored in the nucleus." },
  { id: 7, subject: "English", topic: "Grammar", question: "Choose the grammatically correct sentence.", options: ["She go to class.", "She goes to class.", "She going class.", "She gone to class."], answer: 1, explanation: "With 'she' in the simple present, the verb takes -s: goes." },
  { id: 8, subject: "English", topic: "Comprehension", question: "What is the main idea of a passage?", options: ["A minor detail", "The central point", "The final word", "The author's name"], answer: 1, explanation: "The main idea is the central point the passage communicates." },
  { id: 9, subject: "English", topic: "Writing", question: "Which is the clearest topic sentence?", options: ["There are many things.", "This paragraph is about it.", "Regular reading improves vocabulary and focus.", "And then it happened."], answer: 2, explanation: "A strong topic sentence clearly states the paragraph's main point." }
];
