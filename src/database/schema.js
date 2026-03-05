// Database Schema using IndexedDB for client-side persistence
let db = null;
const DB_NAME = 'GDADatabase';
const DB_VERSION = 5; // Updated for Admin Panel Features

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
      if (event.oldVersion > 0 && event.oldVersion < 3) {
        if (db.objectStoreNames.contains('games')) db.deleteObjectStore('games');
        if (db.objectStoreNames.contains('missions')) db.deleteObjectStore('missions');
      }

      // Users Table
      if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        usersStore.createIndex('email', 'email', { unique: true });
        usersStore.createIndex('username', 'username', { unique: true });
      }

      // Games Table
      if (!db.objectStoreNames.contains('games')) {
        const gamesStore = db.createObjectStore('games', { keyPath: 'id', autoIncrement: true });
        gamesStore.createIndex('title', 'title', { unique: true });
        gamesStore.createIndex('platform', 'platform', { unique: false, multiEntry: true });
        gamesStore.createIndex('genres', 'genres', { unique: false, multiEntry: true });
      }

      // Missions Table
      if (!db.objectStoreNames.contains('missions')) {
        const missionsStore = db.createObjectStore('missions', { keyPath: 'id', autoIncrement: true });
        missionsStore.createIndex('gameId', 'gameId', { unique: false });
        missionsStore.createIndex('difficulty', 'difficulty', { unique: false });
        missionsStore.createIndex('uiType', 'uiType', { unique: false });
        missionsStore.createIndex('status', 'status', { unique: false });
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

      // Newsletter Table
      if (!db.objectStoreNames.contains('newsletter')) {
        const newsletterStore = db.createObjectStore('newsletter', { keyPath: 'id', autoIncrement: true });
        newsletterStore.createIndex('email', 'email', { unique: true });
      }

      // === NEW ADMIN STORES (v5) ===

      // Admins Table
      if (!db.objectStoreNames.contains('admins')) {
        const adminStore = db.createObjectStore('admins', { keyPath: 'id', autoIncrement: true });
        adminStore.createIndex('username', 'username', { unique: true });
        adminStore.createIndex('role', 'role', { unique: false });
      }

      // Bridge: Jobs
      if (!db.objectStoreNames.contains('jobs')) {
        const jobsStore = db.createObjectStore('jobs', { keyPath: 'id', autoIncrement: true });
        jobsStore.createIndex('company', 'company', { unique: false });
        jobsStore.createIndex('status', 'status', { unique: false }); // active, closed
      }

      // Bridge: Partners
      if (!db.objectStoreNames.contains('partners')) {
        db.createObjectStore('partners', { keyPath: 'id', autoIncrement: true });
      }

      // Bridge: Certificates
      if (!db.objectStoreNames.contains('certificates')) {
        const certStore = db.createObjectStore('certificates', { keyPath: 'id', autoIncrement: true });
        certStore.createIndex('userId', 'userId', { unique: false });
        certStore.createIndex('code', 'code', { unique: true });
      }

      // Subscription Logs (For Export)
      if (!db.objectStoreNames.contains('subscriptions')) {
        const subStore = db.createObjectStore('subscriptions', { keyPath: 'id', autoIncrement: true });
        subStore.createIndex('userId', 'userId', { unique: false });
        subStore.createIndex('plan', 'plan', { unique: false });
        subStore.createIndex('date', 'date', { unique: false });
      }

      // Content Assets (CMS)
      if (!db.objectStoreNames.contains('content_assets')) {
        const contentStore = db.createObjectStore('content_assets', { keyPath: 'id', autoIncrement: true });
        contentStore.createIndex('type', 'type', { unique: false }); // image, text, etc.
        contentStore.createIndex('category', 'category', { unique: false }); // dashboard, sidebar, etc.
      }

      // Web Page Configs (Meta tags, routes)
      if (!db.objectStoreNames.contains('page_configs')) {
        db.createObjectStore('page_configs', { keyPath: 'route' }); // Key is route path like '/Games'
      }

      // Analytics Logs
      if (!db.objectStoreNames.contains('analytics_logs')) {
        const analyticsStore = db.createObjectStore('analytics_logs', { keyPath: 'id', autoIncrement: true });
        analyticsStore.createIndex('type', 'type', { unique: false }); // click, view, login
        analyticsStore.createIndex('date', 'date', { unique: false });
      }

      // === NEW PASS CODES STORE (v6) ===
      if (!db.objectStoreNames.contains('pass_codes')) {
        const passCodesStore = db.createObjectStore('pass_codes', { keyPath: 'id', autoIncrement: true });
        passCodesStore.createIndex('number', 'number', { unique: true });
        passCodesStore.createIndex('status', 'status', { unique: false });
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

  query: async (storeName, indexName, value) => {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  queryUsersByEmail: async (email) => {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Clear entire database
  clearDatabase: async () => {
    const db = await initDatabase();
    // Logic to clear specific stores or delete DB
    // For now simple implementation
    const storeNames = ['users', 'games', 'missions', 'submissions', 'ai_feedback'];

    for (const storeName of storeNames) {
      if (db.objectStoreNames.contains(storeName)) {
        await dbOperations.clear(storeName);
      }
    }
    console.log('🗑️ Database cleared');
  }
};
