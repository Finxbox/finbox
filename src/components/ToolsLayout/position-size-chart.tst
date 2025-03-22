"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface PositionSizeChartProps {
  entryPrice: number
  stopLossPrice: number
  targetPrice: number
}

export function PositionSizeChart({ entryPrice, stopLossPrice, targetPrice }: PositionSizeChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Determine if it's a long or short position
  const isLong = stopLossPrice < entryPrice

  // Calculate the range for the chart
  const prices = [entryPrice, stopLossPrice, targetPrice].filter((p) => p > 0)
  const min = Math.min(...prices) * 0.95
  const max = Math.max(...prices) * 1.05
  const range = max - min

  // Calculate positions for visualization
  const getPosition = (price: number) => {
    return ((price - min) / range) * 100
  }

  const entryPosition = getPosition(entryPrice)
  const stopLossPosition = getPosition(stopLossPrice)
  const targetPosition = targetPrice ? getPosition(targetPrice) : null

  // Colors based on theme
  const textColor = theme === "dark" ? "text-white" : "text-black"
  const lineColor = theme === "dark" ? "bg-gray-600" : "bg-gray-300"

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-4">Price Visualization</h3>

      <div className="relative h-16 mb-8">
        {/* Horizontal line */}
        <div className={`absolute left-0 right-0 h-0.5 top-8 ${lineColor}`}></div>

        {/* Entry price marker */}
        <div className="absolute w-0.5 h-16 bg-primary" style={{ left: `${entryPosition}%` }}>
          <div className="absolute -top-6 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-medium">Entry</span>
            <p className="text-xs">${entryPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Stop loss marker */}
        <div className="absolute w-0.5 h-16 bg-destructive" style={{ left: `${stopLossPosition}%` }}>
          <div className="absolute -bottom-6 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-medium">Stop Loss</span>
            <p className="text-xs">${stopLossPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Target price marker (if provided) */}
        {targetPosition !== null && (
          <div className="absolute w-0.5 h-16 bg-green-500" style={{ left: `${targetPosition}%` }}>
            <div className="absolute -top-6 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-medium">Target</span>
              <p className="text-xs">${targetPrice.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Position type indicator */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <span className={`text-xs font-bold ${isLong ? "text-green-500" : "text-red-500"}`}>
            {isLong ? "LONG POSITION" : "SHORT POSITION"}
          </span>
        </div>
      </div>
    </Card>
  )
}

