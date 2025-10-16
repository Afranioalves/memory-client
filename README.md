# @afranioalves/memory-client

Lightweight library for client-side data storage. It offers a simple asynchronous API to create, read, and delete data by key.

Version: 1.0.0

## Description

This library exposes a singleton instance that simplifies basic storage operations in the browser. It is designed for use in front-end applications (e.g., web pages, React, Next.js).

Main features:

- Automatic initialization.
- Simple async methods: `create`, `read`, `delete`.

## Installation

Install via npm or yarn:

```bash
npm install @afranio/memory-client
# or
yarn add @afranio/memory-client
```

> Note: The package uses ES modules (package.json has "type": "module").

## Quick Usage

Import the default instance and call the async methods:

```javascript
import Memory from '@afranio/memory-client';

async function main() {
  // Create/update a memory
  const createResult = await Memory.create('my-key', { name: 'Afrânio', age: 18 });
  console.log(createResult);

  // Read the memory
  const value = await Memory.read('my-key');
  console.log('read value:', value);

  // Delete the memory
  const deleteResult = await Memory.delete('my-key');
  console.log(deleteResult);
}

main();
```

### HTML Example (browser)

```html
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Memory Example</title></head>
  <body>
    <script type="module">
      import Memory from '/node_modules/@afranio/memory-client/src/index.js';

      (async () => {
        console.log(await Memory.create('ex1', 'Hello World'));
        console.log(await Memory.read('ex1'));
        console.log(await Memory.delete('ex1'));
      })();
    </script>
  </body>
</html>
```

> Note: When using bundlers or frameworks (Vite, Webpack, Next.js), prefer importing by package name: `import Memory from '@afranio/memory-client'`.

### React Example

```jsx
import React from 'react';
import Memory from '@afranio/memory-client';

export default function App() {
  const createMemory = async () => {
    const result = await Memory.create('user', { name: 'Ana' });
    console.log(result);
  };

  const readMemory = async () => {
    const user = await Memory.read('user');
    console.log(user);
  };

  return (
    <div>
      <button onClick={createMemory}>Create Memory</button>
      <button onClick={readMemory}>Read Memory</button>
      Check the console for results.
    </div>
  );
}
```

## API

All methods are asynchronous and return Promises.

- `create(memoryName, memoryValue)`
  - Description: Creates or updates an entry with key `memoryName` and value `memoryValue`.
  - Returns: Promise resolving to an object `{ message: string, status: number }` on success, or rejects on error.
  - Example status codes: `201` (created successfully), `409` (already exists), `500` (internal error).

- `read(memoryName)`
  - Description: Reads the stored value for `memoryName`.
  - Returns: Promise resolving to the value (any stored data) or `{ message, status }` when not found or on error (e.g., `404` when not found, `500` on internal error).

- `delete(memoryName)`
  - Description: Deletes the entry with key `memoryName`.
  - Returns: Promise resolving to `{ message: string, status: number }`.

Example responses:

- Successful creation: `{ message: 'Memory my-key created successfully.', status: 201 }`
- Not found: `{ message: 'Memory my-key does not exist.', status: 404 }` (or the stored value when it exists)

## Notes and Common Issues

- This library is intended for client-side (browser) use. Persistence behavior may vary slightly between environments/browsers.
- In contexts with very strict privacy policies or special browser modes, storage may be limited or temporary.

## Contributing

This is a simple project. To contribute:

1. Fork the repository.
2. Create a branch for your feature: `git checkout -b feature/my-feature`.
3. Make small, descriptive commits.
4. Open a pull request explaining your change.

## License

MIT — see the `LICENSE` file

---

Author: Afrânio