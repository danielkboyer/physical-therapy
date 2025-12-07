/**
 * TypeScript exhaustiveness checking utility
 * Use this in switch statements or if/else chains to ensure all cases are handled
 *
 * This function provides compile-time safety by accepting a `never` type.
 * If TypeScript allows calling this function, it means you haven't handled all cases.
 *
 * @example
 * ```ts
 * switch (value) {
 *   case 'a': return 1;
 *   case 'b': return 2;
 *   default: return assertNever(value);
 * }
 * ```
 */
export function assertNever(_value: never): never {
  // This function should never be called at runtime
  // If it is, it means TypeScript's type checking was bypassed
  throw new Error('assertNever: This should never be reached');
}
