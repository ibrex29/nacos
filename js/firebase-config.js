const firebaseConfig = {
    apiKey: "AIzaSyBUxzNizGlNQRHV2frsUdf2822ceBpJFV8",
    authDomain: "iseyc-e1a73.firebaseapp.com",
    projectId: "iseyc-e1a73",
    storageBucket: "iseyc-e1a73.firebasestorage.app",
    messagingSenderId: "22743214339",
    appId: "1:22743214339:web:9ced8443174a620173e136",
    measurementId: "G-PKS0Q9EJ94"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// Utility functions that can be used across pages
const FirebaseUtils = {
    // Format Firestore timestamp to readable date
    formatDate: function (timestamp) {
        if (!timestamp) return 'TBD';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    },

    // Add document to any collection
    addDocument: async function (collection, data) {
        try {
            const docRef = await db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error(`Error adding document to ${collection}:`, error);
            return { success: false, error: error.message };
        }
    },

    // Get all documents from a collection
    getCollection: async function (collection) {
        try {
            const snapshot = await db.collection(collection).get();
            const documents = [];
            snapshot.forEach(doc => {
                documents.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, data: documents };
        } catch (error) {
            console.error(`Error fetching ${collection}:`, error);
            return { success: false, error: error.message };
        }
    },

    // Show success message
    showSuccess: function (message) {
        // You can customize this based on your UI framework
        alert(`✅ ${message}`);
    },

    // Show error message
    showError: function (message) {
        // You can customize this based on your UI framework
        alert(`❌ ${message}`);
    }
};