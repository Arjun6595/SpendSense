import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, DollarSign, Plus, Target, Settings, Menu, X, LogOut } from "lucide-react"
import Grid2x2Icon from "./Grid2x2Icon"
import FloatingMoney from "./FloatingMoney"
import { useAuth } from "../contexts/AuthContext"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Set Income", href: "/set-income", icon: DollarSign },
  { name: "Add Expense", href: "/add-expense", icon: Plus },
  { name: "Categories", href: "/add-category", icon: Grid2x2Icon },
  { name: "Budget Planner", href: "/budget-planner", icon: Target },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Layout({ children, title, description }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dedicated controlled pattern instead of global */}
      <FloatingMoney topOffset={45} />
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3 relative z-20 isolate bg-white">
              <span className="relative inline-flex h-9 w-9 overflow-hidden rounded-full bg-white ring-1 ring-black/5 shadow-none">
                <img src="/cash-daddy-logo.png" alt="SpendSense" className="h-full w-full object-cover" />
              </span>
              <h1 className="text-xl font-extrabold text-[var(--primary-green-dark)] tracking-tight">SpendSense</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
               <Link
  key={item.name}
  to={item.href}
  onClick={() => setSidebarOpen(false)}
  className={`${isActive ? "bg-blue-100 text-blue-700" : "text-gray-600"}  flex items-center px-2 py-2 text-sm font-medium rounded-xl`}
>
  <Icon className="mr-3 h-5 w-5" />
  {item.name}
</Link>

              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex h-16 items-center px-4 bg-white relative z-20">
            <div className="flex items-center gap-3">
              <span className="relative inline-flex h-9 w-9 overflow-hidden rounded-full bg-white ring-1 ring-black/5 shadow-none">
                <img src="/cash-daddy-logo.png" alt="SpendSense" className="h-full w-full object-cover" />
              </span>
              <h1 className="text-xl font-extrabold text-[var(--primary-green-dark)] tracking-tight">SpendSense</h1>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
  key={item.name}
  to={item.href}
  className={`${isActive ? "bg-blue-100 text-blue-700" : "text-gray-600"} flex items-center px-2 py-2 text-sm font-medium rounded-xl`}
>
  <Icon className="mr-3 h-5 w-5" />
  {item.name}
</Link>


              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white no-blur px-4 lg:px-6 relative z-10">
          <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          {title && (
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && <p className="text-gray-700">{description}</p>}
            </div>
          )}
          
          {/* User info and logout */}
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          )}
        </div>
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
