import { calculateMoneyGainRate } from "hacknet/nodeFormula"



export class HacknetNode {


   /**
    * Description
    * @param {NS} ns
    * @param {any} index
    * @returns {any}
    */
   constructor(ns, index) {
      this.ns = ns
      this.index = index
   }

   levelUpgradeCost() {
      return this.ns.hacknet.getLevelUpgradeCost(this.index, 1)
   }

   ramUpgradeCost() {
      return this.ns.hacknet.getRamUpgradeCost(this.index, 1)
   }

   coreUpgradeCost() {
      return this.ns.hacknet.getCoreUpgradeCost(this.index, 1)
   }

   getLevel() {
      return this.ns.hacknet.getNodeStats().level
   }

   getRam() {
      return this.ns.hacknet.getNodeStats().ram
   }

   getCore() {
      return this.ns.hacknet.getNodeStats().cores
   }

   revenuesFromLevelUpgrade() {
      return calculateMoneyGainRate(ns, this.getLevel + 1, this.getRam, this.getCore) - calculateMoneyGainRate(ns, this.getLevel, this.getRam, this.getCore)
   }

   revenuesFromRamUpgrade() {
      return calculateMoneyGainRate(ns, this.getLevel, this.getRam + 1, this.getCore) - calculateMoneyGainRate(ns, this.getLevel, this.getRam, this.getCore)
   }

   revenuesFromCoreUpgrade() {
      return calculateMoneyGainRate(ns, this.getLevel, this.getRam, this.getCore + 1) - calculateMoneyGainRate(ns, this.getLevel, this.getRam, this.getCore)
   }

   upgradeLevel() {
      this.ns.hacknet.upgradeLevel(this.index, 1)
   }

   upgradeRam() {
      this.ns.hacknet.upgradeRam(this.index, 1)
   }

   upgradeCore() {
      this.ns.hacknet.upgradeCore(this.index, 1)
   }

}