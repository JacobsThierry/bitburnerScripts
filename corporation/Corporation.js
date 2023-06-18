import { Division } from "corporation/Division"
import { CorpMaterialName, CorpUnlockName, CorpUpgradeName, IndustryType } from "corporation/enums"

export class Corporation {


   /**
    * Description
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns) {
      this.ns = ns

      this.setupState = 0

      /** @type {Division[]} */
      this.divisions = []

      let divs = ns.corporation.getCorporation().divisions

      for (let i = 0; i < divs.length; i++) {
         this.divisions.push(new Division(ns, divs[i], ns.corporation.getDivision(divs[i]).type))
      }

   }


   expand(industryType, divisionName = "-1") {

      if (this.ns.corporation.getCorporation().divisions.includes(divisionName)) {
         return false
      }

      this.ns.corporation.expandIndustry(industryType, divisionName)


      if (this.ns.corporation.getCorporation().divisions.includes(divisionName)) {
         let d = new Division(this.ns, divisionName, industryType)
         this.divisions.push(d)
         return d
      }

      return false;
   }


   tick() {
      this.divisions.forEach(d => { d.tick() })
      this.setup()
   }

   setup() {

      if (this.setupState == 0) {
         if (this.divisions.length == 0) {
            let d = this.expand(IndustryType.Agriculture)
            if (d != false) {
               this.setupState++
            }
         } else {
            this.setupState++
         }
      }

      if (this.setupState == 1) {



         this.ns.corporation.purchaseUnlock(CorpUnlockName.SmartSupply)
         if (this.ns.corporation.hasUnlock(CorpUnlockName.SmartSupply)) {
            this.setupState++;
         }
      }

      if (this.setupState == 2) {
         this.divisions[0].expandInAllCities()
         if (this.divisions[0].isExpendedEverywhere()) {
            this.setupState++
         }
      }

      if (this.setupState == 3) {

         if (this.divisions[0].warehouseTargetLevel < 1) {
            this.divisions[0].warehouseTargetLevel = 1
         }
         if (this.divisions[0].officeTargetLevel < 3) {
            this.divisions[0].officeTargetLevel = 3
         }

         this.setupState++
      }

      if (this.setupState == 4) {

         if (this.divisions[0].getAdvertlevel() == 0) {
            this.divisions[0].buyAdvert(1)
         }
         this.setupState++
      }

      if (this.setupState == 5) {
         this.divisions[0].sellProducedMaterial()
         this.setupState++
      }

      if (this.setupState == 6) {
         this.divisions[0].upgradeWarehouses(2)
         this.setupState++
      }

      if (this.setupState == 7) {

         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.FocusWires) < 2) {
            this.ns.corporation.levelUpgrade(CorpUpgradeName.FocusWires)
            this.ns.corporation.levelUpgrade(CorpUpgradeName.FocusWires)
         }

         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NeuralAccelerators) < 2) {
            this.ns.corporation.levelUpgrade(CorpUpgradeName.NeuralAccelerators)
            this.ns.corporation.levelUpgrade(CorpUpgradeName.NeuralAccelerators)
         }

         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SpeechProcessorImplants) < 2) {
            this.ns.corporation.levelUpgrade(CorpUpgradeName.SpeechProcessorImplants)
            this.ns.corporation.levelUpgrade(CorpUpgradeName.SpeechProcessorImplants)
         }

         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NuoptimalNootropicInjectorImplants) < 2) {
            this.ns.corporation.levelUpgrade(CorpUpgradeName.NuoptimalNootropicInjectorImplants)
            this.ns.corporation.levelUpgrade(CorpUpgradeName.NuoptimalNootropicInjectorImplants)
         }

         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) < 2) {
            this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartFactories)
            this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartFactories)
         }

         this.setupState++
      }

      if (this.setupState == 8) {
         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.Hardware < 125)) {
            this.divisions[0].setMaterialInEachCity(CorpMaterialName.Hardware, 125)
         }

         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.AiCores < 75)) {
            this.divisions[0].buyMaterialInEachCity(CorpMaterialName.AiCores, 75)
         }

         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.RealEstate < 27000)) {
            this.divisions[0].buyMaterialInEachCity(CorpMaterialName.RealEstate, 27000)

         }
         this.setupState++
      }


   }

}