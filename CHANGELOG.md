# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-26

### Added
- Initial release of `@darpo/logger`.
- `Logger` factory for creating explicit, side-effect-free loggers.
- `TerminalTransport` for console logging with support for multiple log levels.
- Support for `LogLevels`: Trace, Debug, Info, Warn, Error, Fatal.
- Semantic data separation: distinction between `data` (what happened) and `context` (where/who).
- Full TypeScript support.
