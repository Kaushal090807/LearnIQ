const content = document.getElementById("pageContent");
let currentPage = "dashboard";
let practiceSubject = "";
let currentQuestion = null;
let selectedAnswer = null;
let chartInstance = null;
const titles = { dashboard:"Dashboard", subjects:"My subjects", assessment:"Assessment", planner:"Study planner", practice:"Practice", progress:"Progress" };
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[ch]));

function getProfile() {
  try { return JSON.parse(localStorage.getItem("learniq_profile")) || { name:"Student", level:"School / College" }; }
  catch { return { name:"Student", level:"School / College" }; }
}
function saveProfile() {
  const profile = getProfile();
  ["profileName"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = profile.name; });
  ["profileLevel"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = profile.level; });
  ["userAvatar","topbarAvatar"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = (profile.name || "S").trim().charAt(0).toUpperCase(); });
}
function navigate(page) {
  if (!titles[page]) return;
  currentPage = page;
  document.querySelectorAll(".nav-item[data-page]").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));
  $("#pageTitle").textContent = titles[page];
  $("#currentSection").textContent = page === "dashboard" ? "OVERVIEW" : "YOUR LEARNING";
  renderPage();
}
function renderPage() {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  ({ dashboard:renderDashboard, subjects:renderSubjects, assessment:renderAssessment, planner:renderPlanner, practice:renderPractice, progress:renderProgress }[currentPage] || renderDashboard)();
}
function metricCard(label, value, note) {
  return `<article class="card span-3"><div class="metric-label">${label}</div><div class="metric">${value}</div><div class="metric-label">${note}</div></article>`;
}
function renderDashboard() {
  const results = Engine.getResults(), weak = Engine.getWeakTopics(), mastery = Engine.getOverallMastery();
  const all = Engine.getAllMastery();
  content.innerHTML = `<div class="grid">
    ${metricCard("OVERALL MASTERY", `${mastery}%`, "Across practiced topics")}
    ${metricCard("QUESTIONS ANSWERED", results.length, "Keep building your streak")}
    ${metricCard("TOPICS TRACKED", all.length, "Topics with practice activity")}
    ${metricCard("NEEDS ATTENTION", weak.length, "Topics below 70% mastery")}
    <article class="card span-7"><div class="section-head"><h3>Learning overview</h3><span class="pill">LIVE FROM YOUR PRACTICE</span></div><p>Your dashboard updates as you answer practice and assessment questions.</p><div class="progress-track"><div class="progress-fill" style="width:${mastery}%"></div></div><strong class="green">${mastery}% overall mastery</strong><p><button class="small-btn" data-go="assessment">Start diagnostic assessment</button> <button class="small-btn" data-go="practice">Practice now</button></p></article>
    <article class="card span-5"><h3>Focus topics</h3>${weak.length ? weak.slice(0,4).map(t=>`<div class="topic-row"><span>${escapeHTML(t.topic)} <small class="muted">· ${escapeHTML(t.subject)}</small></span><strong class="danger-text">${t.mastery}%</strong></div>`).join("") : `<p class="empty">No weak topics identified yet. Complete some practice questions to get personalized recommendations.</p>`}</article>
    <article class="card span-12"><div class="section-head"><h3>Your subjects</h3><button class="small-btn" data-go="subjects">View subjects</button></div>${initialSubjects.map(s=>`<div class="subject-row"><div><strong>${escapeHTML(s.name)}</strong><small>${escapeHTML(s.description)}</small></div><button class="small-btn" data-practice-subject="${escapeHTML(s.name)}">Practice</button></div>`).join("")}</article>
  </div>`;
}
function renderSubjects() {
  content.innerHTML = `<div class="grid">${initialSubjects.map(s=>`<article class="card span-4"><div class="section-head"><h3>${escapeHTML(s.name)}</h3><span class="pill">${s.topics.length} TOPICS</span></div><p>${escapeHTML(s.description)}</p>${s.topics.map(t=>`<div class="topic-row"><span>${escapeHTML(t)}</span><strong>${Engine.getMastery(s.name,t)}%</strong></div>`).join("")}<button class="small-btn" data-practice-subject="${escapeHTML(s.name)}">Practice subject</button></article>`).join("")}
  <article class="card span-12"><p class="notice">This starter repository includes sample subjects and questions. Replace the curriculum in <code>js/data.js</code> with the syllabus you want to support.</p></article></div>`;
}
function renderAssessment() {
  content.innerHTML = `<div class="grid"><article class="card span-8"><span class="pill">STARTER DIAGNOSTIC</span><h3>Check your current understanding</h3><p>Answer the sample questions. Your results are used to estimate topic mastery and highlight areas to revisit.</p><button class="primary-btn" id="startAssessment">Start 8-question assessment</button><div id="assessmentArea"></div></article><article class="card span-4"><h3>How it works</h3><p>1. Questions sample your listed subjects.<br>2. Correct and incorrect answers update topic mastery.<br>3. Your planner prioritizes topics that need attention.</p></article></div>`;
  $("#startAssessment").addEventListener("click", runAssessment);
}
function runAssessment() {
  const pool = [...questionBank].sort(()=>Math.random()-.5).slice(0, Math.min(8,questionBank.length));
  let index = 0, score = 0;
  const area = $("#assessmentArea");
  function next() {
    if (index >= pool.length) {
      area.innerHTML = `<div class="feedback good">Assessment complete: ${score}/${pool.length} correct. Your topic mastery has been updated.</div><button class="small-btn" data-go="progress">View progress</button>`;
      return;
    }
    const q = pool[index];
    area.innerHTML = `<p class="muted">Question ${index+1} of ${pool.length} · ${escapeHTML(q.subject)} / ${escapeHTML(q.topic)}</p><div class="question">${escapeHTML(q.question)}</div><div class="option-list">${q.options.map((o,i)=>`<button class="option-btn" data-answer="${i}">${escapeHTML(o)}</button>`).join("")}</div><div id="assessmentFeedback"></div>`;
    area.querySelectorAll("[data-answer]").forEach(btn=>btn.addEventListener("click",()=>{
      const correct = Number(btn.dataset.answer) === q.answer;
      if (correct) score++;
      Engine.saveResult(q.subject,q.topic,correct,q.id);
      area.querySelectorAll("[data-answer]").forEach(b=>{b.disabled=true;if(Number(b.dataset.answer)===q.answer)b.classList.add("selected");});
      $("#assessmentFeedback").innerHTML = `<div class="feedback ${correct?"good":"bad"}">${correct?"Correct!":"Not quite."} ${escapeHTML(q.explanation)}</div><button class="small-btn" id="nextQuestion">Continue</button>`;
      $("#nextQuestion").addEventListener("click",()=>{index++;next();});
    }));
  }
  next();
}
function renderPlanner() {
  content.innerHTML = `<div class="grid"><article class="card span-5"><h3>Build a study plan</h3><p>Choose how much time you can study today. The demo planner prioritizes topics where your recorded mastery is lowest.</p><label for="studyHours">Available study hours</label><input id="studyHours" type="number" min="0.5" max="12" step="0.5" value="2"><button class="primary-btn" id="generatePlan">Generate my plan</button></article><article class="card span-7"><h3>Your recommended sessions</h3><div id="scheduleOutput" class="empty">Generate a plan to see your study sessions.</div></article></div>`;
  $("#generatePlan").addEventListener("click",()=>{
    const hours = Math.min(12,Math.max(.5,Number($("#studyHours").value)||2));
    const plan = Engine.generateSchedule(hours);
    $("#scheduleOutput").innerHTML = plan.map((item,i)=>`<div class="subject-row"><div><strong>${i+1}. ${escapeHTML(item.topic)}</strong><small>${escapeHTML(item.subject)} · ${item.mastery}% current mastery</small></div><span class="pill">${item.minutes} min</span></div>`).join("");
  });
}
function renderPractice() {
  content.innerHTML = `<div class="grid"><article class="card span-8"><h3>Practice questions</h3><p>Choose a subject, then load a question. Your answer updates your mastery score.</p><div class="field-row"><select id="practiceSubject"><option value="">All subjects</option>${initialSubjects.map(s=>`<option>${escapeHTML(s.name)}</option>`).join("")}</select><button class="primary-btn" id="loadQuestion">Load question</button></div><div id="practiceArea" class="empty">Select a subject or practice across all subjects.</div></article><article class="card span-4"><h3>Practice tip</h3><p>Try to explain why an answer is correct. Review the explanation after each question and revisit topics with lower mastery.</p></article></div>`;
  $("#practiceSubject").value = practiceSubject;
  $("#loadQuestion").addEventListener("click",()=>loadPracticeQuestion());
}
function loadPracticeQuestion() {
  practiceSubject = $("#practiceSubject").value;
  currentQuestion = Engine.getNextQuestion(practiceSubject || undefined);
  selectedAnswer = null;
  const area = $("#practiceArea");
  if (!currentQuestion) { area.innerHTML = `<p class="empty">No sample questions found for this selection.</p>`; return; }
  area.innerHTML = `<p class="muted">${escapeHTML(currentQuestion.subject)} · ${escapeHTML(currentQuestion.topic)}</p><div class="question">${escapeHTML(currentQuestion.question)}</div><div class="option-list">${currentQuestion.options.map((o,i)=>`<button class="option-btn" data-practice-answer="${i}">${escapeHTML(o)}</button>`).join("")}</div><div id="practiceFeedback"></div>`;
  area.querySelectorAll("[data-practice-answer]").forEach(btn=>btn.addEventListener("click",()=>{
    if (selectedAnswer !== null) return;
    selectedAnswer = Number(btn.dataset.practiceAnswer);
    const correct = selectedAnswer === currentQuestion.answer;
    Engine.saveResult(currentQuestion.subject,currentQuestion.topic,correct,currentQuestion.id);
    area.querySelectorAll("[data-practice-answer]").forEach(b=>{b.disabled=true;if(Number(b.dataset.practiceAnswer)===currentQuestion.answer)b.classList.add("selected");});
    $("#practiceFeedback").innerHTML = `<div class="feedback ${correct?"good":"bad"}">${correct?"Correct!":"Incorrect."} ${escapeHTML(currentQuestion.explanation)}</div><button class="small-btn" id="anotherQuestion">Next question</button>`;
    $("#anotherQuestion").addEventListener("click",()=>loadPracticeQuestion());
  }));
}
function renderProgress() {
  const all = Engine.getAllMastery(), results = Engine.getResults();
  content.innerHTML = `<div class="grid"><article class="card span-12"><div class="section-head"><h3>Topic mastery</h3><span class="pill">${results.length} ANSWERS RECORDED</span></div>${all.length?`<div class="chart-wrap"><canvas id="masteryChart" aria-label="Topic mastery chart"></canvas></div>`:`<p class="empty">No progress data yet. Complete an assessment or practice session to see your progress.</p>`}</article><article class="card span-12"><h3>Detailed breakdown</h3>${all.length?`<table class="table-like"><thead><tr><th>Subject</th><th>Topic</th><th>Mastery</th><th>Attempts</th></tr></thead><tbody>${all.map(t=>`<tr><td>${escapeHTML(t.subject)}</td><td>${escapeHTML(t.topic)}</td><td>${t.mastery}%</td><td>${t.total}</td></tr>`).join("")}</tbody></table>`:`<p class="empty">Your topic breakdown will appear here.</p>`}</article></div>`;
  if (all.length && window.Chart) {
    chartInstance = new Chart($("#masteryChart"),{type:"bar",data:{labels:all.map(t=>`${t.subject}: ${t.topic}`),datasets:[{label:"Mastery %",data:all.map(t=>t.mastery),backgroundColor:"#35c98b",borderRadius:7}]},options:{maintainAspectRatio:false,indexAxis:"y",scales:{x:{min:0,max:100,grid:{color:"#20372d"},ticks:{color:"#8da99b"}},y:{grid:{display:false},ticks:{color:"#b8cbbf"}}},plugins:{legend:{labels:{color:"#b8cbbf"}}}}});
  }
}
document.addEventListener("click",event=>{
  const nav = event.target.closest("[data-page]");
  if (nav) navigate(nav.dataset.page);
  const go = event.target.closest("[data-go]");
  if (go) { event.preventDefault(); navigate(go.dataset.go); }
  const practice = event.target.closest("[data-practice-subject]");
  if (practice) { practiceSubject = practice.dataset.practiceSubject; navigate("practice"); setTimeout(()=>{ if ($("#practiceSubject")) { $("#practiceSubject").value=practiceSubject; loadPracticeQuestion(); } },0); }
});
$("#settingsBtn").addEventListener("click",()=>{
  const profile=getProfile(), name=prompt("What should we call you?",profile.name), level=prompt("School / College / other learning level:",profile.level);
  if(name && name.trim()) { localStorage.setItem("learniq_profile",JSON.stringify({name:name.trim(),level:(level||profile.level).trim()})); saveProfile(); }
});
$("#logoutBtn").addEventListener("click",()=>{localStorage.removeItem("learniq_session");location.reload();});
function initializeApp(){saveProfile();navigate("dashboard");}

