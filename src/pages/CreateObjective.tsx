import { ObjectiveForm } from '../components/ObjectiveForm'

export default function CreateObjective() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 px-4 py-5 sm:px-6 sm:py-8 md:px-8">
      <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-black text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-accent-600">
          New Objective ✨
        </h1>
        <p className="text-center text-gray-600 mb-10">
          What do you want to accomplish?
        </p>

        <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-8 md:p-10">
          <ObjectiveForm />
        </div>
      </div>
    </div>
  )
}
