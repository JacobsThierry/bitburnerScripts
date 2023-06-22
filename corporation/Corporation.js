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
      this.manageExport()
      this.setup()
   }


   manageExport() {
      if (this.ns.corporation.hasUnlock(CorpUnlockName.Export)) {
         this.divisions.forEach(d => {
            let needs = Object.keys(this.ns.corporation.getIndustryData(d.industryType).requiredMaterials)

            this.divisions.forEach(d1 => {

               if (d1.divisionName != d.divisionName) {

                  let prod = this.ns.corporation.getIndustryData(d1.industryType).producedMaterials
                  if (prod != undefined) {
                     prod.forEach(p => {
                        if (needs.includes(p)) {
                           let exportNeeded = {}

                           Object.values(d1.citiesDivisions).forEach(cityProd => {

                              let maxExport = cityProd.material[p].maxProd()

                              Object.values(d.citiesDivisions).forEach(cityTo => {

                                 let key = cityTo.city + p + cityTo.divisionName

                                 if (!(key in exportNeeded)) {
                                    exportNeeded[key] = cityTo.material[p].getBuyQuantity(true)
                                 }

                                 let n = exportNeeded[key]

                                 let exp = Math.min(maxExport, n)
                                 //this.ns.print(exp)

                                 try {
                                    this.ns.corporation.cancelExportMaterial(cityProd.divisionName, cityProd.city, cityTo.divisionName, cityTo.city, p)
                                 } catch { }

                                 if (exp > 0) {
                                    maxExport -= exp
                                    // this.ns.print("Exported ", exp, " of ", p, " from ", cityProd.divisionName, " in ", cityProd.city, " to ", cityTo.divisionName, " in ", cityTo.city)

                                    this.ns.corporation.exportMaterial(cityProd.divisionName, cityProd.city, cityTo.divisionName, cityTo.city, p, exp)
                                    exportNeeded[key] -= exp
                                    //this.ns.print(exportNeeded[key])
                                 }
                              })

                           })

                        }
                     })
                  }
               }
            })

         })
      }
   }


   setup() {

      if (this.setupState == 0) {
         if (this.divisions.length == 0) {
            let d = this.expand(IndustryType.Agriculture, "Papours's crops")
            if (d != false) {
               this.setupState++
            }
         } else {
            this.setupState++
         }
      }

      if (this.setupState == 1) {

         this.setupState++
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
            this.divisions[0].tick()
         }
         if (this.divisions[0].officeTargetLevel < 6) {
            this.divisions[0].officeTargetLevel = 6
         }


         this.divisions[0].tick()

         this.divisions[0].assignEmployees(2, 2, 1, 1, 0, 0)

         this.setupState++
      }

      if (this.setupState == 4) {

         if (this.divisions[0].getAdvertlevel() == 0) {
            this.divisions[0].buyAdvert(1)
         }
         this.setupState++
      }

      if (this.setupState == 5) {
         this.setupState++
      }

      if (this.setupState == 6) {
         this.divisions[0].upgradeWarehouses(1)
         this.divisions[0].tick()
         this.setupState++
      }

      if (this.setupState == 7) {

         let nbFocusWire = 3
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.FocusWires) < nbFocusWire) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.FocusWires)
            for (let i = 0; i < nbFocusWire - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.FocusWires)
            }

         }

         let nbNeuralAcc = 2
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NeuralAccelerators) < nbNeuralAcc) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NeuralAccelerators)
            for (let i = 0; i < nbNeuralAcc - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.NeuralAccelerators)
            }
         }

         let nbSpeechProc = 2
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SpeechProcessorImplants) < nbSpeechProc) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SpeechProcessorImplants)
            for (let i = 0; i < nbSpeechProc - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.SpeechProcessorImplants)
            }

         }

         let nbNuoptimal = 2
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NuoptimalNootropicInjectorImplants) < nbNuoptimal) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NuoptimalNootropicInjectorImplants)
            for (let i = 0; i < nbNuoptimal - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.NuoptimalNootropicInjectorImplants)
            }
         }

         let nbSmartFact = 4
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) < nbSmartFact) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories)
            for (let i = 0; i < nbSmartFact - c; i++) {

               this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartFactories)
            }
         }

         let nbDream = 2
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.DreamSense) < nbDream) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.DreamSense)
            for (let i = 0; i < nbDream - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.DreamSense)
            }
         }

         let nbSmartStorage = 2

         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartStorage) < nbSmartStorage) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartStorage)
            for (let i = 0; i < nbSmartStorage - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartStorage)
            }
         }

         this.setupState++
      }


      if (this.setupState == 8) {
         /*
                  let nbHardware = 240 / 2.05
                  if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.Hardware) < nbHardware) {
                     this.divisions[0].setMaterialInEachCity(CorpMaterialName.Hardware, nbHardware)
                  }
                  let nbAi = 144 / 2.05
                  if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.AiCores) < nbAi) {
                     this.divisions[0].setMaterialInEachCity(CorpMaterialName.AiCores, nbAi)
                  }
                  let nbRE = 60000 / 2.05
                  if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.RealEstate) < nbRE) {
                     this.divisions[0].setMaterialInEachCity(CorpMaterialName.RealEstate, nbRE)
                  }
                  let nbRobot = 80 / 2.05
                  if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.Robots) < nbRobot) {
                     this.divisions[0].setMaterialInEachCity(CorpMaterialName.Robots, nbRobot)
                  }
                  */
         this.setupState++
      }



      if (this.setupState == 9) {
         let investmentOffer = this.ns.corporation.getInvestmentOffer()

         if (investmentOffer.round > 1) {
            this.setupState++
         } else {
            if (investmentOffer.funds > 235e9) {
               this.ns.corporation.acceptInvestmentOffer()
               this.setupState++
            }
         }
      }

      if (this.setupState == 10) {
         this.divisions[0].officeTargetLevel = 9
         this.divisions[0].tick()
         this.divisions[0].assignEmployees(1, 1, 1, 1, 5, 0)
         this.setupState++
      }

      if (this.setupState == 11) {
         this.divisions[0].warehouseTargetLevel = 12
         this.divisions[0].tick()
         this.setupState++
      }

      if (this.setupState == 12) {
         let nbSmartFact = 10
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) < nbSmartFact) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories)
            for (let i = 0; i < nbSmartFact - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartFactories)
            }
         }
         let nbSmartStorage = 10
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartStorage) < nbSmartStorage) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartStorage)
            for (let i = 0; i < nbSmartStorage - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartStorage)
            }
         }

         let nbDream = 1
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.DreamSense) < nbDream) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.DreamSense)
            for (let i = 0; i < nbSmartStorage - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.DreamSense)
            }
         }

         let nbABC = 4
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.ABCSalesBots) < nbABC) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.ABCSalesBots)
            for (let i = 0; i < nbSmartStorage - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.ABCSalesBots)
            }
         }

         let nbSpeech = 4
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SpeechProcessorImplants) < nbSpeech) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SpeechProcessorImplants)
            for (let i = 0; i < nbSmartStorage - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.SpeechProcessorImplants)
            }
         }

         let nbNeural = 9
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NeuralAccelerators) < nbNeural) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NeuralAccelerators)
            for (let i = 0; i < nbSmartStorage - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.NeuralAccelerators)
            }
         }

         this.setupState++
      }



      if (this.setupState == 13) {
         let nbHardware = 2800
         let nbRobot = 96
         let nbAi = 2520
         let nbRE = 146400

         this.divisions[0].setProductionBoostingMaterialInEachCity(nbHardware, nbRobot, nbAi, nbRE)



         this.setupState++
      }


      if (this.setupState == 14) {
         this.divisions[0].assignEmployees(1, 5, 2, 1, 0, 0)
         this.setupState++
      }

      if (this.setupState == 15) {
         this.divisions[0].buyAdvert(10)
         this.setupState++
      }


      if (this.setupState == 16) {
         /*
                  try {
                     
                  } catch { }*/
         this.setupState++
      }

      if (this.setupState == 17) {
         let investmentOffer = this.ns.corporation.getInvestmentOffer()

         if (investmentOffer.round > 2) {
            this.setupState++
         } else {
            if (investmentOffer.funds > 2.5e12) {
               this.ns.corporation.acceptInvestmentOffer()
               this.setupState++
            }
         }
      }

      ///////////////////////////////////////////////////////////////////////////////////


      if (this.setupState == 18) {
         if (this.divisions.length == 1) {
            let d = this.expand(IndustryType.Tobacco, "Papa's Stogie")
            if (d != false) {
               this.setupState++
            }
         } else {
            this.setupState++
         }
      }


      if (this.setupState == 19) {
         this.divisions[1].expandInAllCities()
         if (this.divisions[1].isExpendedEverywhere()) {
            this.setupState++
         }
      }



      if (this.setupState == 20) {

         if (this.divisions[1].getAdvertlevel() == 0) {
            this.divisions[1].buyAdvert(1)
         }
         this.setupState++
      }

      if (this.setupState == 21) {

         if (this.divisions[1].getProducts().length == 0) {
            this.divisions[1].createProduct(1e9, 1e9)
            this.divisions[1].createProduct(1e9, 1e9)
            this.divisions[1].createProduct(1e9, 1e9)
            this.divisions[1].tick()
         }

         this.setupState++
      }



      if (this.setupState == 22) {
         this.divisions[1].upgradeWarehouses(10)
         this.divisions[1].tick()
         this.setupState++
      }

      if (this.setupState == 23) {
         //size = 0.06
         let hardware = 240 * 12.5
         //size = 0.1
         let AiCores = 144 * 12.5
         //size = 0.005
         let RE = 10000 * 12.5
         //size = 0.5
         let robots = 80 * 12.5

         this.divisions[1].setProductionBoostingMaterialInEachCity(hardware, robots, AiCores, RE)

         this.setupState++
      }



      if (this.setupState == 24) {
         let nbSmartFact = 20
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) < nbSmartFact) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories)
            for (let i = 0; i < nbSmartFact - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartFactories)
            }
         }


         let nbABC = 20
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.ABCSalesBots) < nbABC) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.ABCSalesBots)
            for (let i = 0; i < nbABC - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.ABCSalesBots)
            }
         }

         let nbSpeech = 20
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SpeechProcessorImplants) < nbSpeech) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SpeechProcessorImplants)
            for (let i = 0; i < nbSpeech - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.SpeechProcessorImplants)
            }
         }

         let nbNeural = 30
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NeuralAccelerators) < nbNeural) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NeuralAccelerators)
            for (let i = 0; i < nbNeural - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.NeuralAccelerators)
            }
         }

         let nbFocusWire = 20
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.FocusWires) < nbFocusWire) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.FocusWires)
            for (let i = 0; i < nbFocusWire - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.FocusWires)
            }
         }

         let nbDream = 20
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.DreamSense) < nbDream) {
            let c = this.ns.corporation.getUpgradeLevel(CorpUpgradeName.DreamSense)
            for (let i = 0; i < nbDream - c; i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.DreamSense)
            }
         }

         this.setupState++
      }

      if (this.setupState == 25) {

         if (!this.ns.corporation.hasUnlock(CorpUnlockName.MarketResearchDemand)) {
            this.ns.corporation.purchaseUnlock(CorpUnlockName.MarketResearchDemand)
         }

         if (!this.ns.corporation.hasUnlock(CorpUnlockName.MarketDataCompetition)) {
            this.ns.corporation.purchaseUnlock(CorpUnlockName.MarketDataCompetition)
         }

         this.setupState++

      }

      if (this.setupState == 26) {
         if (this.divisions[1].officeTargetLevel < 24) {
            this.divisions[1].officeTargetLevel = 24
         }


         this.divisions[1].tick()


         Object.values(this.divisions[1].citiesDivisions).forEach(dd => {
            if (dd.isCreatingAProduct()) {
               dd.assignEmployees(10, 10, 0, 4, 0, 0)
            } else {
               dd.assignEmployees(0, 0, 0, 0, 24, 0)
            }
         })


         this.setupState++
      }

      if (this.setupState == 27) {

         if (this.ns.corporation.hasUnlock(CorpUnlockName.Export)) {
            this.setupState++
         } else {
            if (this.ns.corporation.getUnlockCost(CorpUnlockName.Export) < this.ns.corporation.getCorporation().funds) {
               this.ns.corporation.purchaseUnlock(CorpUnlockName.Export)
               this.setupState++
            }
         }
      }

      if (this.setupState == 28) {
         this.expand(IndustryType.Chemical, "Papour's chemicals")
         this.setupState++
      }


      if (this.setupState == 29) {
         this.divisions[2].expandInAllCities()
         if (this.divisions[2].isExpendedEverywhere()) {

            this.setupState++
         }
      }



      if (this.setupState == 30) {

         if (this.divisions[2].getAdvertlevel() == 0) {
            this.divisions[2].buyAdvert(1)
         }
         this.setupState++
      }

      if (this.setupState == 31) {
         if (this.divisions[2].officeTargetLevel < 12) {
            this.divisions[2].officeTargetLevel = 12
         }
         this.divisions[2].tick()
         this.setupState++
      }

      if (this.setupState == 32) {
         this.divisions[2].assignEmployees(4, 5, 1, 2, 0, 0)
         this.setupState++
      }

      if (this.setupState == 33) {
         this.divisions[2].warehouseTargetLevel = 12
         this.divisions[2].tick()
         this.setupState++
      }

      if (this.setupState == 34) {
         //size = 0.06
         /*
         let hardware = 240 * 6
         this.divisions[2].setMaterialInEachCity(CorpMaterialName.Hardware, hardware)

         //size = 0.1
         let AiCores = 144 * 6
         this.divisions[2].setMaterialInEachCity(CorpMaterialName.AiCores, AiCores)

         //size = 0.005
         let RE = 10000 * 6
         this.divisions[2].setMaterialInEachCity(CorpMaterialName.RealEstate, RE)

         //size = 0.5
         let robots = 80 * 6
         this.divisions[2].setMaterialInEachCity(CorpMaterialName.Robots, robots)
*/
         this.setupState++
      }


   }

}