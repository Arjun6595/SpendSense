import { useState } from "react"
import { useBudget } from "../contexts/BudgetContext"
import { Plus, Calendar, Tag, FileText, Trash2 } from "lucide-react"
import Layout from "../components/Layout"

export default function AddExpense() {
  const { categories, expenses, settings, addExpense, removeExpense } = useBudget()
  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.amount || !formData.categoryId) return

    // Create timestamp from the user-selected date
    const selectedDate = new Date(formData.date)
    // Set time to current time to maintain chronological order for same-day expenses
    const now = new Date()
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())

    addExpense({
      ...formData,
      id: Date.now().toString(), // unique id for the expense
      amount: Number.parseFloat(formData.amount),
      timestamp: selectedDate.toISOString(),
    })

    setFormData({
      amount: "",
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
    })
  }

  const handleDeleteExpense = (expenseId) => {
    removeExpense(expenseId)
  }

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)

  return (
    <Layout title="Add Expense" description="Track your spending by adding new expenses">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Expense Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl py-3 px-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                  <span className="text-gray-500 text-lg mr-2">{settings.currency}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="flex-1 bg-transparent outline-none text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="note"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional note"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-3 font-medium hover:bg-blue-700 transition-colors w-full"
              >
                <Plus className="h-5 w-5" />
                Add Expense
              </button>
            </form>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h2>
            <ul className="divide-y divide-gray-100">
              {recentExpenses.length === 0 ? (
                <li className="py-4 text-sm text-gray-500">No expenses yet</li>
              ) : (
                recentExpenses.map((expense) => {
                  const category = categories.find((c) => c.id === expense.categoryId)
                  return (
                    <li key={expense.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {settings.currency}
                          {Number(expense.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category?.color || '#d1d5db' }} />
                          <span>
                            {category ? category.name : "Uncategorized"} • {new Date(expense.timestamp || expense.date).toLocaleDateString()}
                            {expense.note ? ` • ${expense.note}` : ""}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
