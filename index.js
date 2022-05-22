export const cache = (
  name='defaultFileCache',
  storeName='defaultFileCacheStore',
  version=1,
  userLogger=()=>{}
) => {
  const logger = (level, args) => {userLogger(level, ['[DBS]'].concat(args))}
  const isSupported = !!window?.indexedDB

  return {
    name: name,
    storeName: storeName,
    version: version,
    isSupported: isSupported,
    log: logger,
  }
}

const open = async ({name, storeName, version, log}) => {
  const res = window.indexedDB.open(name, version)
  return await new Promise((resolve) => {
    res.onsuccess = () => {
      resolve(res.result)
    }
    res.onerror = (errorMsg) => {
      log('Warn', ['indexDB initialization failed', errorMsg])
      resolve(undefined)
    }
    res.onupgradeneeded = () => {
      const db = res.result
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'key' })
        store.createIndex('key', 'key', { unique: true })
      }
    }
  })
}

export const clear = ({name, isSupported}) => {if (isSupported) window.indexedDB.deleteDatabase(name)}

export const set = async (ref, key, value) => {
  const {name, storeName, version, isSupported, log} = ref
  
  if (!isSupported) return

  const db = await open(ref)
  if (db) {
    return await new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const res = store.get(key)
      let storeRes
      res.onsuccess = () => {
        if (res.result === undefined) {
          storeRes = store.add({key, value})
        } else {
          storeRes = store.put({key, value})
        }
        storeRes.onsuccess = () => {
          log('Success', [`Set success key: ${key} value: `, value])
          resolve(undefined)
        }
        storeRes.onerror = (errorMsg) => {     
          log('Warn', [`Save failed key: ${key} value: `, value, 'error:', errorMsg])
          resolve ('Set failed')
        }
      }
      res.onerror = (errorMsg) => {
        log('Warn', [`Save failed key: ${key} value: `, value, 'error:', errorMsg])
        resolve ('Set failed')
      }
    })
  }
}

export const get = async (ref, key) => {
  const {name, storeName, version, isSupported, log} = ref
  if (!isSupported) return

  const db = await open(ref)
  if (db) {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const res = store.get(key)
    return new Promise((resolve) => {
      res.onsuccess = () => {
        log('Success', [`Read success key: ${key} value: `, res.result?.value])
        resolve(res.result?.value)
      }
      res.onerror = (errorMsg)  =>  {
        log('Warn', [`Read failed key: ${key} error: `, errorMsg])
        resolve(undefined)
      }
    })
  }
}

