// LearnIQ's local demo learning engine. Data is saved in this browser's localStorage.
const Engine = (() => {
  const KEY = "learniq_learning_data";
  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || { results: [], mastery: {} }; }
    catch { return { results: [], mastery: {} }; }
  };
  const write = data => localStorage.setItem(KEY, JSON.stringify(data));
  const topicKey = (subject, topic) => `${subject}::${topic}`;
  function saveResult(subject, topic, correct, questionId) {
    const data = read();
    data.results.push({ subject, topic, correct: Boolean(correct), questionId, date: new Date().toISOString() });
    const key = topicKey(subject, topic);
    const previous = data.mastery[key] || { correct: 0, total: 0 };
    previous.total += 1;
    if (correct) previous.correct += 1;
    data.mastery[key] = previous;
    write(data);
  }
  function getResults() { return read().results; }
  function getMastery(subject, topic) {
    const item = read().mastery[topicKey(subject, topic)];
    return item && item.total ? Math.round(item.correct / item.total * 100) : 0;
  }
  function getAllMastery() {
    const data = read().mastery;
    return Object.entries(data).map(([key, value]) => {
      const [subject, topic] = key.split("::");
      return { subject, topic, mastery: value.total ? Math.round(value.correct / value.total * 100) : 0, total: value.total };
    });
  }
  function getOverallMastery() {
    const all = getAllMastery();
    if (!all.length) return 0;
    const total = all.reduce((sum, item) => sum + item.total, 0);
    const correct = all.reduce((sum, item) => sum + Math.round(item.mastery * item.total / 100), 0);
    return total ? Math.round(correct / total * 100) : 0;
  }
  function getWeakTopics() { return getAllMastery().filter(item => item.total >= 1 && item.mastery < 70).sort((a,b) => a.mastery - b.mastery); }
  function generateSchedule(hours) {
    const weak = getWeakTopics();
    const topics = weak.length ? weak.slice(0, 4) : initialSubjects.flatMap(s => s.topics.slice(0,1).map(topic => ({ subject:s.name, topic, mastery:0 })));
    const minutes = Math.max(30, Math.round(Number(hours || 1) * 60));
    const each = Math.floor(minutes / topics.length);
    return topics.map(item => ({ ...item, minutes: each }));
  }
  function getNextQuestion(subject, topic) {
    const candidates = questionBank.filter(q => (!subject || q.subject === subject) && (!topic || q.topic === topic));
    if (!candidates.length) return null;
    const results = getResults();
    const recentIds = results.slice(-candidates.length).map(r => r.questionId);
    return candidates.find(q => !recentIds.includes(q.id)) || candidates[Math.floor(Math.random() * candidates.length)];
  }
  return { saveResult, getResults, getMastery, getAllMastery, getOverallMastery, getWeakTopics, generateSchedule, getNextQuestion };
})();
