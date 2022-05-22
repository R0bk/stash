# stash

Stash is a quick and easy local cache of almost all JS object types, it makes it as easy cache file objects as using localstorage
The statsh will persist across loads as it is based ontop of the browsers IndexDB
The API is simple and similar to firebase's moudlar v9 API

## Installation

```js
npm install stash
```

## Using stash

Using stash is simple, you can see an example below

### Import cache
```js
import { cache, set } from 'stash'
````

### Create a refrence to a stash and insert a key value pair
```js
const stashRef = cache()

const key = 'My key'
const value = {firstName: 'Ben', lastName: 'Jerry'}

set(stashRef, key, value)
````

### Get a refrence from a stash
```js
import { get } from 'stash'

const cachedValue = get(stashRef, key)
````

### Clear the stash
```js
import { clear } from 'stash'

clear(stashRef)
```

## License

Released under the terms of the [MIT License](LICENSE).