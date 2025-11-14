import { AppProvider } from './context/AppContext'
import { Landing } from './components/Landing'

export const revalidate = 60

export default function Home() {
  return (
    <AppProvider>
      <Landing />
    </AppProvider>
  )
}
 
