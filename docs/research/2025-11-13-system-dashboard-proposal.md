# System Monitoring Dashboard - Implementation Proposal

**Date**: 2025-11-13
**Project**: TaskMasterWebIntegration
**Estimated Time**: 5 hours

---

## Summary

Add a new `/system` route with a real-time monitoring dashboard showing:
- System health (API, Database, MCP status)
- TaskMaster statistics (task counts, completion rates)
- API performance metrics
- Recent activity feed
- Database health indicators

**Visual Design**: Beautiful, mobile-first dashboard using existing Tailwind + shadcn/ui components

---

## Why This Makes Sense

1. **Observability Best Practice**: Shows how professional tools monitor their own health
2. **Portfolio Value**: Demonstrates full-stack skills + system design thinking
3. **Development Aid**: Makes debugging and performance tracking easier
4. **User Confidence**: Transparency builds trust in the system

---

## What You Get

### New Page: `/system`

```
┌────────────────────────────────────────────┐
│         System Monitoring Dashboard        │
├────────────────────────────────────────────┤
│  [API: HEALTHY]  [DB: ACTIVE]  [MCP: OK]  │
│  2ms latency     47 tasks      12 calls/h │
├────────────────────────────────────────────┤
│  📊 TaskMaster Statistics                  │
│  • 47 total tasks                          │
│  • 12 pending, 5 in progress, 30 done     │
│  • 8 tasks created today                   │
├────────────────────────────────────────────┤
│  ⚡ API Performance                         │
│  • 45ms avg response                       │
│  • 324 requests last hour                  │
│  • 0 errors                                │
├────────────────────────────────────────────┤
│  📝 Recent Activity                        │
│  • 2m ago: Task #42 completed             │
│  • 5m ago: New task created               │
└────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Backend API (1 hour)

Create `server/src/routes/system.ts` with 4 endpoints:

```typescript
GET /api/system/health        // System status check
GET /api/system/stats         // Task/issue counts
GET /api/system/performance   // API metrics
GET /api/system/activity      // Recent changes
```

### Phase 2: Frontend Components (2 hours)

Create in `client/src/components/system/`:
- `StatusCard.tsx` - Reusable health indicator cards
- `ActivityFeed.tsx` - Recent activity list
- `MetricsDisplay.tsx` - Stats visualization

### Phase 3: Dashboard Page (1 hour)

Create `client/src/pages/SystemDashboard.tsx`:
- Layout with MainLayout
- React Query hooks for data fetching
- Auto-refresh every 5 seconds
- Mobile-responsive grid

### Phase 4: Integration (1 hour)

- Add `/system` route to router
- Add navigation link in sidebar
- Test on desktop and mobile
- Add error boundaries

---

## Files to Create/Modify

### New Files (6)
```
client/src/
├── pages/SystemDashboard.tsx
├── components/system/
│   ├── StatusCard.tsx
│   ├── ActivityFeed.tsx
│   └── MetricsDisplay.tsx
├── hooks/useSystemMetrics.ts
└── server/src/routes/system.ts
```

### Modified Files (2)
```
client/src/main.tsx              # Add /system route
client/src/components/layout/MainLayout.tsx  # Add nav link
```

---

## Technology Stack

Uses existing stack (no new dependencies):
- React 18 + TypeScript
- React Query (data fetching)
- Tailwind CSS (styling)
- shadcn/ui (components)
- Radix UI (primitives)
- Express (backend API)

---

## Key Features

### Real-time Monitoring
- Auto-refresh every 5 seconds
- Live status indicators
- Instant error detection

### Performance Metrics
- API latency tracking
- Request volume monitoring
- Error rate tracking
- Uptime calculation

### Activity Feed
- Recent task updates
- Issue changes
- System events

### Mobile-Friendly
- Responsive grid layout
- Touch-optimized
- Fast loading

---

## Testing Plan

1. **Desktop Browser**: Verify layout and data loading
2. **Mobile Browser**: Test responsive design
3. **API Endpoints**: Ensure correct data returned
4. **Error Cases**: Test when services are down
5. **Performance**: Verify 5-second refresh doesn't lag

---

## WWSJD Principle Applied

> "A great tool not only works well, but shows you *how* it's working. Users should never wonder about system health — make it **visible and beautiful**."

This dashboard embodies:
- ✅ **Transparency**: System status always visible
- ✅ **Simplicity**: Clean, focused design
- ✅ **Craft**: Beautiful, polished UI
- ✅ **Functionality**: Genuinely useful for development

---

## Next Steps

### Option 1: Implement Now (~5 hours)
I can implement this complete feature following the plan above.

### Option 2: Add to TaskMaster
Create TaskMaster tasks for this feature with proper breakdown.

### Option 3: Adjust Design
We can tweak the design/scope before implementation.

**Which would you prefer?**

---

**Related Research**:
- `docs/research/2025-11-13-ai-cli-watcher-integration.md` (RAG efficiency patterns)
- Design prototype: `/tmp/taskmaster-system-dashboard-design.md`
