import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAt4dFJOvWQWtZjZowQFlAGRKBCSMDqL14",
  authDomain: "dsa-tracker-57caa.firebaseapp.com",
  databaseURL: "https://dsa-tracker-57caa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dsa-tracker-57caa",
  storageBucket: "dsa-tracker-57caa.firebasestorage.app",
  messagingSenderId: "117888361822",
  appId: "1:117888361822:web:d8dbc04e468aef0c881bcf",
  measurementId: "G-VDLRX6THS9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const btn = document.getElementById("googleLogin");

btn.addEventListener("click", async () => {

  btn.disabled = true;

  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    // store ONLY identity
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("username", user.displayName);

    window.location.href = "dashboard.html";

  } catch (error) {
    console.log(error.message);
    alert(error.message);
  }

  btn.disabled = false;
});