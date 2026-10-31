// Frontend-only demo auth. Replace with a real backend before using real accounts.
(() => {
  const authScreen = document.getElementById("authScreen");
  const appShell = document.getElementById("appShell");
  const form = document.getElementById("authForm");
  const message = document.getElementById("authMessage");
  const nameInput = document.getElementById("authName");
  const nameLabel = document.getElementById("nameLabel");
  const submit = document.getElementById("authSubmit");
  let mode = "login";

  function setMode(nextMode) {
    mode = nextMode;
    document.querySelectorAll("[data-auth-mode]").forEach(btn=>btn.classList.toggle("active",btn.dataset.authMode===mode));
    nameInput.classList.toggle("hidden",mode!=="signup");
    nameLabel.classList.toggle("hidden",mode!=="signup");
    nameInput.required = mode==="signup";
    submit.textContent = mode==="signup" ? "Create demo account" : "Enter LearnIQ";
    message.textContent = "";
  }
  document.querySelectorAll("[data-auth-mode]").forEach(btn=>btn.addEventListener("click",()=>setMode(btn.dataset.authMode)));

  function enterApp(profile) {
    localStorage.setItem("learniq_profile",JSON.stringify(profile));
    localStorage.setItem("learniq_session","active");
    authScreen.classList.add("hidden");
    appShell.classList.remove("hidden");
    if (typeof initializeApp==="function") initializeApp();
  }
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const email=document.getElementById("authEmail").value.trim().toLowerCase();
    const password=document.getElementById("authPassword").value;
    if(password.length<6){message.textContent="Use at least 6 characters for this demo.";return;}
    const accounts=JSON.parse(localStorage.getItem("learniq_demo_accounts")||"{}");
    if(mode==="signup"){
      if(accounts[email]){message.textContent="An account for this email already exists.";return;}
      const profile={name:nameInput.value.trim()||"Student",level:"School / College"};
      accounts[email]={password,profile};
      localStorage.setItem("learniq_demo_accounts",JSON.stringify(accounts));
      enterApp(profile);
    } else {
      if(accounts[email] && accounts[email].password!==password){message.textContent="Incorrect demo password.";return;}
      if(accounts[email]) enterApp(accounts[email].profile);
      else enterApp({name:email.split("@")[0]||"Student",level:"School / College"});
    }
  });
  if(localStorage.getItem("learniq_session")==="active"){
    authScreen.classList.add("hidden");appShell.classList.remove("hidden");
    if(typeof initializeApp==="function") initializeApp();
  } else { setMode("login"); }
})();
