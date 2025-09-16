"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, DollarSign, Plus, Target, Settings, Menu, X, PieChart } from "lucide-react"
import Grid2x2Icon from "./Grid2x2Icon"


const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Set Income", href: "/set-income", icon: DollarSign },
  { name: "Add Expense", href: "/add-expense", icon: Plus },
  { name: "Categories", href: "/add-category", icon: Grid2x2Icon },
  { name: "Budget Planner", href: "/budget-planner", icon: Target },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <PieChart className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Budget Tracker</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
  key={item.name}
  href={item.href}
  onClick={() => setSidebarOpen(false)}
  className={`${isActive ? "bg-blue-100 text-blue-700" : "text-gray-600"} no-hover flex items-center px-3 py-2 text-sm font-medium rounded-2xl`}
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
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <PieChart className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Budget Tracker</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
               <Link
  key={item.name}
  href={item.href}
  className={`${isActive ? "bg-blue-100 text-blue-700" : "text-gray-600"} no-hover flex items-center px-3 py-2 text-sm font-medium rounded-2xl`}
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
        <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
          <button
            type="button"
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
        </div>
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
