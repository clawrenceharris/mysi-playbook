# Technology Stack

## Framework & Runtime

- **Next.js 15.5.3** with App Router and Turbopack
- **React 19.1.0** with TypeScript
- **Node.js** runtime

## Database & Backend

- **Supabase** for database, authentication, and real-time features
- **PostgreSQL** with Row Level Security (RLS)
- **Supabase Auth** for user management

## UI & Styling

- **Tailwind CSS 4** for styling
- **shadcn/ui** components (New York style)
- **Radix UI** primitives for accessible components
- **Lucide React** for icons
- **Framer Motion** for animations

## Key Libraries

- **@tanstack/react-query** for server state management
- **React Hook Form** with Zod validation
- **@stream-io/video-react-sdk** for video calling
- **@dnd-kit** for drag and drop functionality
- **OpenAI** for AI-powered features

## Development Tools

- **TypeScript** with strict mode
- **ESLint** for code linting
- **Vitest** for testing

## Common Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build           # Build for production with Turbopack
npm start              # Start production server

# Code Quality
npm run lint           # Run ESLint
npm run types:check    # TypeScript type checking

# Database
npm run gen:db         # Generate database types from Supabase
```

## Environment Setup

- Copy `.env.example` to `.env.local`
- Configure Supabase credentials
- Set up Stream.io API keys for video functionality
