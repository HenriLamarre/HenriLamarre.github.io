import Graph from './components/Graph'
import { LocaleProvider } from './i18n/locale'

export default function App() {
  return (
    <LocaleProvider>
      <Graph />
    </LocaleProvider>
  )
}
