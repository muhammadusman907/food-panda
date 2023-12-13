import {
    getAuth, createUserWithEmailAndPassword, auth, signInWithEmailAndPassword, onAuthStateChanged,signOut ,
    db, getFirestore, collection, addDoc, doc, onSnapshot
} from "./firebase.js";
// ==========================================================================
// ================================ signup create user ======================
// ==========================================================================
// ========================================================
// 1: sign page get ids & value (email , password , button)

let signupEmail = document.getElementById("signup-email");
let signupPassword = document.getElementById("signup-password");
let signupBtn = document.getElementById("signup-btn");
let signupUserName = document.getElementById("signup-user-name");


// ================================
// 2: click sign up btn create user

signupBtn && signupBtn.addEventListener("click", () => {
    //===================================================
    //  3: check value console (email , password , value)
    console.log(signupEmail.value, signupPassword.value, signupBtn)
    createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value)
        .then(async (userCredential) => {
            // ====================
            // 4: Signed up check user
            const user = userCredential.user;
            console.log("signup user sucess --->", user)
            // =========================
            // USER NAME DATA BASE SAVE
            try {
                const docRef = await addDoc(collection(db, "userData"), {
                    signup_user_name: signupUserName.value,
                    signup_email: signupEmail.value
                });
                console.log("Document written with ID: ", docRef.id);
                // ====================================================
                // SET ID LOCAL STORAGE PROBLEM DATA BASE ON AUTH CHANGE
                localStorage.setItem("userId", docRef.id)
                if (docRef.id) {
                    location.href = "./profile.html"
                }
            } catch (e) {
                console.error("Error adding document: ", e);
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("signup user error --->", errorMessage)
        });

})
// ===================== sign up compete ========================== 
// =====================******************=========================

// ===============================================================
// ============================LOGIN PAGE=========================
// ===============================================================

// ========================================================
// 1: sign page get ids & value (email , password , button)

let loginEmail = document.getElementById("login-email");
let loginPassword = document.getElementById("login-password");
let loginBtn = document.getElementById("login-btn");

// 2: click sign in check user to login

loginBtn && loginBtn.addEventListener("click", () => {
    //===================================================
    //  3: check value console (email , password , value)
    console.log(loginEmail.value, loginPassword.value)

    signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
        .then((userCredential) => {
            // Signed in user 
            const user = userCredential.user;
            console.log("login check user --->", user)
            location.href = "./profile.html"
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("login user error----> ", errorMessage)
        });
})
// ===========================================================
// ==================== on auth change =======================
// ===========================================================

// ===========================================================
// =================== PROFILE PAGE GET IDS ==================
// ===========================================================
let profileUsername = document.getElementById("profile-user-name");
let profileEmail = document.getElementById("profile-email");
onAuthStateChanged(auth, (user) => {
    // =============================
    // 1 : LOCAL STORAGE GET USER ID 
    let localStorageuserId = JSON.parse(localStorage.getItem("userId"))
    //  ========================
    //  2 : CHECK CONDITON  
    if (user && localStorageuserId) {
        const uid = user.uid;
        //  CHANGE LOCATION 
        if (location.pathname !== "/profile.html")
            location.href = "./profile.html";
        const unsub = onSnapshot(doc(db, "userData", localStorageuserId), (doc) => {
            console.log(profileUsername)
                 profileUsername.value = doc.data().signup_user_name;
                 profileEmail.value = doc.data().signup_email;
            console.log("Current data------>: ", doc.data());
        });
        console.log(uid)
    } else {
        if (location.pathname !== "/login.html" && location.pathname !== "/signup.html") {
            window.location.href = "./login.html"
        }
        // User is signed out
        // ...
    }
});
// =====================================================================
// ====================================== Logout =======================
// =====================================================================
let logOutBtn = document.getElementById("logout-btn");
logOutBtn.addEventListener("click", ()=>{
    signOut(auth).then(() => {
        // Sign-out successful.
        location.href = "./login.html"
    }).catch((error) => {
  // An error happened.
});
})

// 