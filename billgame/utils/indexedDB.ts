// IndexedDB utility for offline storage

const DB_NAME = "billHarmonyDB"
const DB_VERSION = 1
const STORES = {
  BILLS: "bills",
  SETTLEMENTS: "settlements",
  HISTORY: "history",
}

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      reject("Error opening database")
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object stores
      if (!db.objectStoreNames.contains(STORES.BILLS)) {
        db.createObjectStore(STORES.BILLS, { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains(STORES.SETTLEMENTS)) {
        db.createObjectStore(STORES.SETTLEMENTS, { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains(STORES.HISTORY)) {
        db.createObjectStore(STORES.HISTORY, { keyPath: "type" })
      }
    }
  })
}

// Add or update an item in a store
export const saveItem = async (storeName: string, item: any): Promise<void> => {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.put(item)

    request.onerror = () => {
      reject("Error saving item")
    }

    request.onsuccess = () => {
      resolve()
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

// Get an item from a store
export const getItem = async (storeName: string, key: string): Promise<any> => {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)
    const request = store.get(key)

    request.onerror = () => {
      reject("Error getting item")
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

// Get all items from a store
export const getAllItems = async (storeName: string): Promise<any[]> => {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => {
      reject("Error getting items")
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

// Delete an item from a store
export const deleteItem = async (storeName: string, key: string): Promise<void> => {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.delete(key)

    request.onerror = () => {
      reject("Error deleting item")
    }

    request.onsuccess = () => {
      resolve()
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

// Sync data between localStorage and IndexedDB
export const syncWithLocalStorage = async (): Promise<void> => {
  try {
    // Sync bills
    const billsHistory = localStorage.getItem("billsHistory")
    if (billsHistory) {
      await saveItem(STORES.HISTORY, { type: "bills", data: JSON.parse(billsHistory) })
    }

    // Sync settlements
    const settlementsHistory = localStorage.getItem("settlementsHistory")
    if (settlementsHistory) {
      await saveItem(STORES.HISTORY, { type: "settlements", data: JSON.parse(settlementsHistory) })
    }

    // Sync individual bills and settlements
    const allKeys = Object.keys(localStorage)

    for (const key of allKeys) {
      if (key.startsWith("bill_")) {
        const billData = localStorage.getItem(key)
        if (billData) {
          await saveItem(STORES.BILLS, JSON.parse(billData))
        }
      } else if (key.startsWith("settlement_")) {
        const settlementData = localStorage.getItem(key)
        if (settlementData) {
          await saveItem(STORES.SETTLEMENTS, JSON.parse(settlementData))
        }
      }
    }
  } catch (error) {
    console.error("Error syncing with localStorage:", error)
  }
}

// Initialize the database and sync with localStorage
export const initializeStorage = async (): Promise<void> => {
  try {
    await initDB()
    await syncWithLocalStorage()
  } catch (error) {
    console.error("Error initializing storage:", error)
  }
}

