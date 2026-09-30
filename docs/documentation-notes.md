



## Day 2 decisions (Sept 30, 2026)
- Server layout stays module-based: `server/src/modules/<domain>/`. Modules are created when the schedule needs them.
- Node module setup: `module`/`moduleResolution` = NodeNext with `"type": "commonjs"` in server/package.json. Files compile as CommonJS, so imports are written without extensions (`./something`). `tsx` runs the dev server; `tsc` type-checks and builds to `dist/`.
- Shared client/server types deferred. Client types live in `client/src/types/`. Revisit after several API modules exist.
- Zod approved for runtime validation of untrusted input. Layers stay separate: TypeScript (compile-time types), Zod (runtime input validation), backend authorization (access control), database constraints (integrity).