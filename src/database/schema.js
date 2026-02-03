// Database Schema using IndexedDB for client-side persistence
let db = null;
const DB_NAME = 'GDADatabase';
const DB_VERSION = 3; // Updated for profile & FTUE features

// Initialize IndexedDB
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      // Drop old stores if they exist (for schema updates)
      if (event.oldVersion > 0 && event.oldVersion < 3) { // Only drop if upgrading from v1 or v2
        if (db.objectStoreNames.contains('games')) {
          db.deleteObjectStore('games');
        }
        if (db.objectStoreNames.contains('missions')) {
          db.deleteObjectStore('missions');
        }
      }

      // Users Table
      if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        usersStore.createIndex('email', 'email', { unique: true });
        usersStore.createIndex('username', 'username', { unique: true });
      }

      // Games Table - Updated with genres array
      if (!db.objectStoreNames.contains('games')) {
        const gamesStore = db.createObjectStore('games', { keyPath: 'id', autoIncrement: true });
        gamesStore.createIndex('title', 'title', { unique: true }); // Changed to unique
        gamesStore.createIndex('platform', 'platform', { unique: false, multiEntry: true });
        gamesStore.createIndex('genres', 'genres', { unique: false, multiEntry: true }); // Changed from 'genre'
      }

      // Missions Table - Updated with uiType index
      if (!db.objectStoreNames.contains('missions')) {
        const missionsStore = db.createObjectStore('missions', { keyPath: 'id', autoIncrement: true });
        missionsStore.createIndex('gameId', 'gameId', { unique: false });
        missionsStore.createIndex('difficulty', 'difficulty', { unique: false });
        missionsStore.createIndex('uiType', 'uiType', { unique: false }); // Added
        missionsStore.createIndex('status', 'status', { unique: false }); // Added
      }

      // Submissions Table
      if (!db.objectStoreNames.contains('submissions')) {
        const submissionsStore = db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true });
        submissionsStore.createIndex('userId', 'userId', { unique: false });
        submissionsStore.createIndex('missionId', 'missionId', { unique: false });
        submissionsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // AI Feedback Table
      if (!db.objectStoreNames.contains('ai_feedback')) {
        const feedbackStore = db.createObjectStore('ai_feedback', { keyPath: 'id', autoIncrement: true });
        feedbackStore.createIndex('submissionId', 'submissionId', { unique: false });
      }
    };
  });
};

// Database operations
export const dbOperations = {
  add: (storeName, data) => {
    return new Promise((resolve, reject) => {
      initDatabase().then(db => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  get: (storeName, id) => {
    return new Promise((resolve, reject) => {
      initDatabase().then(db => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  getAll: (storeName) => {
    return new Promise((resolve, reject) => {
      initDatabase().then(db => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  update: (storeName, id, data) => {
    return new Promise((resolve, reject) => {
      initDatabase().then(db => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        // Ensure id is in the data object
        const dataWithId = { ...data, id };
        const request = store.put(dataWithId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }).catch(reject);
    });
  },

  delete: (storeName, id) => {
    return new Promise((resolve, reject) => {
      initDatabase().then(db => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  clear: (storeName) => {
    return new Promise((resolve, reject) => {
      initDatabase().then(db => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  query: (storeName, indexName, value) => {
    return new Promise((resolve, reject) => {
      initDatabase().then(db => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  },

  // Clear entire database
  clearDatabase: async () => {
    const db = await initDatabase();
    const storeNames = ['users', 'games', 'missions', 'submissions', 'ai_feedback'];

    for (const storeName of storeNames) {
      if (db.objectStoreNames.contains(storeName)) {
        await dbOperations.clear(storeName);
      }
    }
    console.log('🗑️ Database cleared');
  }
};
