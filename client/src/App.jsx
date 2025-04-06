import PostForm from './components/PostForm'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          MERN Stack App with Vite and Tailwind
        </h1>
        <PostForm />
      </div>
    </div>
  )
}

export default App
