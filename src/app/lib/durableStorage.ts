const DATABASE_NAME = "xtrail-durable-storage";
const DATABASE_VERSION = 1;
const STORE_NAME = "key-value";

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available on this device."));
      return;
    }

    const request = indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(
        request.error ??
          new Error("Could not open XTrail durable storage.")
      );
    };
  });

  return databasePromise;
}

export async function durableGetItem(
  key: string
): Promise<string | null> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(
        typeof request.result === "string"
          ? request.result
          : null
      );
    };

    request.onerror = () => {
      reject(
        request.error ??
          new Error(`Could not read durable item "${key}".`)
      );
    };
  });
}

export async function durableSetItem(
  key: string,
  value: string
): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    store.put(value, key);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(
        transaction.error ??
          new Error(`Could not save durable item "${key}".`)
      );
    };

    transaction.onabort = () => {
      reject(
        transaction.error ??
          new Error(`Saving durable item "${key}" was aborted.`)
      );
    };
  });
}

export async function durableRemoveItem(
  key: string
): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    store.delete(key);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(
        transaction.error ??
          new Error(`Could not remove durable item "${key}".`)
      );
    };
  });
}