# Project Structure & Architecture

## Feature-Based Architecture

The project follows a feature-based architecture with clear separation of concerns:

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Authenticated app routes
│   ├── (marketing)/       # Public marketing pages
│   ├── auth/              # Authentication pages
│   └── api/               # API routes
├── features/              # Feature modules (domain-driven)
│   ├── auth/
│   ├── playbooks/
│   ├── sessions/
│   └── strategies/
├── components/            # Reusable UI components
│   ├── features/          # Feature-specific components
│   ├── ui/                # shadcn/ui components
│   └── states/            # Loading, error, empty states
├── hooks/                 # Shared React hooks
├── lib/                   # External service clients
├── providers/             # React context providers
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Feature Module Structure

Each feature follows a consistent internal structure:

```
features/[feature]/
├── components/            # Feature-specific UI components
├── data/                  # Repository layer (data access)
├── domain/                # Business logic, schemas, services
├── hooks/                 # Feature-specific React hooks
└── types/                 # Feature-specific types
```

## Key Conventions

### Import Aliases

- `@/*` maps to `src/*`
- Use absolute imports for all internal modules
- Group imports: external libraries, then internal modules

### Component Organization

Components are organized by their scope and reusability:

- **UI Components**: Generic, reusable components in `src/components/ui/`

  - shadcn/ui components and base UI primitives
  - Used across multiple features
  - Examples: Button, Input, Card, Dialog

- **Feature Components**: Domain-specific, reusable components in `src/components/features/[feature]/`

  - Feature-specific components that may be used in multiple places
  - Organized by feature domain
  - Examples: PlaybookCard, SessionCard, StrategyCard

- **Page Components**: Top-level page components co-located with routes in `src/app/`

  - Page-level components that compose feature components
  - Tied to specific routes

- **Feature-Specific Components**: Highly coupled components may optionally live in `src/features/[feature]/components/`
  - Currently, all feature components are in `src/components/features/` for consistency
  - Prefer `src/components/features/` unless there's a strong reason for feature-local components

### Data Layer

- **Repositories**: Extend `BaseRepository` for consistent data access patterns
  - Located in `src/features/[feature]/data/`
  - Contain only data access logic, no business rules
- **Services**: Business logic and orchestration
  - Located in `src/features/[feature]/domain/`
  - Use dependency injection via constructor (repository instances)
  - Export factory functions for testability: `create[Feature]Service(repository?)`
  - Export singleton instances for backward compatibility: `[feature]Service`
  - Services handle business logic, validation, and error handling
- **Hooks**: React Query integration for server state
  - Feature-specific hooks in `src/features/[feature]/hooks/`
  - Shared utility hooks in `src/hooks/`

### Type Organization

Types are organized by scope and reusability:

- **Global Types** (`src/types/`): Shared types used across multiple features

  - `database.ts`: Auto-generated Supabase database types
  - `tables.ts`: Table-specific types exported from database
  - `errors.ts`: Application-wide error types and codes
  - `playbook.ts`: Shared playfield/playground context types (used across playfield, playground, activities)
  - `state-guards.ts`: State guard type utilities
  - Use `npm run gen:db` to regenerate database types after schema changes

- **Feature Domain Types** (`src/features/[feature]/domain/types.ts` or `*.types.ts`): Feature-specific domain types

  - Domain models, DTOs, query types specific to a feature
  - Examples: `PlaybookListQuery`, `PlaybookWithStrategies` in playbooks domain
  - Not shared with other features

- **Feature Data Types** (`src/features/[feature]/data/types.ts`): Repository/DTO types (if needed)
  - Types specific to data layer, rarely needed as tables.ts covers most cases

Avoid duplicating types across locations. If a type is used by multiple features, it belongs in `src/types/`.

### Service Layer Patterns

Services follow a consistent pattern for scalability and testability:

1. **Constructor Injection**: Services accept repository instances via constructor
2. **Factory Functions**: Export `create[Feature]Service(repository?)` for dependency injection
3. **Singleton Exports**: Export singleton instances (`[feature]Service`) for backward compatibility
4. **Error Handling**: Use `normalizeError` from `@/utils/error` when business logic validation is needed
5. **Documentation**: All service methods include JSDoc comments

Example service structure:

```typescript
export class FeatureService {
  constructor(private repository: FeatureRepository) {}

  async getById(id: string) {
    return this.repository.getById(id);
  }
}

export function createFeatureService(
  repository: FeatureRepository = new FeatureRepository(supabase)
): FeatureService {
  return new FeatureService(repository);
}

export const featureService = createFeatureService();
```

### Authentication & Authorization

- Role-based access control: `si_leader`, `student`
- Row Level Security (RLS) policies in database
- Client-side auth state management via React Query

### Styling Conventions

- Tailwind CSS with custom component classes (btn, btn-primary, etc.)
- shadcn/ui components with consistent variant patterns
- Use `cn()` utility for conditional class merging
