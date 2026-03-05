"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { Project, CostItem } from "@/lib/data"

export function CostingTab({ project }: { project: Project }) {
  const [items, setItems] = useState<CostItem[]>(project.costItems ?? [])
  // ✅ Fallback to 12 if taxRate is undefined/null from Firebase
  const [taxRate, setTaxRate] = useState<number>(
    typeof project.taxRate === "number" && !isNaN(project.taxRate) ? project.taxRate : 12
  )

  const totalBudgeted = items.reduce((sum, i) => sum + (Number(i.budgeted) || 0), 0)
  const totalActual = items.reduce((sum, i) => sum + (Number(i.actual) || 0), 0)
  const taxAmount = totalActual * (taxRate / 100)
  const grandTotal = totalActual + taxAmount
  const budgetUsed = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0

  function updateItem(id: string, field: keyof CostItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: `c-new-${Date.now()}`,
        description: "New item",
        category: "Materials",
        budgeted: 0,
        actual: 0,
      },
    ])
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(n)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Budget summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalBudgeted)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Actual Spend</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalActual)}</p>
            <Progress value={Math.min(budgetUsed, 100)} className="h-1.5 mt-2" />
            <p className="text-[11px] text-muted-foreground mt-1">{budgetUsed.toFixed(1)}% of budget used</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Grand Total (incl.{" "}
              <input
                type="number"
                value={taxRate}
                min={0}
                max={100}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="inline-block w-10 bg-transparent border-b border-muted-foreground text-center text-xs focus:outline-none focus:border-primary"
              />
              % tax)
            </p>
            <p className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Line items table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">Cost Breakdown</CardTitle>
          <Button
            onClick={addItem}
            variant="outline"
            size="sm"
            className="gap-1.5 border-border text-foreground bg-secondary"
          >
            <Plus className="h-3.5 w-3.5" /> Add Row
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 min-w-[200px]">Description</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 w-[120px]">Category</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 w-[140px]">Budgeted</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 w-[140px]">Actual</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 w-[120px]">Variance</th>
                  <th className="p-3 w-[50px]" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const variance = (Number(item.budgeted) || 0) - (Number(item.actual) || 0)
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0 group">
                      <td className="p-2">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          className="bg-transparent border-transparent hover:border-border focus:border-primary h-8 text-sm text-foreground"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.category}
                          onChange={(e) => updateItem(item.id, "category", e.target.value)}
                          className="bg-transparent border-transparent hover:border-border focus:border-primary h-8 text-sm text-muted-foreground"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={item.budgeted}
                          onChange={(e) => updateItem(item.id, "budgeted", Number(e.target.value))}
                          className="bg-transparent border-transparent hover:border-border focus:border-primary h-8 text-sm text-foreground text-right"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={item.actual}
                          onChange={(e) => updateItem(item.id, "actual", Number(e.target.value))}
                          className="bg-transparent border-transparent hover:border-border focus:border-primary h-8 text-sm text-foreground text-right"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`text-sm font-medium ${
                            variance >= 0 ? "text-emerald-400" : "text-primary"
                          }`}
                        >
                          {variance >= 0 ? "+" : ""}
                          {formatCurrency(variance)}
                        </span>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={2} className="p-3 text-sm font-semibold text-foreground">
                    Subtotal
                  </td>
                  <td className="p-3 text-right text-sm font-semibold text-foreground">
                    {formatCurrency(totalBudgeted)}
                  </td>
                  <td className="p-3 text-right text-sm font-semibold text-foreground">
                    {formatCurrency(totalActual)}
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`text-sm font-semibold ${
                        totalBudgeted - totalActual >= 0 ? "text-emerald-400" : "text-primary"
                      }`}
                    >
                      {totalBudgeted - totalActual >= 0 ? "+" : ""}
                      {formatCurrency(totalBudgeted - totalActual)}
                    </span>
                  </td>
                  <td />
                </tr>
                <tr>
                  <td colSpan={2} className="p-3 text-sm text-muted-foreground">
                    Tax ({taxRate}%)
                  </td>
                  <td />
                  <td className="p-3 text-right text-sm text-muted-foreground">
                    {formatCurrency(taxAmount)}
                  </td>
                  <td colSpan={2} />
                </tr>
                <tr className="border-t border-border">
                  <td colSpan={2} className="p-3 text-sm font-bold text-primary">
                    Grand Total
                  </td>
                  <td />
                  <td className="p-3 text-right text-sm font-bold text-primary">
                    {formatCurrency(grandTotal)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}