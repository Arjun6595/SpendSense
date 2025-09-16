import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useBudget } from "../contexts/BudgetContext"
import { SettingsIcon, DollarSign, Palette, Download, Upload, Trash2, User, LogOut, Lock } from "lucide-react"
import Layout from "../components/Layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar"
import { EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from "firebase/auth"
import { doc, deleteDoc } from "firebase/firestore"
import { db, auth } from "../../lib/firebase"
import { useToast } from "../../hooks/use-toast"

const currencies = [
  { code: "₹", name: "Indian Rupee (₹)" },
  { code: "$", name: "US Dollar ($)" },
  { code: "€", name: "Euro (€)" },
  { code: "£", name: "British Pound (£)" },
  { code: "¥", name: "Japanese Yen (¥)" },
  { code: "C$", name: "Canadian Dollar (C$)" },
  { code: "A$", name: "Australian Dollar (A$)" },
]

const themes = [
  { id: "light", name: "Light Theme" },
  { id: "dark", name: "Dark Theme" },
]

export default function Settings() {
  const { user, logout } = useAuth()
  const { settings, dispatch, income, expenses, categories, budgetLimits } = useBudget()
  const { toast } = useToast()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [password, setPassword] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")

  const handleLogout = async () => {
    try {
      await logout()
      // Clear current in-memory state to avoid showing prior user data
      dispatch({ type: "CLEAR_ALL_DATA" })
      if (typeof window !== "undefined") {
        try { localStorage.removeItem("budgetTrackerData") } catch {}
      }
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  const handleCurrencyChange = (currency) => {
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { currency },
    })
  }

  const handleThemeChange = (theme) => {
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { theme },
    })
  }

  const exportData = () => {
    const data = {
      income,
      expenses,
      categories,
      budgetLimits,
      settings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `budget-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        if (data.income !== undefined) dispatch({ type: "SET_INCOME", payload: data.income })
        if (data.expenses) {
          data.expenses.forEach((expense) => {
            dispatch({ type: "ADD_EXPENSE", payload: expense })
          })
        }
        if (data.categories) {
          data.categories.forEach((category) => {
            dispatch({ type: "ADD_CATEGORY", payload: category })
          })
        }
        if (data.budgetLimits) {
          Object.entries(data.budgetLimits).forEach(([categoryId, limit]) => {
            dispatch({ type: "SET_BUDGET_LIMIT", payload: { categoryId, limit } })
          })
        }
        if (data.settings) {
          dispatch({ type: "UPDATE_SETTINGS", payload: data.settings })
        }

        alert("Data imported successfully!")
      } catch (error) {
        alert("Error importing data. Please check the file format.")
      }
    }
    reader.readAsText(file)
    event.target.value = "" // Reset file input
  }

  const clearAllData = () => {
    setShowClearDialog(true)
    setPassword("")
    setError("")
  }

  const handlePasswordVerification = async () => {
    if (!password.trim()) {
      setError("Please enter your password")
      return
    }

    setIsVerifying(true)
    setError("")
    let operationSuccessful = false

    try {
      // Create credential with user's email and entered password
      const credential = EmailAuthProvider.credential(user.email, password)
      
      // Re-authenticate the user
      await reauthenticateWithCredential(user, credential)
      
      // If re-authentication is successful, clear the data
      try {
        // Delete the Firestore document
        const docRef = doc(db, "budget", user.uid)
        await deleteDoc(docRef)
        
        // Clear local state
        dispatch({ type: "CLEAR_ALL_DATA" })
        
        // Clear localStorage as backup
        localStorage.removeItem("budgetTrackerData")
        
        // Mark operation as successful
        operationSuccessful = true
        
        // Reset all states and close dialog
        setIsVerifying(false)
        setShowClearDialog(false)
        setPassword("")
        setError("")
        
        // Show success toast
        toast({
          title: "Success!",
          description: "All data cleared successfully!",
          variant: "default",
        })
        
      } catch (firestoreError) {
        console.error("Error clearing Firestore data:", firestoreError)
        setError("Failed to clear data. Please try again.")
        return
      }
      
    } catch (error) {
      console.error("Re-authentication failed:", error)
      
      // Handle different error types
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setError("Incorrect password. Please try again.")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.")
      } else {
        setError("Authentication failed. Please try again.")
      }
    } finally {
      // Only reset loading state if operation was not successful
      if (!operationSuccessful) {
        setIsVerifying(false)
      }
    }
  }

  const handleDialogClose = () => {
    if (!isVerifying) {
      setShowClearDialog(false)
      setPassword("")
      setError("")
    }
  }

  const handleForgotPassword = async () => {
    try {
      // Use device language for email template
      auth.languageCode = typeof navigator !== 'undefined' ? navigator.language : 'en';

      // Provide an explicit continue URL to avoid provider/template issues
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, user?.email, actionCodeSettings)

      toast({
        title: "Password reset email sent",
        description: `We sent a reset link to ${user?.email}. Check your inbox (or spam).`,
      })
    } catch (err) {
      console.error("reset error", err)
      let message = "Please try again in a moment.";
      if (err?.code === 'auth/missing-email') message = 'No email on file for this account.'
      if (err?.code === 'auth/invalid-email') message = 'Email address looks invalid.'
      if (err?.code === 'auth/user-not-found') message = 'No user found with this email.'
      if (err?.code === 'auth/invalid-continue-uri') message = 'Reset link URL is invalid. Please contact support.'
      if (err?.code === 'auth/unauthorized-continue-uri') message = 'This domain is not authorized in Firebase Auth settings.'

      toast({
        title: "Could not send reset email",
        description: message,
        variant: "destructive",
      })
    }
  }

  return (
    <Layout title="Settings" description="Customize your budget tracker experience">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 mr-3">
                {/* If you have user.photoURL, it will show; otherwise fallback to initials */}
                <AvatarImage src={user?.photoURL || undefined} alt={user?.email || "User"} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium">
                  {(() => {
                    const email = user?.email || "";
                    const namePart = email.split("@")[0];
                    const initials = namePart
                      .split(/[._-]+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map(s => s[0]?.toUpperCase())
                      .join("") || "U";
                    return initials;
                  })()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Logged in as: <span className="font-medium text-gray-800">{user?.email}</span>
              </p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-800 rounded-xl  "
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Currency Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Currency</h2>
            </div>

            <div className="space-y-3">
              {currencies.map((currency) => (
                <label key={currency.code} className="flex items-center">
                  <input
                    type="radio"
                    name="currency"
                    value={currency.code}
                    checked={settings.currency === currency.code}
                    onChange={() => handleCurrencyChange(currency.code)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{currency.name}</span>
                </label>
              ))}
            </div>
          </div>


        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <SettingsIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl   cursor-pointer">
              <Download className="h-5 w-5 mr-2" />
              Import Data
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
            <button
              onClick={exportData}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl  "
            >
              <Upload className="h-5 w-5 mr-2" />
              Export Data
            </button>

            <button
              onClick={clearAllData}
              className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-xl  "
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Clear All Data
            </button>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>
              • <strong>Export:</strong> Download your data as a JSON file for backup
            </p>
            <p>
              • <strong>Import:</strong> Restore data from a previously exported file
            </p>
            <p>
              • <strong>Clear:</strong> Remove all data and start fresh
            </p>
          </div>
        </div>

      </div>

      {/* Password Verification Dialog */}
      <Dialog open={showClearDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md bg-white no-hover-lift">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Confirm Data Deletion
            </DialogTitle>
            <DialogDescription>
              This action will permanently delete all your budget data. Please enter your account password to confirm.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password for {user?.email}
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isVerifying}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isVerifying) {
                    handlePasswordVerification()
                  }
                }}
                className={error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              <button
                type="button"
                onClick={handleForgotPassword}
                className="mt-2 text-sm text-blue-600 hover:underline"
                disabled={isVerifying}
              >
                Forgot password?
              </button>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDialogClose}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePasswordVerification}
              disabled={isVerifying || !password.trim()}
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
