# @darpo/logger

A minimalistic, explicit, and extensible logger for Node.js.

- **Explicit Architecture**: No global state, no hidden side effects, and no magic contexts.
- **Pluggable Transports**: Easily route logs to multiple destinations via a simple interface.
- **Semantic Data Separation**: Built-in distinction between event data and environmental context.
- **TypeScript First**: Full type safety for your logging infrastructure.

---

## Installation

```bash
npm install @darpo/logger
```

---

## Quick Start

```ts
import { Logger, LogLevel } from '@darpo/logger';
import { TerminalTransport } from '@darpo/logger/transports';

const logger = Logger({
  app: 'my-app',
  transports: [
    TerminalTransport([LogLevel.Info, LogLevel.Warn, LogLevel.Error]),
  ],
});

logger.info('Application started');
```

---

## API Reference

### Log Levels

```ts
enum LogLevel {
  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal,
}
```

### Methods

Every logging method follows the same signature: `(message: string, data?: object, context?: object)`.

- `logger.trace(...)`
- `logger.debug(...)`
- `logger.info(...)`
- `logger.warn(...)`
- `logger.error(...)`
- `logger.fatal(...)`

---

## Data Structure

We promote a clear distinction between two types of additional information:

- **Data** (`data`) — *What happened*. Contains the actual event payload, metrics, or error details.
- **Context** (`context`) — *Where* and *Who*. Identifies the request, user, or specific task (e.g., `requestId`, `userId`).

```ts
logger.info(
  'User created',
  { email: 'user@example.com' }, // Event Data
  { requestId: 'abc-123' }        // Request Context
);
```

### Error Handling

Pass error objects within the `data` parameter.

```ts
logger.error('Database connection failed', { error });
```

---

## Transports

A transport is an object implementing the `Transport` interface.

### Custom Transport Implementation

```ts
import { LogEntry, LogLevel, Transport } from '@darpo/logger';

const myTransport: Transport = {
  id: 'my-custom-transport',
  write(entry: LogEntry) {
    const { level, message, timestamp, data, context, app } = entry;
    
    console.log(`${new Date(timestamp).toISOString()} [${LogLevel[level].toUpperCase()}] ${message}`, {
      data,
      context,
      app
    });
  }
};

const logger = Logger({
  transports: [myTransport]
});
```

### Built-in TerminalTransport

The library includes a `TerminalTransport` for beautiful console output. It accepts a single level or an array of levels to filter.

```ts
import { LogLevel } from '@darpo/logger';
import { TerminalTransport } from '@darpo/logger/transports';

// Log only errors and fatals to terminal
const transport = TerminalTransport([LogLevel.Error, LogLevel.Fatal]);
```

---

## License

MIT
