import { HacknetNodeConstants } from "hacknet/constant";

/**
 * Description
 * @param {NS} ns
 * @param {any} level
 * @param {any} ram
 * @param {any} cores
 * @returns {any}
 */
export function calculateMoneyGainRate(ns, level, ram, cores) {

   let mult = ns.getPlayer().mults.hacknet_node_money

   const gainPerLevel = HacknetNodeConstants.MoneyGainPerLevel

   const levelMult = level * gainPerLevel;
   const ramMult = Math.pow(1.035, ram - 1);
   const coresMult = (cores + 5) / 6;


   let bitNode = 0
   try {
      bitNode = JSON.parse(ns.read("/data/resetInfo.txt"))
   } catch { bitNode = 1 }

   let HacknetNodeMoney = myGetBitNodeMultipliers(bitNode, 1).HacknetNodeMoney;


   return levelMult * ramMult * coresMult * mult * HacknetNodeMoney;
}

export function calculateLevelUpgradeCost(startingLevel, extraLevels = 1, costMult = 1) {
   const sanitizedLevels = Math.round(extraLevels);
   if (isNaN(sanitizedLevels) || sanitizedLevels < 1) {
      return 0;
   }

   if (startingLevel >= HacknetNodeConstants.MaxLevel) {
      return Infinity;
   }

   const mult = HacknetNodeConstants.UpgradeLevelMult;
   let totalMultiplier = 0;
   let currLevel = startingLevel;
   for (let i = 0; i < sanitizedLevels; ++i) {
      totalMultiplier += Math.pow(mult, currLevel);
      ++currLevel;
   }

   return HacknetNodeConstants.LevelBaseCost * totalMultiplier * costMult;
}

export function calculateRamUpgradeCost(startingRam, extraLevels = 1, costMult = 1) {
   const sanitizedLevels = Math.round(extraLevels);
   if (isNaN(sanitizedLevels) || sanitizedLevels < 1) {
      return 0;
   }

   if (startingRam >= HacknetNodeConstants.MaxRam) {
      return Infinity;
   }

   let totalCost = 0;
   let numUpgrades = Math.round(Math.log2(startingRam));
   let currentRam = startingRam;

   for (let i = 0; i < sanitizedLevels; ++i) {
      const baseCost = currentRam * HacknetNodeConstants.RamBaseCost;
      const mult = Math.pow(HacknetNodeConstants.UpgradeRamMult, numUpgrades);

      totalCost += baseCost * mult;

      currentRam *= 2;
      ++numUpgrades;
   }

   totalCost *= costMult;

   return totalCost;
}

export function calculateCoreUpgradeCost(startingCore, extraLevels = 1, costMult = 1) {
   const sanitizedCores = Math.round(extraLevels);
   if (isNaN(sanitizedCores) || sanitizedCores < 1) {
      return 0;
   }

   if (startingCore >= HacknetNodeConstants.MaxCores) {
      return Infinity;
   }

   const coreBaseCost = HacknetNodeConstants.CoreBaseCost;
   const mult = HacknetNodeConstants.UpgradeCoreMult;
   let totalCost = 0;
   let currentCores = startingCore;
   for (let i = 0; i < sanitizedCores; ++i) {
      totalCost += coreBaseCost * Math.pow(mult, currentCores - 1);
      ++currentCores;
   }

   totalCost *= costMult;

   return totalCost;
}

export function calculateNodeCost(n, mult = 1) {
   if (n <= 0) {
      return 0;
   }
   return HacknetNodeConstants.BaseCost * Math.pow(HacknetNodeConstants.PurchaseNextMult, n - 1) * mult;
}