import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
    // my config info
    apiKey: "AIzaSyD4yePz0KdtuhG9Re_Ux6nAxwOQnDpsPS8",
    authDomain: "megachat-13f5a.firebaseapp.com",
    projectId: "megachat-13f5a",
    storageBucket: "megachat-13f5a.appspot.com",
    messagingSenderId: "657999553667",
    appId: "1:657999553667:web:1dd7d99460e09fc12f67b6",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <header>
                <div className="header-title-subtitle">
                    <h1 className="header-title">Logan's Chat Room⚡</h1>
                    <p className="header-message">
                        See more at{" "}
                        <a
                            href="https://logan-murray.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="header-link"
                        >
                            logan-murray.dev
                        </a>
                        .
                    </p>
                </div>

                <SignOut />
            </header>

            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return (
        <>
            <button className="sign-in" onClick={signInWithGoogle}>
                Sign in with Google
            </button>
            <p className="sign-in--message">
                Gotta use Google, sorry. It was the easiest way.
            </p>
        </>
    );
}

function SignOut() {
    return (
        auth.currentUser && (
            <button className="sign-out" onClick={() => auth.signOut()}>
                Sign Out
            </button>
        )
    );
}

function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection("messages");
    const query = messagesRef.orderBy("createdAt").limit(25);

    const [messages] = useCollectionData(query, { idField: "id" });

    const [formValue, setFormValue] = useState("");

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        });

        setFormValue("");
        dummy.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            <main>
                {messages &&
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}

                <span ref={dummy}></span>
            </main>

            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="say something..."
                />

                <button
                    className="send-button"
                    type="submit"
                    disabled={!formValue}
                >
                    🚀
                </button>
            </form>
        </>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
        <>
            <div className={`message ${messageClass}`}>
                <img
                    src={
                        photoURL ||
                        "https://api.adorable.io/avatars/23/abott@adorable.png"
                    }
                    alt="profile avatar"
                />
                <p className="message--text">{text}</p>
            </div>
        </>
    );
}

export default App;
