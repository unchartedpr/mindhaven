import { lazy } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'

// The home page and shell load up front; everything else is split into its own chunk so the first
// paint stays small. The service worker precaches all chunks, so this costs nothing offline.
const CheckIn = lazy(() => import('./pages/CheckIn').then((m) => ({ default: m.CheckIn })))
const Exercises = lazy(() => import('./pages/Exercises').then((m) => ({ default: m.Exercises })))
const Journal = lazy(() => import('./pages/Journal').then((m) => ({ default: m.Journal })))
const Insights = lazy(() => import('./pages/Insights').then((m) => ({ default: m.Insights })))
const Resources = lazy(() => import('./pages/Resources').then((m) => ({ default: m.Resources })))
const SafetyPlan = lazy(() => import('./pages/SafetyPlan').then((m) => ({ default: m.SafetyPlan })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="check-in" element={<CheckIn />} />
          <Route path="exercises/*" element={<Exercises />} />
          <Route path="journal" element={<Journal />} />
          <Route path="insights" element={<Insights />} />
          <Route path="resources" element={<Resources />} />
          <Route path="safety-plan" element={<SafetyPlan />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
