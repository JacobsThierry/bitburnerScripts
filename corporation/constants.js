// For typed strings, we need runtime objects to do API typechecking against.

import { CONSTANTS } from "Formulas/constant"

// This structure + import * as corpConstants allows easier type definitions for individual properties.

/** Names of all corporation game states */
export const stateNames = ["START", "PURCHASE", "PRODUCTION", "SALE", "EXPORT"]

/** Names of all researches */
//export const researchNames = [...researchNamesBase, ...researchNamesProductOnly]
export const initialShares = 1e9
/** When selling large number of shares, price is dynamically updated for every batch of this amount */
export const sharesPerPriceUpdate = 1e6
/** Cooldown for issue new shares cooldown in game cycles. 12 hours. */
export const issueNewSharesCooldown = 216e3
/** Cooldown for selling shares in game cycles. 1 hour. */
export const sellSharesCooldown = 18e3
export const coffeeCostPerEmployee = 500e3
export const gameCyclesPerMarketCycle = 50
export const gameCyclesPerCorpStateCycle = gameCyclesPerMarketCycle / stateNames.length
export const secondsPerMarketCycle = (gameCyclesPerMarketCycle * CONSTANTS.MilliPerCycle) / 1000
export const warehouseInitialCost = 5e9
export const warehouseInitialSize = 100
export const warehouseSizeUpgradeCostBase = 1e9
export const officeInitialCost = 4e9
export const officeInitialSize = 3
export const officeSizeUpgradeCostBase = 1e9
export const bribeThreshold = 100e12
export const bribeAmountPerReputation = 1e9
export const baseProductProfitMult = 5
export const dividendMaxRate = 1
/** Conversion factor for employee stats to initial salary */
export const employeeSalaryMultiplier = 3
export const marketCyclesPerEmployeeRaise = 400
export const employeeRaiseAmount = 50
/** Max products for a division without upgrades */
export const maxProductsBase = 3
export const fundingRoundShares = [0.1, 0.35, 0.25, 0.2]
export const fundingRoundMultiplier = [4, 3, 3, 2.5]
export const valuationLength = 5