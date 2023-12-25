import {
    getAuth, createUserWithEmailAndPassword, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
    db, getFirestore, collection, addDoc, doc, onSnapshot, setDoc, getDoc, updateDoc,
    storage, ref, uploadBytesResumable, getDownloadURL
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
let profileImage = document.getElementById("profile-image");

// ================================
// 2: click sign up btn create user

signupBtn && signupBtn.addEventListener("click", () => {
    //===================================================
    //  3: check value console (email , password , value)
    console.log(signupEmail.value, signupPassword.value, signupBtn)
    if (signupEmail.value.trim() === "") {
        alert("empty email")
    }
    else if (signupPassword.value.trim() === "") {
        alert("empty password")
    }
    else if (signupUserName.value.trim() === "") {
        alert("empty name")
    }
    else {

        createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value)
            .then(async (userCredential) => {
                // ====================
                // 4: Signed up check user
                const user = userCredential.user;
                console.log("signup user sucess --->", user)
                // =========================
                // USER NAME DATA BASE SAVE
                await setDoc(doc(db, "userData", auth.currentUser.uid), {
                    user_email: signupEmail.value,
                    user_name: signupUserName.value
                });

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log("signup user error --->", errorMessage)
                alert(errorCode)
            });
    }
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
    if (loginEmail.value.trim() === "") {
        alert("empty email")
    }
    else if (loginPassword.value.trim() === "") {
        alert("empty password")
    }
    else {
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
                alert(errorCode)
            });
    }
});
// ===========================================================
// ==================== on auth change =======================
// ===========================================================

// ===========================================================
// =================== PROFILE PAGE GET IDS ==================
// ===========================================================
let profileUsername = document.getElementById("profile-user-name");
let profileEmail = document.getElementById("profile-email");
onAuthStateChanged(auth, async (user) => {
    // =============================
    if (user) {
        const docRef = doc(db, "userData", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        //  ========================
        // 1 : GET DATA FIRE BABSE
        //  2 : CHECK CONDITON AGAR USER KA DATA FIRE STORE MAI HO TO PHIR USA PROFILE PAR JANA DO
        if (docSnap.exists()) {
            // 3: PHIR LOCATION CHANGE KARI HAI  
            if (location.pathname !== "/profile.html") {
                location.href = "./profile.html";
            }
            //4: YA DATA FIRE STORE SA A RHA HA OR PROFILE PAR RENDER HO RAHA HAI
            profileUsername.value = docSnap.data().user_name;
            profileEmail.value = docSnap.data().user_email;
            if (docSnap.data().photoUrl) {
                profileImage.src = docSnap.data().photoUrl;
            }
            console.log("Current data------>: ", docSnap.data());
        } else {
            // docSnap.data() will be undefined in this case
            //5: AGAR FIRE STORE MAI DATA NI HOA TO USER WAPIS LOGIN PAGE PAR JAY GA 
            console.log("No such document!");
            if (location.pathname !== "/login.html" && location.pathname !== "/signup.html") {
                window.location.href = "./login.html"
            }
        }

    } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        //6: AGAR USER  NI HOA TO USER WAPIS LOGIN PAGE PAR JAY GA 
        if (location.pathname !== "/login.html" && location.pathname !== "/signup.html") {
            window.location.href = "./login.html"
        }
    }
});
// =====================================================================
// ====================================== Logout =======================
// =====================================================================
let logOutBtn = document.getElementById("logout-btn");
logOutBtn && logOutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
        // Sign-out successful.
        alert("logout successfully")
        location.href = "./login.html"
        
    }).catch((error) => {
        alert(error)
        // An error happened.
    });
})
// ================================================================================
//============================= UDAPTE PROFILE ====================================
// ================================================================================
// 1: GET IDS 
let profileImageFile = document.getElementById("profile-image-file");

profileImageFile && profileImageFile.addEventListener("change", () => {
    console.log(event.target.files[0]);
    profileImage.src = URL.createObjectURL(event.target.files[0]);
})
// ========================================================
// 2: ======================== PROFILE STORAGE FUNCTON WITH 
let profileImageFunction = (file) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, 'images/786');

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                reject(error)
            },
            () => {

                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    resolve(downloadURL)
                });
            }
        );

    })
};
// ========================= UPDATE BUTTON CLICK 
// =============================================
let updateProfileBtn = document.getElementById("update-profile-btn");
updateProfileBtn && updateProfileBtn.addEventListener("click", async () => {
    try {
        let photoUrl = await profileImageFunction(profileImageFile.files[0]);
        const UserImageRef = doc(db, "userData", auth.currentUser.uid);
        await updateDoc(UserImageRef, {
            photoUrl
        });
        alert("profile updated")
        console.log(photoUrl);
        console.log(profileEmail.value, profileUsername.value);
    }
    catch (error) {
        console.log(error);
    }
})
