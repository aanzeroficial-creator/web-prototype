// Menggunakan Firebase Compat Library (dimuat dari CDN di HTML)
// Tidak perlu import module, objek 'firebase' sudah tersedia secara global.

// Konfigurasi Web App Firebase (Proyek Baru: database-finansial)
const firebaseConfig = {
  apiKey: "AIzaSyDIWFfb80WeQ30BcxtdmDVBoJWgG_LhjZg",
  authDomain: "database-finansial.firebaseapp.com",
  projectId: "database-finansial",
  storageBucket: "database-finansial.firebasestorage.app",
  messagingSenderId: "295630612270",
  appId: "1:295630612270:web:89f1a3a2cb8d2656157cbf",
  measurementId: "G-D8MGC1X87Q"
};

// Inisialisasi Firebase App
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Inisialisasi Firestore
const db = firebase.firestore();

// Referensi Koleksi
const itemsCol = db.collection("items");
const resultsCol = db.collection("studentResults");
const settingsDoc = db.collection("settings").doc("global");

// =========================================
// 1. DATA BARANG (EKSPLORASI)
// =========================================

// Menyimpan barang baru
window.addItem = async function(item) {
    try {
        item.status = item.status || 'pending';
        item.timestamp = Date.now();
        const docRef = await itemsCol.add(item);
        item.id = docRef.id;
        return item;
    } catch (e) {
        console.error("Error adding document ke Firestore: ", e);
        throw e;
    }
};

// Mengambil seluruh barang
window.getAllItems = async function() {
    try {
        const querySnapshot = await itemsCol.get();
        let items = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });
        // Pastikan status ada (untuk data lama jika ada)
        items = items.map(item => ({...item, status: item.status || 'pending'}));
        // Urutkan berdasarkan waktu (terbaru di atas)
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        return items;
    } catch (e) {
        console.error("Error getting documents dari Firestore: ", e);
        return [];
    }
};

// Menghapus barang permanen
window.deleteItem = async function(id) {
    try {
        await itemsCol.doc(id).delete();
    } catch (e) {
        console.error("Error deleting document dari Firestore: ", e);
    }
};

// Menyetujui barang
window.approveItem = async function(id) {
    try {
        await itemsCol.doc(id).update({
            status: 'approved'
        });
    } catch (e) {
        console.error("Error updating document di Firestore: ", e);
    }
};

// =========================================
// 2. HASIL EVALUASI BELAJAR (KUIS & RENCANA)
// =========================================

window.getStudentResults = async function() {
    try {
        const querySnapshot = await resultsCol.get();
        let results = [];
        querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
        });
        results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        return results;
    } catch (e) {
        console.error("Error getting results dari Firestore: ", e);
        return [];
    }
};

window.saveStudentResult = async function(data) {
    try {
        const record = {
            waktu: new Date().toLocaleString('id-ID'),
            timestamp: Date.now(),
            ...data
        };
        await resultsCol.add(record);
    } catch (e) {
        console.error("Error saving result ke Firestore: ", e);
        throw e;
    }
};

// Menghapus semua hasil evaluasi (batch delete di Firestore)
window.clearStudentResults = async function() {
    try {
        const snapshot = await resultsCol.get();
        const batch = db.batch();
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    } catch (e) {
        console.error("Error clearing results di Firestore: ", e);
    }
};

// =========================================
// 3. PENGATURAN LIMIT FOTO
// =========================================

window.getSettings = async function() {
    try {
        const docSnap = await settingsDoc.get();
        if (docSnap.exists) {
            return docSnap.data();
        } else {
            // Default jika dokumen belum ada di Firestore
            const defaultSettings = { limitFoto: 5 };
            await settingsDoc.set(defaultSettings);
            return defaultSettings;
        }
    } catch (e) {
        console.error("Error getting settings dari Firestore: ", e);
        return { limitFoto: 5 };
    }
};

window.updateLimitFoto = async function(limit) {
    try {
        await settingsDoc.set({ limitFoto: limit }, { merge: true });
    } catch (e) {
        console.error("Error updating settings di Firestore: ", e);
    }
};
