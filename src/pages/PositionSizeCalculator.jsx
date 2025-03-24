"use client"

import { useState } from "react"
import { DollarSign, AlertTriangle, Target, Percent, Moon, Sun, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { PositionSizeChart } from "./position-size-chart"

export function PositionSizeCalculator() {
  const [accountBalance, setAccountBalance] = useState("")
  const [riskPercent, setRiskPercent] = useState("")
  const [entryPrice, setEntryPrice] = useState("")
  const [stopLossPrice, setStopLossPrice] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [positionSize, setPositionSize] = useState<number | null>(null)
  const [riskRewardRatio, setRiskRewardRatio] = useState<string | null>(null)
  const [marginRequired, setMarginRequired] = useState<string | null>(null)
  const [totalPurchase, setTotalPurchase] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const { theme, setTheme } = useTheme()
  const leverageLevel = 5

  const calculatePositionSize = () => {
    setIsCalculating(true)
    setTimeout(() => {
      const accountBalanceNum = Number.parseFloat(accountBalance)
      const riskPercentNum = Number.parseFloat(riskPercent) / 100
      const entryPriceNum = Number.parseFloat(entryPrice)
      const stopLossPriceNum = Number.parseFloat(stopLossPrice)

      if (
        isNaN(accountBalanceNum) ||
        isNaN(riskPercentNum) ||
        isNaN(entryPriceNum) ||
        isNaN(stopLossPriceNum) ||
        accountBalanceNum <= 0 ||
        riskPercentNum <= 0 ||
        entryPriceNum <= 0 ||
        stopLossPriceNum <= 0
      ) {
        alert("Please enter valid positive numbers for all fields.")
        setIsCalculating(false)
        return
      }

      const riskAmount = accountBalanceNum * riskPercentNum
      const stopLossDistance = Math.abs(entryPriceNum - stopLossPriceNum)
      const riskBasedPositionSize = Math.floor(riskAmount / stopLossDistance)
      const capitalBasedPositionSize = Math.floor(accountBalanceNum / entryPriceNum)
      const finalPositionSize = Math.min(riskBasedPositionSize, capitalBasedPositionSize)
      setPositionSize(finalPositionSize)

      const purchaseAmount = finalPositionSize * entryPriceNum
      const margin = purchaseAmount / leverageLevel

      setTotalPurchase(purchaseAmount.toFixed(2))
      setMarginRequired(margin.toFixed(2))

      if (targetPrice) {
        const targetPriceNum = Number.parseFloat(targetPrice)
        const rewardDistance = Math.abs(targetPriceNum - entryPriceNum)
        setRiskRewardRatio((rewardDistance / stopLossDistance).toFixed(2))
      }

      setIsCalculating(false)
    }, 1000)
  }

  const resetFields = () => {
    setAccountBalance("")
    setRiskPercent("")
    setEntryPrice("")
    setStopLossPrice("")
    setTargetPrice("")
    setPositionSize(null)
    setRiskRewardRatio(null)
    setMarginRequired(null)
    setTotalPurchase(null)
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <header className="py-4 px-6 rounded-lg shadow-md bg-gradient-to-r from-primary to-primary/70 flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Position Size Calculator</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Enter your trading parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountBalance">Account Balance</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="accountBalance"
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(e.target.value)}
                  placeholder="10000"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskPercent">Risk Percentage</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="riskPercent"
                  type="number"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  placeholder="1"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="entryPrice"
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="100"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stopLossPrice">Stop Loss Price</Label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="stopLossPrice"
                  type="number"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  placeholder="95"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetPrice">Target Price (Optional)</Label>
              <div className="relative">
                <Target className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="targetPrice"
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="110"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetFields}>
              Reset
            </Button>
            <Button onClick={calculatePositionSize} disabled={isCalculating}>
              {isCalculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Your position size calculation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {positionSize !== null ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position Size</Label>
                    <div className="text-2xl font-bold">{positionSize} units</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Risk/Reward Ratio</Label>
                    <div className="text-2xl font-bold">{riskRewardRatio || "N/A"}</div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Purchase</Label>
                    <div className="text-xl font-semibold">${totalPurchase}</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Margin Required</Label>
                    <div className="text-xl font-semibold">${marginRequired}</div>
                    <div className="text-xs text-muted-foreground">At {leverageLevel}x leverage</div>
                  </div>
                </div>

                <div className="mt-4">
                  <PositionSizeChart
                    entryPrice={Number.parseFloat(entryPrice) || 0}
                    stopLossPrice={Number.parseFloat(stopLossPrice) || 0}
                    targetPrice={Number.parseFloat(targetPrice) || 0}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Enter your trading parameters and click Calculate to see results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

