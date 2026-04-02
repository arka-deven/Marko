# UI Component Conventions — Marko Dashboard

## Required: Use shadcn/ui Components

Always use these shadcn/ui components instead of raw HTML/div patterns:

### Cards
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter } from "@/components/ui/card"

// GOOD
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>

// BAD — never do this
<div className="rounded-2xl border border-border bg-card p-5">
```

### Badges
```tsx
import { Badge } from "@/components/ui/badge"

// GOOD
<Badge variant="secondary" className="bg-emerald-400/10 text-emerald-400">Active</Badge>
<Badge variant="outline">Label</Badge>

// BAD
<span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400">Active</span>
```

### Tables
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
```

### Tabs
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
```

### Buttons
```tsx
import { Button } from "@/components/ui/button"
// variants: default, secondary, outline, ghost, destructive, link
```

### Other Required Components
- `Progress` — for progress bars
- `Separator` — for dividers (not `border-b` divs)
- `Tooltip` — for hover info
- `Skeleton` — for loading states
- `Avatar` — for user avatars
- `DropdownMenu` — for action menus
- `ToggleGroup` — for view toggles

## Theme Colors

Always use CSS variables, never hardcoded colors for structural elements:
- `hsl(var(--foreground))` — text
- `hsl(var(--muted-foreground))` — secondary text
- `hsl(var(--card))` — card backgrounds
- `hsl(var(--border))` — borders
- `hsl(var(--secondary))` — secondary backgrounds
- `hsl(var(--primary))` — primary accent

Semantic colors (for status/data) can use Tailwind classes:
- `text-emerald-400`, `text-amber-400`, `text-red-400`, `text-blue-400` etc.
- Always with `/10` or `/15` opacity for backgrounds

## Recharts Theme Integration

```tsx
<Tooltip
  contentStyle={{
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    fontSize: 12,
  }}
  labelStyle={{ color: "hsl(var(--foreground))" }}
  itemStyle={{ color: "hsl(var(--foreground))" }}
  cursor={{ fill: "hsl(var(--secondary))" }}
/>
```
