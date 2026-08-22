import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { CheckIn } from './pages/CheckIn'
import { Exercises } from './pages/Exercises'
import { Journal } from './pages/Journal'
import { Resources } from './pages/Resources'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="check-in" element={<CheckIn />} />
          <Route path="exercises/*" element={<Exercises />} />
          <Route path="journal" element={<Journal />} />
          <Route path="resources" element={<Resources />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
