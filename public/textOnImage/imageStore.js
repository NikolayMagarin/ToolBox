const DB_NAME = 'ImageStorage';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const IMAGE_KEY = 'single_image';

/** @returns {Promise<IDBDatabase>} */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Database opening error: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      /** @type {IDBDatabase} */
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }

      return db;
    };
  });
}

async function saveImageToDB(imageFile) {
  if (!imageFile || !(imageFile instanceof File)) {
    throw new Error('Invalid image file');
  }

  if (!imageFile.type.startsWith('image/')) {
    throw new Error('The file is not an image');
  }

  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const imageData = {
        id: IMAGE_KEY,
        file: imageFile,
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
        lastModified: imageFile.lastModified,
        timestamp: Date.now(),
      };

      const request = store.put(imageData);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Error saving the image: ${request.error}`));
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction error: ${transaction.error}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    throw new Error(`Error saving the image: ${error.message}`);
  }
}

/** @returns {Promise<File>} */
async function loadImageFromDB() {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(IMAGE_KEY);

      request.onsuccess = () => {
        const result = request.result;

        if (!result) {
          reject(new Error('The image was not found in the database'));
          return;
        }

        resolve(result.file);
      };

      request.onerror = () => {
        reject(new Error(`Image load error: ${request.error}`));
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction error: ${transaction.error}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    throw new Error(`Error while loading an image: ${error.message}`);
  }
}

async function deleteImageFromDB() {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(IMAGE_KEY);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Image deletion error: ${request.error}`));
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction error: ${transaction.error}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    throw new Error(`Error while deleting an image: ${error.message}`);
  }
}

export { saveImageToDB, loadImageFromDB, deleteImageFromDB };
