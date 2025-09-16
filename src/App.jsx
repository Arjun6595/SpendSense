import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { BudgetProvider } from "./contexts/BudgetContext"
import PrivateRoute from "./components/PrivateRoute"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

// Import pages
import Dashboard from "./pages/Dashboard"
import AddExpense from "./pages/AddExpense"
import AddCategory from "./pages/AddCategory"
import BudgetPlanner from "./pages/BudgetPlanner"
import SetIncome from "./pages/SetIncome"
import Settings from "./pages/Settings"
import Login from "./pages/Login"

// Component that uses auth context and provides user to BudgetProvider
function AppWithAuth() {
  const { user } = useAuth()
  
  return (
    <BudgetProvider user={user}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-expense"
            element={
              <PrivateRoute>
                <AddExpense />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-category"
            element={
              <PrivateRoute>
                <AddCategory />
              </PrivateRoute>
            }
          />
          <Route
            path="/budget-planner"
            element={
              <PrivateRoute>
                <BudgetPlanner />
              </PrivateRoute>
            }
          />
          <Route
            path="/set-income"
            element={
              <PrivateRoute>
                <SetIncome />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster />
      <SonnerToaster />
    </BudgetProvider>
  )
}

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
