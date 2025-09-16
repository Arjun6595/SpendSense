import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { useBudget } from "../contexts/BudgetContext"
import { TrendingUp, TrendingDown, Banknote, CreditCard, AlertTriangle } from "lucide-react"
import Layout from "../components/Layout"
import Grid2x2Icon from "../components/Grid2x2Icon"

export default function Dashboard() {
  const { income, totalExpenses, remainingBudget, categoryExpenses, settings } = useBudget()

  const exceededBudgets = categoryExpenses.filter((cat) => cat.budget > 0 && cat.spent > cat.budget).length

  const pieData = categoryExpenses
    .filter((category) => category.spent > 0)
    .map((category) => ({
      name: category.name,
      value: category.spent,
      color: category.color,
    }))

  const barData = categoryExpenses
    .filter((category) => category.spent > 0)
    .map((category) => ({
      name: category.name.length > 10 ? category.name.substring(0, 10) + "..." : category.name,
      spent: category.spent,
      budget: category.budget,
      color: category.color,
    }))

  const StatCard = ({ title, value, icon: Icon, color, trend, showCurrency = true }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <div className="flex items-center justify-between">
          <p className={`text-2xl font-bold ${color} flex-1`}>
            {showCurrency && settings.currency}
            {Math.abs(value).toLocaleString()}
          </p>
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ml-4 ${
              color === "text-green-600"
                ? "bg-green-100"
                : color === "text-red-600"
                  ? "bg-red-100"
                  : color === "text-yellow-600"
                    ? "bg-yellow-100"
                    : "bg-blue-100"
            }`}
          >
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center mt-1 text-sm ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
            {trend > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Layout title="Dashboard" description="Overview of your financial status">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="total-income-card">
            <StatCard title="Total Income" value={income} icon={Banknote} color="text-green-600" />
          </div>
          <StatCard title="Total Expenses" value={totalExpenses} icon={CreditCard} color="text-red-600" />
          <StatCard
            title="Remaining Budget"
            value={remainingBudget}
            icon={TrendingUp}
            color={remainingBudget >= 0 ? "text-green-600" : "text-red-600"}
          />
          <StatCard
            title="Categories"
            value={categoryExpenses.filter((cat) => cat.spent > 0).length}
            icon={Grid2x2Icon}
            color="text-blue-600"
            showCurrency={false}
          />
          <StatCard
            title="Exceeded Budgets"
            value={exceededBudgets}
            icon={AlertTriangle}
            color="text-yellow-600"
            showCurrency={false}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Distribution</h3>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${settings.currency}${value}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">No expenses to display</div>
            )}
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {settings.currency}
                    {entry.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Spending</h3>
            {barData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${settings.currency}${value}`, ""]} />
<Bar dataKey="spent" name="Spent">
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">No data to display</div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Overview</h3>
          <div className="space-y-4">
            {categoryExpenses.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }} />
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500">
                      {category.budget > 0 && `Budget: ${settings.currency}${category.budget}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {settings.currency}
                    {category.spent.toLocaleString()}
                  </p>
                  {category.budget > 0 && (
                    <p className={`text-sm ${category.spent > category.budget ? "text-red-600" : "text-green-600"}`}>
                      {category.spent > category.budget ? "Over budget" : "Within budget"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
