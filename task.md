# C++ Academy — Premium Refactor Tasks

## STEP 3 — Project Init + Design System
- [x] Initialize Vite + React project
- [x] Install dependencies (Tailwind v3, react-router-dom, zustand, lucide-react, @monaco-editor/react)
- [x] Configure Tailwind with custom design tokens (colors, animations, fonts)
- [x] Set up index.css with base styles (fonts, scrollbar, selection, stagger)
- [x] Build core UI components (Button, Card, Badge, ProgressBar, Toast, Skeleton)

## STEP 4 — App Shell + Routing
- [x] AppShell layout component (sidebar + header + Outlet)
- [x] Sidebar with Lucide icons (6 nav items, collapsible, XP progress)
- [x] Header with breadcrumbs + streak + search trigger
- [x] Оновити `backend/src/models/user.model.js` (додати поля для активності, балів тестів, і тд)
- [x] Оновити `backend/src/controllers/user.controller.js` (модифікувати логіку `syncUserData`)
- [x] Оновити `frontend/src/stores/useAppStore.js` (додати виклики `get().syncToServer()` на кожну важливу зміну стану)
- [x] Оновити розбір даних з бекенду (метод `loadFromServer()` у Zustand) indices
- [x] API client with fallback pattern
- [x] Constants (levels, achievements, navigation, colors)
- [x] Utility functions (getLevel, getXPToNextLevel, formatNumber, etc.)

## STEP 5 — State + Data
- [x] Zustand store (useAppStore) — XP, levels, streak, activity log, achievements
- [x] Lesson/Quiz/Project data indices
- [x] API client with fallback pattern
- [x] Constants (levels, achievements, navigation, colors)
- [x] Utility functions (getLevel, getXPToNextLevel, formatNumber, etc.)

## STEP 6 — Dashboard ✅
- [x] Dashboard page with CTA + SVG progress ring
- [x] Activity graph (GitHub-style heatmap)
- [x] Stats cards (XP, Streak, Lessons, Achievements)
- [x] Quick-access cards with progress bars

## STEP 7 — Learn + Lesson IDE ✅
- [x] Learn page (full curriculum with 4 level sections)
- [x] Lesson cards with lock/complete/active states
- [x] LessonIDE (3-panel: instructions | editor | terminal)
- [x] Code execution integration
- [x] Complete lesson + XP reward flow
- [x] Monaco Editor integration (currently textarea, Monaco next)

## STEP 8 — Secondary Pages ✅
- [x] Practice page (challenge list + IDE)
- [x] Quizzes page (quiz flow with progress)
- [x] Projects page (project cards)

## STEP 9 — Profile + Polish ✅
- [x] Profile page (heatmap + achievements + stats)
- [x] Landing page ✅ (already implemented)
- [x] Command palette (⌘K)
- [x] Final polish + responsive testing
