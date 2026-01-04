# UI Standards

## Core Principles

1. **Shadcn/ui First**: Use shadcn/ui components for all UI elements. No raw HTML elements in components.
2. **Component Classes**: Favor component classes in `globals.css` over long utility strings.
3. **Design Tokens**: Use Tailwind v4 `@theme` tokens for consistent spacing, colors, and typography.
4. **Accessibility**: All components must be accessible by default (shadcn handles this).
5. **Consistency**: Maintain visual consistency through standardized component variants.

## Component Architecture

### Shadcn/ui Components (Required)

Always use these shadcn components instead of raw HTML:

```tsx
// ✅ CORRECT: Use shadcn components
import { Button, Input, Card, Label, Textarea } from "@/components/ui";

// ❌ WRONG: Raw HTML elements
<button>Click me</button>
<input type="text" />
<div className="card-like">...</div>
```

### Available UI Components

Core shadcn components available in `/src/components/ui/`:

- `Button` - All button interactions
- `Card` - Content containers with header/footer/content slots
- `Input` - Text inputs with validation states
- `Textarea` - Multi-line text inputs
- `Label` - Form labels
- `Dialog` - Modal dialogs
- `Sheet` - Side panels
- `Tabs` - Tab navigation
- `Toggle` - Toggle buttons
- `Checkbox` - Checkboxes
- `Avatar` - User avatars
- `Skeleton` - Loading placeholders
- `Separator` - Visual dividers
- `Tooltip` - Contextual help

## Component Classes (globals.css)

### Button Variants

Use component classes instead of utility strings:

```tsx
// ✅ CORRECT: Component classes
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="tertiary">Tertiary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="outline">Outlined</Button>
<Button variant="muted">Icon Button</Button>

// ❌ WRONG: Long utility strings
<button className="bg-primary-400 text-muted-foreground hover:bg-primary-600 rounded-full px-4 py-2">
```

### Card Patterns

```tsx
// ✅ CORRECT: Use Card component with slots
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon">...</Button>
    </CardAction>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>

// Special card variant for strategies
<div className="strategy-card">
  {/* Strategy-specific styling applied */}
</div>
```

### Layout Classes

```css
/* Container patterns */
.container /* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
/* Main content container with max-width and spacing */
.center-all /* Flex center both axes */

/* Loading state layouts */
.loading-state-grid /* Grid layout for loading cards */
.loading-state-list /* List layout for loading items */
.loading-state-inline /* Horizontal scrolling layout */

/* Visual effects */
.faded-row /* Horizontal fade mask */
.faded-col /* Vertical fade mask */
.icon-ghost; /* Subtle icon background */
```

### Typography Classes

```css
/* Heading hierarchy */
.heading-xl /* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
/* 3xl, semibold */
.heading-lg /* 2xl, semibold */
.heading-md /* xl, semibold */

/* Base styles applied automatically */
h1 /* 4xl, bold */
h2; /* xl, bold */
```

## Design Tokens

### Color System

Use semantic color tokens from the design system:

```tsx
// ✅ CORRECT: Semantic tokens
className = "bg-primary-400 text-muted-foreground";
className = "bg-secondary-500 hover:bg-secondary-600";
className = "text-muted-foreground";
className = "border-border";

// ❌ WRONG: Hardcoded colors
className = "bg-blue-500 text-white";
className = "bg-purple-600 hover:bg-purple-700";
```

### Available Color Tokens

**Primary Palette**: `primary-50` through `primary-900`
**Secondary Palette**: `secondary-50` through `secondary-900`  
**Accent Palette**: `accent-50` through `accent-900`
**Status Colors**: `success-100/500/700`, `destructive-100/500/700`
**Semantic Colors**: `background`, `foreground`, `muted`, `muted-foreground`, `border`, `input`, `ring`

### Spacing & Sizing

Use consistent spacing tokens:

- Prefer `gap-spacing-sm` through `gap-spacing-xl` for component spacing
- Use `p-spacing-sm` through `p-spacing-xl`for padding
- Use `space-x-spacing-sm` through `space-x-spacing-xl` for horizontal rhythm
- Use `space-y-spacing-sm` through `space-y-spacing-xl` for vertical rhythm

### Border Radius

Use semantic radius tokens:

- `rounded-md` - Default radius
- `rounded-lg` - Larger radius
- `rounded-xl` - Extra large radius
- `rounded-2xl` - Cards and major containers
- `rounded-full` - Buttons and pills

## Form Integration

All forms must use the established form patterns:

```tsx
// ✅ CORRECT: FormLayout + shadcn components
<FormLayout<FormData> resolver={zodResolver(schema)} onSubmit={handleSubmit}>
  {({ control }) => (
    <FormField
      name="fieldName"
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Placeholder" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )}
</FormLayout>
```

## Loading States

Use consistent loading patterns:

```tsx
// ✅ CORRECT: Standardized loading components
<LoadingState variant="container" />
<LoadingState variant="grid" />
<LoadingState variant="list" />

// For inline loading
<Skeleton className="h-4 w-full" />
```

## Anti-Patterns

### Avoid These Patterns

```tsx
// ❌ WRONG: Raw HTML elements
<button onClick={...}>Click me</button>
<input type="text" />
<div className="bg-white p-4 rounded shadow">Card content</div>

// ❌ WRONG: Long utility strings
<div className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors">

// ❌ WRONG: Hardcoded colors/spacing
<div className="bg-[#3b82f6] p-[16px] text-[#ffffff]">

// ❌ WRONG: Inconsistent spacing
<div className="gap-3 p-5 space-y-7"> // Mix of spacing scales
```

### Correct Alternatives

```tsx
// ✅ CORRECT: Shadcn components + component classes
<Button variant="primary" onClick={...}>Click me</Button>
<Input type="text" />
<Card>Card content</Card>

// ✅ CORRECT: Component classes
<div className="btn btn-primary">

// ✅ CORRECT: Design tokens
<div className="bg-primary-500 p-4 text-muted-foreground">

// ✅ CORRECT: Consistent spacing scale
<div className="gap-4 p-4 space-y-4"> // Consistent 4-unit scale
```

## Implementation Guidelines

1. **New Components**: Always start with shadcn/ui base components
2. **Styling**: Create component classes in `globals.css` for repeated patterns
3. **Variants**: Use CVA (class-variance-authority) for component variants
4. **Tokens**: Reference design tokens, never hardcode values
5. **Accessibility**: Rely on shadcn's built-in accessibility features
6. **Testing**: Ensure components work with keyboard navigation and screen readers

## Quality Checklist

Before shipping UI components:

- [ ] Uses shadcn/ui components (no raw HTML)
- [ ] Follows component class patterns from `globals.css`
- [ ] Uses design tokens (no hardcoded values)
- [ ] Maintains consistent spacing scale
- [ ] Accessible by default (keyboard + screen reader)
- [ ] Responsive design considerations
- [ ] Proper TypeScript types for props
