# Field Hooks in Lexical Reproduction

This repository demonstrates a bug in PayloadCMS where **field hooks do not fire for relationship fields embedded in blocks within Lexical rich text fields**.

## The Bug

When a relationship field is defined within a block that is then embedded in a Lexical rich text field, most field hooks fail to execute during create/update operations.

### Expected Behavior

All field hooks should fire for relationship fields regardless of where they are defined:

- `beforeValidate`
- `beforeChange`
- `afterChange`
- `afterRead`
- `beforeDuplicate`

### Actual Behavior

For relationship fields in blocks embedded in Lexical fields:

- ✗ `beforeValidate` - **does NOT fire**
- ✗ `beforeChange` - **does NOT fire**
- ✗ `afterChange` - **does NOT fire**
- ✓ `afterRead` - **fires correctly**
- ✗ `beforeDuplicate` - **does NOT fire**

## Impact

This bug prevents:

1. **Field validation** from running (potential data integrity issues)
2. **Data transformation** in `beforeChange` (data won't be normalized/sanitized)
3. **Side effects** in `afterChange` (no notifications, derived data updates, etc.)
4. **Duplication logic** in `beforeDuplicate` (data won't be prepared correctly when duplicating entries)

## Repository Structure

### Collections

- **Categories** - Simple collection used as the target for relationship fields
- **Posts** - Collection with a direct relationship field (control test - works correctly)
- **Articles** - Collection with a Lexical rich text field that embeds blocks (demonstrates the bug)

### Blocks

- **CategoryBlock** - A block containing a relationship field with hooks defined

### Tests

The test suite (`tests/int/field-hooks.int.spec.ts`) demonstrates:

1. **Control Test**: Direct relationship fields fire all hooks correctly
2. **Bug Test**: Block relationship fields only fire `afterRead` hook

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Generate types:
   ```bash
   pnpm run generate:types
   ```

## Running the Tests

Run the integration tests to see the bug in action:

```bash
pnpm run test:int tests/int/field-hooks.int.spec.ts
```

### Expected Output

```
✓ Field Hooks in Lexical Blocks > should fire all hooks for direct relationship fields (control test)
  Posts.category beforeValidate hook fired
  Posts.category beforeChange hook fired
  Posts.category afterChange hook fired
  Posts.category afterRead hook fired

✗ Field Hooks in Lexical Blocks > should fire all hooks for relationship fields in blocks within Lexical fields (BUG)
  CategoryBlock.category afterRead hook fired (only this one!)

  Hook call summary for block fields:
    beforeValidate: called = false
    beforeChange: called = false
    afterChange: called = false
    afterRead: called = true

  Duplicate hook test:
    beforeDuplicate: called = false

  AssertionError: expected "beforeValidate" to be called at least once
```

## Technical Details

The hooks are wrapped in objects to allow spy/mock functions to track their invocation:

```typescript
// Example from CategoryBlock.ts
export const blockCategoryHooks = {
  beforeValidate: (value: any) => {
    console.log('CategoryBlock.category beforeValidate hook fired')
    return value
  },
  beforeChange: (value: any) => {
    console.log('CategoryBlock.category beforeChange hook fired')
    return value
  },
  // ... etc
}
```

Tests use Vitest spies to verify hook execution:

```typescript
vi.spyOn(blockCategoryHooks, 'beforeValidate')
vi.spyOn(blockCategoryHooks, 'beforeChange')
// ... etc

expect(blockCategoryHooks.beforeValidate).toHaveBeenCalled() // FAILS
expect(blockCategoryHooks.beforeChange).toHaveBeenCalled() // FAILS
expect(blockCategoryHooks.afterRead).toHaveBeenCalled() // PASSES
```

## Environment

- PayloadCMS: 3.59.1
- @payloadcms/richtext-lexical: 3.59.1
- Node: 18.20.2 / 20.9.0+
- Database: SQLite (via @payloadcms/db-sqlite)
