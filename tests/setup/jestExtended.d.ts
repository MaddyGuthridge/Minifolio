// Need to use interfaces, as they don't register the extended type definitions
// otherwise.
 
// https://jest-extended.jestcommunity.dev/docs/getting-started/setup#use-with-vitest
import type CustomMatchers from 'jest-extended';
import 'vitest';

declare module 'vitest' {
  type Assertion<T = any> = {} & CustomMatchers<T>
  type AsymmetricMatchersContaining<T = any> = {} & CustomMatchers<T>
  type ExpectStatic<T = any> = {} & CustomMatchers<T>
}
