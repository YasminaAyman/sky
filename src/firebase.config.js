import firebase from 'firebase'
var firebaseConfig = {
  apiKey: "AIzaSyAxLze_gV7pnMXIefYFhu7vHYzHAMnj33o",
  authDomain: "sky-express-bea7b.firebaseapp.com",
  projectId: "sky-express-bea7b",
  storageBucket: "sky-express-bea7b.appspot.com",
  messagingSenderId: "626924922184",
  appId: "1:626924922184:web:c01ba5d71d18d3218a3f7d",
  measurementId: "G-VFHG5YQES4"
  };
  
const firebaseApp=firebase.initializeApp(firebaseConfig);
const db=firebase.firestore();

export default db;
