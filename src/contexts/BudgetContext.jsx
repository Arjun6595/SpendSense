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

  // Reset on logout but preserve localStorage as backup
  useEffect(() => {
    if (!user) {
      console.log('🚪 User logged out, clearing in-memory data only') // Debug log
      console.log('📦 localStorage contents before logout:', {
        budgetTrackerData: localStorage.getItem('budgetTrackerData'),
        allKeys: Object.keys(localStorage).filter(k => k.includes('budget'))
      })
      dispatch({ type: "CLEAR_ALL_DATA" })
      // Keep localStorage as backup - don't clear it!
      // This ensures data survives logout/login cycles
      setLoading(false)
    } else {
      console.log('🔑 User logged in:', user.uid) // Debug log
      console.log('📦 localStorage contents after login:', {
        userSpecific: localStorage.getItem(`budgetTrackerData:${user.uid}`),
        general: localStorage.getItem('budgetTrackerData'),
        allKeys: Object.keys(localStorage).filter(k => k.includes('budget'))
      })
    }
  }, [user])

  // Initial load: Firestore -> per-user local -> legacy local -> defaults
  useEffect(() => {
    let isMounted = true
    async function hydrate() {
      if (!user) return
      try {
        setLoading(true)
        console.log('🔄 Starting data hydration for user:', user.uid)
        
        const ref = doc(db, "budgets", user.uid)
        const snap = await getDoc(ref)
        
        if (snap.exists()) {
          console.log('📥 Found Firestore data, loading...')
          const firestoreData = normalizeData(snap.data())
          
          console.log('📊 Firestore data summary:', {
            income: firestoreData.income,
            expenses: firestoreData.expenses?.length || 0,
            categories: firestoreData.categories?.length || 0,
            budgetLimits: Object.keys(firestoreData.budgetLimits || {}).length
          })
          
          if (isMounted) {
            dispatch({ type: "LOAD_DATA", payload: firestoreData })
            console.log('✅ Loaded data from Firestore')
          }
          
          // Update localStorage with Firestore data
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem(localKey, JSON.stringify(firestoreData))
              localStorage.setItem("budgetTrackerData", JSON.stringify(firestoreData))
              console.log('💾 Updated localStorage with Firestore data')
            }
          } catch (e) {
            console.error('❌ Error updating localStorage:', e)
          }
        } else {
          console.log('🔍 No Firestore data found, checking localStorage...')
          // No Firestore data, check localStorage for existing data
          let localData = null
          
          // Check user-specific localStorage first
          try {
            if (typeof window !== "undefined") {
              const userSpecificData = localStorage.getItem(localKey)
              if (userSpecificData) {
                localData = JSON.parse(userSpecificData)
                console.log('📦 Found user-specific localStorage data:', {
                  expenses: localData?.expenses?.length || 0,
                  income: localData?.income || 0,
                  categories: localData?.categories?.length || 0
                })
              }
            }
          } catch (e) {
            console.error('❌ Error parsing user-specific localStorage:', e)
          }
          
          // Fallback to general localStorage
          if (!localData) {
            try {
              if (typeof window !== "undefined") {
                const generalData = localStorage.getItem("budgetTrackerData")
                if (generalData) {
                  localData = JSON.parse(generalData)
                  console.log('📦 Found general localStorage data as fallback')
                }
              }
            } catch (e) {
              console.error('❌ Error parsing general localStorage:', e)
            }
          }
          
          // If we have meaningful localStorage data, use it and sync to Firestore
          if (localData && (localData.expenses?.length > 0 || localData.income > 0)) {
            console.log('✅ Using localStorage data with user content')
            localData = normalizeData(localData)
            
            // Sync to Firestore
            try {
              await setDoc(ref, localData, { merge: true })
              console.log('🔄 Synced localStorage data to Firestore')
            } catch (e) {
              console.error('❌ Error syncing to Firestore:', e)
            }
            
            if (isMounted) {
              dispatch({ type: "LOAD_DATA", payload: localData })
              console.log('✅ Loaded data from localStorage backup')
            }
          } else {
            // No meaningful data found, use defaults
            console.log('📋 No existing data found, using defaults')
            const defaultData = normalizeData(initialState)
            
            try {
              await setDoc(ref, defaultData, { merge: true })
              console.log('🔄 Created initial Firestore document')
            } catch (e) {
              console.error('❌ Error creating initial Firestore document:', e)
            }
            
            if (isMounted) {
              dispatch({ type: "LOAD_DATA", payload: defaultData })
              console.log('✅ Loaded default data')
            }
            
            // Update localStorage
            try {
              if (typeof window !== "undefined") {
                localStorage.setItem(localKey, JSON.stringify(defaultData))
                localStorage.setItem("budgetTrackerData", JSON.stringify(defaultData))
              }
            } catch (e) {
              console.error('❌ Error updating localStorage with defaults:', e)
            }
          }
        }
      } catch (e) {
        console.error('❌ Error during data hydration:', e)
        // On error, try to load from localStorage as fallback
        let fallbackData = null
        
        try {
          if (typeof window !== "undefined") {
            const userData = localStorage.getItem(localKey)
            if (userData) {
              fallbackData = normalizeData(JSON.parse(userData))
            } else {
              const generalData = localStorage.getItem("budgetTrackerData")
              if (generalData) {
                fallbackData = normalizeData(JSON.parse(generalData))
              }
            }
          }
        } catch (localError) {
          console.error('❌ Error loading fallback data:', localError)
        }
        
        if (fallbackData && isMounted) {
          dispatch({ type: "LOAD_DATA", payload: fallbackData })
          console.log('✅ Loaded fallback data from localStorage')
        } else if (isMounted) {
          dispatch({ type: "LOAD_DATA", payload: normalizeData(initialState) })
          console.log('✅ Loaded default data as final fallback')
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

  // Persist to Firestore after initial loading with retry logic
  useEffect(() => {
    if (!user) return
    if (loading) return
    async function persist() {
      try {
        const ref = doc(db, "budgets", user.uid)
        console.log('Saving data to Firestore for user:', user.uid) // Debug log
        await setDoc(ref, state, { merge: true })
        console.log('Data saved successfully to Firestore') // Debug log
      } catch (e) {
        console.error("Error saving to Firestore:", e) // Debug log
        console.log('Firestore save failed, but localStorage backup preserved') // Debug log
        // Don't clear localStorage on Firestore errors - keep it as backup
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
