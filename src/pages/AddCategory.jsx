import { useState } from "react"
import { useBudget } from "../contexts/BudgetContext"
import { Plus, Tag, Trash2, Palette } from "lucide-react"
import Layout from "../components/Layout"

const colorOptions = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#6b7280",
  "#374151",
]

export default function AddCategory() {
  const { categories, addCategory, removeCategory } = useBudget()
  const [formData, setFormData] = useState({
    name: "",
    color: colorOptions[0],
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    // Use the addCategory helper function which ensures proper ID generation
    addCategory({
      name: formData.name.trim(),
      color: formData.color,
    })

    setFormData({
      name: "",
      color: colorOptions[0],
    })
  }

  const handleDeleteCategory = (categoryId) => {
    if (categories.length <= 1) {
      alert("You must have at least one category")
      return
    }

    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      removeCategory(categoryId)
    }
  }

  return (
    <Layout title="Categories" description="Create and manage expense categories">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Category Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Groceries, Gas, Entertainment"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="inline h-4 w-4 mr-1" />
                  Category Color
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        formData.color === color ? "border-gray-400 scale-110" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: formData.color }} />
                  <span className="text-sm text-gray-600">Selected color</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl  "
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Category
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Categories ({categories.length})</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }} />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-red-600  rounded-lg "
                    disabled={categories.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Tips */}
        <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Category Tips</h3>
          <ul className="space-y-2 text-yellow-800">
            <li>• Create specific categories for better expense tracking (e.g., "Groceries" instead of "Food")</li>
            <li>• Use different colors to easily identify categories in charts and reports</li>
            <li>• Keep the number of categories manageable (5-15 categories work best)</li>
            <li>• You can always add more categories as your spending patterns change</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
