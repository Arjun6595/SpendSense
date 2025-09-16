import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react"
import { db } from "../../lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"

const BudgetContext = createContext(null)

// Default app state
const initialState = {
  income: 0, // new schema
  expenses: [],
  categories: [
    { id: "1", name: "Food & Dining", color: "#ef4444" },
    { id: "2", name: "Transportation", color: "#3b82f6" },
    { id: "3", name: "Shopping", color: "#8b5cf6" },
    { id: "4", name: "Entertainment", color: "#f59e0b" },
    { id: "5", name: "Bills & Utilities", color: "#10b981" },
  ],
  budgetLimits: {},
  settings: { currency: "₹", theme: "light" },
}

// Normalize any previously saved data to the new schema
function normalizeData(raw) {
  if (!raw || typeof raw !== "object") return { ...initialState }
  const out = { ...initialState, ...raw }
  // Migrate old field `budget` -> `income`
  if (raw.budget != null && (raw.income == null || out.income === 0)) {
    out.income = Number(raw.budget) || 0
  }
  // Ensure shapes
  if (!Array.isArray(out.expenses)) out.expenses = []
  if (!Array.isArray(out.categories) || out.categories.length === 0) out.categories = initialState.categories
  if (!out.budgetLimits || typeof out.budgetLimits !== "object") out.budgetLimits = {}
  out.settings = { ...initialState.settings, ...(out.settings || {}) }
  return out
}

// Find any older local backups like budgetTrackerData:* and pick the richest one
function findAnyLocalBackup() {
  try {
    if (typeof window === "undefined") return null
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("budgetTrackerData:"))
    let best = null
    let bestScore = -1
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k)
        if (!raw) continue
        const obj = JSON.parse(raw)
        const score = (Number(obj?.income) || 0) + (Array.isArray(obj?.expenses) ? obj.expenses.length : 0)
        if (score > bestScore) {
          best = obj
          bestScore = score
        }
      } catch {}
    }
    return best
  } catch {
    return null
  }
}

function scoreData(d) {
  if (!d) return 0
  return (Number(d.income) || 0) + (Array.isArray(d.expenses) ? d.expenses.length : 0)
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_INCOME":
      return { ...state, income: Number(action.payload) || 0 }
    case "ADD_EXPENSE":
      return { ...state, expenses: [...state.expenses, { ...action.payload }] }
    case "DELETE_EXPENSE":
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) }
    case "ADD_CATEGORY": {
      const newCategory = {
        id: action.payload.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: action.payload.name,
        color: action.payload.color || "#3b82f6",
      }
      return { ...state, categories: [...state.categories, newCategory] }
    }
    case "DELETE_CATEGORY":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) }
    case "SET_BUDGET_LIMIT": {
      const { categoryId, limit } = action.payload
      return { ...state, budgetLimits: { ...state.budgetLimits, [categoryId]: Number(limit) || 0 } }
    }
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case "LOAD_DATA":
      return { ...state, ...action.payload }
    case "CLEAR_ALL_DATA":
      return { ...initialState }
    default:
      return state
  }
}

export function BudgetProvider({ children, user }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(true)

  // Keyed local backup per user + legacy key for safety
  const localKey = user ? `budgetTrackerData:${user.uid}` : null

  // Reset on logout and clear localStorage
  useEffect(() => {
    if (!user) {
      console.log('User logged out, clearing data and localStorage') // Debug log
      dispatch({ type: "CLEAR_ALL_DATA" })
      // Clear all localStorage data
      try {
        if (typeof window !== "undefined") {
          // Clear all budgetTrackerData entries
          const keys = Object.keys(localStorage).filter(k => k.startsWith("budgetTrackerData"))
          keys.forEach(key => localStorage.removeItem(key))
          console.log('Cleared localStorage keys:', keys) // Debug log
        }
      } catch (e) {
        console.error('Error clearing localStorage:', e)
      }
      setLoading(false)
    } else {
      console.log('User logged in:', user.uid) // Debug log
    }
  }, [user])

  // Initial load: Firestore -> per-user local -> legacy local -> defaults
  useEffect(() => {
    let isMounted = true
    async function hydrate() {
      if (!user) return
      try {
        setLoading(true)
        console.log('Starting data hydration for user:', user.uid) // Debug log
        
        const ref = doc(db, "budgets", user.uid)
        const snap = await getDoc(ref)
        
        if (snap.exists()) {
          console.log('Found existing data in Firestore:', snap.data()) // Debug log
          const firestoreData = normalizeData(snap.data())
          
          // Always use Firestore data as the source of truth when it exists
          if (isMounted) {
            dispatch({ type: "LOAD_DATA", payload: firestoreData })
            console.log('Loaded Firestore data:', firestoreData) // Debug log
          }
          
          // Update localStorage with Firestore data
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem(localKey, JSON.stringify(firestoreData))
              localStorage.setItem("budgetTrackerData", JSON.stringify(firestoreData))
              console.log('Updated localStorage with Firestore data') // Debug log
            }
          } catch (e) {
            console.error('Error updating localStorage:', e)
          }
        } else {
          console.log('No Firestore data found, checking for legacy data') // Debug log
          // Fallback to legacy collection name "budget"
          const legacyRef = doc(db, "budget", user.uid)
          const legacySnap = await getDoc(legacyRef)
          
          if (legacySnap.exists()) {
            console.log('Found legacy data, migrating to new collection') // Debug log
            const legacyData = normalizeData(legacySnap.data())
            try { await setDoc(ref, legacyData, { merge: true }) } catch {}
            
            if (isMounted) dispatch({ type: "LOAD_DATA", payload: legacyData })
            
            try {
              if (typeof window !== "undefined") {
                localStorage.setItem(localKey, JSON.stringify(legacyData))
                localStorage.setItem("budgetTrackerData", JSON.stringify(legacyData))
              }
            } catch {}
          } else {
            console.log('No cloud data found, checking localStorage backups') // Debug log
            // Create initial doc using local backup if available, otherwise defaults
            let seed = null
            
            // Check for user-specific localStorage first
            try { 
              if (typeof window !== "undefined") {
                seed = JSON.parse(localStorage.getItem(localKey) || "null")
                console.log('Found user-specific localStorage:', seed) // Debug log
              }
            } catch {}
            
            // Fallback to general localStorage
            if (!seed) {
              try { 
                if (typeof window !== "undefined") {
                  seed = JSON.parse(localStorage.getItem("budgetTrackerData") || "null")
                  console.log('Found general localStorage:', seed) // Debug log
                }
              } catch {}
            }
            
            // Find any other backup
            if (!seed) {
              seed = findAnyLocalBackup()
              console.log('Found backup localStorage:', seed) // Debug log
            }
            
            // Use defaults if no data found
            if (!seed) {
              seed = { ...initialState }
              console.log('Using default initial state') // Debug log
            }
            
            seed = normalizeData(seed)

            // Save to Firestore as the initial data for this user
            try { 
              await setDoc(ref, seed, { merge: true })
              console.log('Created initial Firestore document with data:', seed) // Debug log
            } catch (e) {
              console.error('Error creating initial Firestore document:', e)
            }

            if (isMounted) dispatch({ type: "LOAD_DATA", payload: seed })
            
            try {
              if (typeof window !== "undefined") {
                localStorage.setItem(localKey, JSON.stringify(seed))
                localStorage.setItem("budgetTrackerData", JSON.stringify(seed))
                console.log('Updated localStorage with initial data') // Debug log
              }
            } catch {}
          }
        }
      } catch (e) {
        console.error('Error during data hydration:', e) // Debug log
        // On error: attempt local backups
        let localData = null
        try { 
          if (typeof window !== "undefined") {
            localData = JSON.parse(localStorage.getItem(localKey) || "null")
            console.log('Fallback to user-specific localStorage:', localData) // Debug log
          }
        } catch {}
        
        if (!localData) {
          try { 
            if (typeof window !== "undefined") {
              localData = JSON.parse(localStorage.getItem("budgetTrackerData") || "null")
              console.log('Fallback to general localStorage:', localData) // Debug log
            }
          } catch {}
        }
        
        if (localData) {
          if (isMounted) dispatch({ type: "LOAD_DATA", payload: localData })
        } else if (isMounted) {
          console.log('No fallback data available, using defaults') // Debug log
          dispatch({ type: "CLEAR_ALL_DATA" })
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    hydrate()
    return () => { isMounted = false }
  }, [user, localKey])

  // Immediate local backup on any state change
  useEffect(() => {
    if (!user) return
    if (loading) return // don't overwrite backups before hydration completes
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(localKey, JSON.stringify(state))
        localStorage.setItem("budgetTrackerData", JSON.stringify(state))
      }
    } catch {}
  }, [state, user, localKey, loading])

  // Persist to Firestore after initial loading
  useEffect(() => {
    if (!user) return
    if (loading) return
    async function persist() {
      try {
        const ref = doc(db, "budgets", user.uid)
        console.log('Saving data to Firestore for user:', user.uid) // Debug log
        await setDoc(ref, state, { merge: true })
        console.log('Data saved successfully') // Debug log
      } catch (e) {
        console.error("Error saving to Firestore:", e) // Debug log
        // Swallow; local backup already saved
      }
    }
    persist()
  }, [state, user, loading])

  // Derived values
  const totalExpenses = state.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const remainingBudget = state.income - totalExpenses
  const categoryExpenses = state.categories.map((cat) => {
    const spent = state.expenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    return { ...cat, spent, budget: state.budgetLimits[cat.id] || 0 }
  })

  // Action helpers used by pages
  const addExpense = (payload) => {
    const withDefaults = {
      id: payload.id || Date.now().toString(),
      amount: Number(payload.amount) || 0,
      categoryId: payload.categoryId,
      note: payload.note || "",
      date: payload.date || new Date().toISOString().split("T")[0],
      timestamp: payload.timestamp || new Date().toISOString(),
    }
    console.log('Adding expense with categoryId:', withDefaults.categoryId) // Debug log
    console.log('Expense timestamp:', withDefaults.timestamp) // Debug log
    console.log('Expense date:', withDefaults.date) // Debug log
    console.log('Available categories:', state.categories.map(c => ({ id: c.id, name: c.name }))) // Debug log
    dispatch({ type: "ADD_EXPENSE", payload: withDefaults })
  }

  const removeExpense = (id) => dispatch({ type: "DELETE_EXPENSE", payload: id })
  const addCategory = (payload) => {
    const newCategory = {
      id: payload.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: payload.name,
      color: payload.color || "#3b82f6",
    }
    console.log('Adding new category:', newCategory) // Debug log
    dispatch({ type: "ADD_CATEGORY", payload: newCategory })
  }
  const removeCategory = (id) => dispatch({ type: "DELETE_CATEGORY", payload: id })
  const setBudgetLimit = (categoryId, limit) => dispatch({ type: "SET_BUDGET_LIMIT", payload: { categoryId, limit } })
  const updateSettings = (patch) => dispatch({ type: "UPDATE_SETTINGS", payload: patch })
  const setIncome = (amount) => dispatch({ type: "SET_INCOME", payload: amount })

  const value = useMemo(
    () => ({
      ...state,
      totalExpenses,
      remainingBudget,
      categoryExpenses,
      dispatch, // legacy consumers
      addExpense,
      removeExpense,
      addCategory,
      removeCategory,
      setBudgetLimit,
      updateSettings,
      setIncome,
      loading,
    }),
    [state, totalExpenses, remainingBudget, categoryExpenses, loading]
  )

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading data...</div>
  }

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error("useBudget must be used within a BudgetProvider")
  return ctx
}
