import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAt4dFJOvWQWtZjZowQFlAGRKBCSMDqL14",
  authDomain: "dsa-tracker-57caa.firebaseapp.com",
  databaseURL: "https://dsa-tracker-57caa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dsa-tracker-57caa",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// USER
const uid = localStorage.getItem("uid") || "demo";
const username = localStorage.getItem("username") || "User";

document.getElementById("welcome").innerText = "Welcome, " + username;

// DATA
let questions = [];
let topicsData = {};

// FIXED SELECT
const select = document.getElementById("leetcodeSelect");

// =======================
// LOAD JSON
// =======================
fetch("topics.json")
  .then(res => res.json())
  .then(data => {

    select.innerHTML = `<option value="">Select Problem</option>`;

    data.forEach(section => {
      const topic = section.topic;

      section.problems.forEach(problem => {
        const option = document.createElement("option");
        option.value = problem.title;
        option.innerText = `${problem.title} (${topic})`;
        option.dataset.topic = topic; // optional but useful

        select.appendChild(option);
      });
    });

  });

// =======================
// LOAD FIREBASE DATA
// =======================
function loadData() {
  get(child(ref(db), "users/" + uid))
    .then(snapshot => {
      questions = snapshot.exists() ? snapshot.val().questions || [] : [];
      renderQuestions();
      updateStats();
    });
}

// =======================
// SAVE FIREBASE DATA
// =======================
function saveData() {
  set(ref(db, "users/" + uid), {
    questions
  });
}

// =======================
// ADD QUESTION (FIXED FORM HANDLER)
// =======================
// =======================
// ADD QUESTION
// =======================
document.getElementById("problemForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const questionName = select.value;
  const difficulty = document.getElementById("difficulty").value;
  const status = document.getElementById("status").value;

  if (!questionName) return;

  const topic = getTopic(questionName);

  // Check if question already exists
  const existingQuestion = questions.find(
    q => q.questionName === questionName
  );

  if (existingQuestion) {

    // If already solved, don't allow adding again
    if (existingQuestion.status === "Solved") {
      alert("This question is already solved!");
      return;
    }

    // Update existing record instead of creating duplicate
    existingQuestion.status = status;
    existingQuestion.difficulty = difficulty;

    saveData();
    renderQuestions();
    updateStats();

    alert("Question updated successfully!");
    return;
  }

  // New question
  questions.push({
    questionName,
    topic,
    difficulty,
    status,
    date: new Date().toISOString().split("T")[0]
  });

  saveData();
  renderQuestions();
  updateStats();

  document.getElementById("problemForm").reset();
});
// =======================
// GET TOPIC FROM JSON
// =======================
function getTopic(problemTitle) {
  const option = [...select.options].find(
    opt => opt.value === problemTitle
  );

  return option?.dataset.topic || "Unknown";
}
// =======================
// RENDER TABLE (FIXED)
// =======================
function renderQuestions() {
  const list = document.getElementById("problemList");
  list.innerHTML = "";

  questions.forEach((q, index) => {
    list.innerHTML += `
      <tr>
        <td>${q.questionName}</td>
        <td>${q.topic}</td>
        <td>${q.difficulty}</td>
        <td>${q.status}</td>
        <td><button onclick="deleteQ(${index})">Delete</button></td>
      </tr>
    `;
  });
}


// DELETE
window.deleteQ = function(index) {
  questions.splice(index, 1);
  saveData();
  renderQuestions();
  updateStats();
};

// =======================
// STATS (FIXED)
// =======================
function updateStats() {
  const total = questions.length;
  const solved = questions.filter(q => q.status === "Solved").length;
  const unsolved = total - solved;

  document.getElementById("total").innerText = total;
  document.getElementById("solved").innerText = solved;
  document.getElementById("unsolved").innerText = unsolved;

  const progress = total ? Math.round((solved / total) * 100) : 0;
  document.getElementById("progress").innerText = progress + "%";

  updateDailyGoal();
}

// =======================
// STREAK UI
// =======================
function updateDailyGoal() {
  const today = new Date().toISOString().split("T")[0];

  // count ONLY today's solved questions
  const todaySolved = questions.filter(q =>
    q.status === "Solved" && q.date === today
  ).length;

  document.getElementById("dailySolved").innerText = todaySolved;

  // star fills per day (max 7 questions)
  const percent = Math.min((todaySolved / 7) * 100, 100);
  document.getElementById("starFill").style.width = percent + "%";
}
document.getElementById("logoutBtn").addEventListener("click", () => {
  
  // clear login data
  localStorage.removeItem("uid");
  localStorage.removeItem("username");

  // redirect
  window.location.href = "index.html";
  
});

// =======================
// INIT
// =======================
loadData();