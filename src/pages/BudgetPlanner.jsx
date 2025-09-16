import { useState } from "react"
import { useBudget } from "../contexts/BudgetContext"
import { Target, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import Layout from "../components/Layout"

export default function BudgetPlanner() {
  const { categories, budgetLimits, categoryExpenses, settings, dispatch } = useBudget()
  const [editingCategory, setEditingCategory] = useState(null)
  const [budgetAmount, setBudgetAmount] = useState("")

  const handleSetBudget = (categoryId) => {
    if (!budgetAmount || Number.parseFloat(budgetAmount) <= 0) return

    dispatch({
      type: "SET_BUDGET_LIMIT",
      payload: {
        categoryId,
        limit: Number.parseFloat(budgetAmount),
      },
    })

    setEditingCategory(null)
    setBudgetAmount("")
  }

  const getBudgetStatus = (category) => {
    const spent = category.spent
    const budget = budgetLimits[category.id] || 0

    if (budget === 0) return { status: "no-budget", percentage: 0 }

    const percentage = (spent / budget) * 100

    if (percentage >= 100) return { status: "over", percentage }
    if (percentage >= 80) return { status: "warning", percentage }
    return { status: "good", percentage }
  }

  const totalBudget = Object.values(budgetLimits).reduce((sum, limit) => sum + limit, 0)
  const totalSpent = categoryExpenses.reduce((sum, cat) => sum + cat.spent, 0)

  return (
    <Layout title="Budget Planner" description="Set spending limits for each category and track your progress">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-blue-600">
                  {settings.currency}
                  {totalBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">
                  {settings.currency}
                  {totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl mr-4 ${totalSpent > totalBudget ? "bg-red-100" : "bg-green-100"}`}>
                {totalSpent > totalBudget ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className={`text-2xl font-bold ${totalSpent > totalBudget ? "text-red-600" : "text-green-600"}`}>
                  {settings.currency}
                  {Math.abs(totalBudget - totalSpent).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Budgets */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Category Budgets</h2>

          <div className="space-y-4">
            {categories.map((category) => {
              const categoryData = categoryExpenses.find((cat) => cat.id === category.id)
              const budgetStatus = getBudgetStatus(categoryData)
              const budget = budgetLimits[category.id] || 0

              return (
                <div key={category.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }} />
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Spent: {settings.currency}
                          {categoryData.spent.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Budget: {settings.currency}
                          {budget.toLocaleString()}
                        </p>
                      </div>

                      {editingCategory === category.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.,]?[0-9]*"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0.00"
                          />
                          <button
                            onClick={() => handleSetBudget(category.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(null)
                              setBudgetAmount("")
                            }}
                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCategory(category.id)
                            setBudgetAmount(budget.toString())
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm "
                        >
                          {budget > 0 ? "Edit" : "Set Budget"}
                        </button>
                      )}
                    </div>
                  </div>

                  {budget > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{budgetStatus.percentage.toFixed(1)}% used</span>
                        <span
                          className={`text-sm font-medium ${
                            budgetStatus.status === "over"
                              ? "text-red-600"
                              : budgetStatus.status === "warning"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {budgetStatus.status === "over"
                            ? "Over Budget"
                            : budgetStatus.status === "warning"
                              ? "Near Limit"
                              : "Within Budget"}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            budgetStatus.status === "over"
                              ? "bg-red-500"
                              : budgetStatus.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(budgetStatus.percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Budget Tips */}
        <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-green-900 mb-3">💡 Budget Planning Tips</h3>
          <ul className="space-y-2 text-green-800">
            <li>• Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
            <li>• Set realistic budgets based on your past spending patterns</li>
            <li>• Review and adjust your budgets monthly</li>
            <li>• Leave some buffer room for unexpected expenses</li>
            <li>• Focus on the categories where you overspend the most</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
