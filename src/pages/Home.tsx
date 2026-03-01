import { Header } from '../components/Header'
import { ObjectiveList } from '../components/ObjectiveList'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-4xl overflow-hidden rounded-3xl shadow-xl">
        <Header />

        <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8">
          <ObjectiveList />
        </div>
      </div>
    </div>
  )
}
