import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      {/* Navigation Space (Optional) */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10">
        <span className="font-black text-xl tracking-tighter text-blue-600">SHIP <span className="text-purple-800">WITH</span> <span className="text-slate-900">TAGS</span></span>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;