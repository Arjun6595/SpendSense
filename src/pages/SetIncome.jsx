import { useState } from "react"
import { useBudget } from "../contexts/BudgetContext"
import { DollarSign, Save } from "lucide-react"
import Layout from "../components/Layout"

export default function SetIncome() {
  const { income, settings, dispatch } = useBudget()
  const [newIncome, setNewIncome] = useState(income)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch({ type: "SET_INCOME", payload: Number.parseFloat(newIncome) || 0 })
    setIsEditing(false)
  }

  return (
    <Layout title="Set Monthly Income" description="Set your monthly income to track your budget effectively">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Current Income Display */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Current Monthly Income</p>
                <p className="text-3xl font-bold text-green-600">
                  {`${settings.currency}${Number(income).toLocaleString("en-IN")}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl  "
            >
              Edit Income
            </button>
          </div>
        </div>

        {/* Income Form */}
        {isEditing && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl py-3 px-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                  <span className="text-gray-500 text-lg mr-2">{settings.currency}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    id="income"
                    value={newIncome}
                    onChange={(e) => setNewIncome(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl  "
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Income
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setNewIncome(income)
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl  "
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Income Tips */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Income Tips</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Include your salary, freelance income, and other regular income sources</li>
            <li>• Use your net income (after taxes) for more accurate budgeting</li>
            <li>• Update your income whenever it changes to keep your budget accurate</li>
            <li>• Consider averaging variable income over several months</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
