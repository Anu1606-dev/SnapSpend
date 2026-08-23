import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import Topbar from './Topbar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-void transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="hidden dark:block pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute -top-32 right-0 w-md h-112 bg-violet/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-32 w-96 h-96 bg-electric/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-mint/10 rounded-full blur-3xl" />
        </div>
        <Topbar />
        <main className="flex-1 min-w-0 overflow-x-hidden pb-20 md:pb-0 relative">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}