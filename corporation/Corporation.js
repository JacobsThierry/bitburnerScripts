import { Division } from "corporation/Division"
import { initialShares } from "corporation/constants"
import { CorpBaseResearchName, CorpMaterialName, CorpUnlockName, CorpUpgradeName, IndustryType } from "corporation/enums"

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

      /*
            if (this.setupState == 0) {
               if (this.divisions.length == 0) {
                  let d = this.expand(IndustryType.Tobacco, "Papa's Stogie")
                  if (d != false) {
                     this.setupState++
                  }
               } else {
                  this.setupState++
               }
            }
      
            if (this.setupState == 1) {
      
      
               if (!this.ns.corporation.hasUnlock(CorpUnlockName.SmartSupply)) {
                  this.ns.corporation.purchaseUnlock(CorpUnlockName.SmartSupply)
               }
      
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
      
               if (this.divisions[0].getAdvertlevel() == 0) {
                  this.divisions[0].buyAdvert(1)
               }
               this.setupState++
            }
      
            if (this.setupState == 4) {
      
               if (this.divisions[0].getProducts().length == 0) {
                  this.divisions[0].createProduct(1e9, 1e9)
                  this.divisions[0].createProduct(1e9, 1e9)
                  this.divisions[0].createProduct(1e9, 1e9)
                  this.divisions[0].tick()
               }
      
               this.setupState++
            }
      
            if (this.setupState == 5) {
               if (this.divisions[0].officeTargetLevel < 6) {
                  this.divisions[0].officeTargetLevel = 6
               }
      
      
               this.divisions[0].tick()
      
               this.divisions.forEach(d => {
                  Object.values(d.citiesDivisions).forEach(dd => {
                     if (dd.isCreatingAProduct()) {
                        dd.assignEmployees(2, 2, 0, 2, 0, 0)
                     } else {
                        dd.assignEmployees(0, 0, 0, 0, 6, 0)
                     }
                  })
               })
      
               this.setupState++
            }
      
            if (this.setupState == 6) {
               this.divisions[0].upgradeWarehouses(2)
               this.divisions[0].tick()
               this.setupState++
            }
      
            if (this.setupState == 7) {
      
               let nbFocusWire = 1
               if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.FocusWires) < nbFocusWire) {
                  for (let i = 0; i < nbFocusWire - this.ns.corporation.getUpgradeLevel(CorpUpgradeName.FocusWires); i++) {
                     this.ns.corporation.levelUpgrade(CorpUpgradeName.FocusWires)
                  }
      
               }
      
               let nbNeuralAcc = 1
               if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NeuralAccelerators) < nbNeuralAcc) {
                  for (let i = 0; i < nbNeuralAcc - this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NeuralAccelerators); i++) {
                     this.ns.corporation.levelUpgrade(CorpUpgradeName.NeuralAccelerators)
                  }
               }
      
               let nbSpeechProc = 0
               if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SpeechProcessorImplants) < nbSpeechProc) {
                  for (let i = 0; i < nbSpeechProc - this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SpeechProcessorImplants); i++) {
                     this.ns.corporation.levelUpgrade(CorpUpgradeName.SpeechProcessorImplants)
                  }
      
               }
      
               let nbNuoptimal = 1
               if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NuoptimalNootropicInjectorImplants) < nbNuoptimal) {
                  for (let i = 0; i < nbNuoptimal - this.ns.corporation.getUpgradeLevel(CorpUpgradeName.NuoptimalNootropicInjectorImplants); i++) {
                     this.ns.corporation.levelUpgrade(CorpUpgradeName.NuoptimalNootropicInjectorImplants)
                  }
               }
      
               let nbSmartFact = 1
               if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) < nbSmartFact) {
                  for (let i = 0; i < nbSmartFact - this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories); i++) {
                     this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartFactories)
                  }
               }
      
               let nbDream = 0
               if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.DreamSense) < nbDream) {
                  for (let i = 0; i < nbDream - this.ns.corporation.getUpgradeLevel(CorpUpgradeName.DreamSense); i++) {
                     this.ns.corporation.levelUpgrade(CorpUpgradeName.DreamSense)
                  }
               }
      
               let nbSmartStorage = 1
      
               if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartStorage) < nbSmartStorage) {
                  for (let i = 0; i < nbSmartStorage - this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartStorage); i++) {
                     this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartStorage)
                  }
               }
      
               this.setupState++
            }
      
            if (this.setupState == 8) {
               //size = 0.06
               let hardware = 240 * 2.5
               this.divisions[0].setMaterialInEachCity(CorpMaterialName.Hardware, hardware)
      
               //size = 0.1
               let AiCores = 144 * 2.5
               this.divisions[0].setMaterialInEachCity(CorpMaterialName.AiCores, AiCores)
      
               //size = 0.005
               let RE = 10000 * 2.5
               this.divisions[0].setMaterialInEachCity(CorpMaterialName.RealEstate, RE)
      
               //size = 0.5
               let robots = 80 * 2.5
               this.divisions[0].setMaterialInEachCity(CorpMaterialName.Robots, robots)
      
               this.setupState++
            }
      
            if (this.setupState == 9) {
      
               this.divisions.forEach(d => {
                  let products = this.ns.corporation.getDivision(d.divisionName).products
                  products.forEach(p => {
                     if (this.ns.corporation.getProduct(d.divisionName, "Aevum", p).developmentProgress == 100) {
                        d.assignEmployees(1, 1, 1, 0, 0, 0)
                        this.setupState = 10;
                     }
                  })
               })
      
            }
      */

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

         /*
                  if (!this.ns.corporation.hasUnlock(CorpUnlockName.SmartSupply)) {
                     this.ns.corporation.purchaseUnlock(CorpUnlockName.SmartSupply)
                     this.divisions.forEach(d => { d.enableSmartSupply() })
                  }
         
                  if (this.ns.corporation.hasUnlock(CorpUnlockName.SmartSupply)) {
                     this.setupState++;
                  }
         */
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

         this.divisions[0].assignEmployees(3, 1, 1, 1, 0, 0)

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

         let nbFocusWire = 2
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
         let nbHardware = 240 / 2.2
         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.Hardware) < nbHardware) {
            this.divisions[0].setMaterialInEachCity(CorpMaterialName.Hardware, nbHardware)
         }
         let nbAi = 144 / 2.2
         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.AiCores) < nbAi) {
            this.divisions[0].setMaterialInEachCity(CorpMaterialName.AiCores, nbAi)
         }
         let nbRE = 60000 / 2.2
         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.RealEstate) < nbRE) {
            this.divisions[0].setMaterialInEachCity(CorpMaterialName.RealEstate, nbRE)
         }
         let nbRobot = 80 / 2.2
         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.Robots) < nbRobot) {
            this.divisions[0].setMaterialInEachCity(CorpMaterialName.Robots, nbRobot)
         }
         this.setupState++
      }



      if (this.setupState == 9) {
         let investmentOffer = this.ns.corporation.getInvestmentOffer()

         if (investmentOffer.round > 1) {
            this.setupState++
         } else {
            if (investmentOffer.funds > 300e9) {
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
         let nbSmartFact = 9
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) < nbSmartFact) {

            for (let i = 0; i < nbSmartFact - this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories); i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartFactories)
            }
         }
         let nbSmartStorage = 8
         if (this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartStorage) < nbSmartStorage) {
            for (let i = 0; i < nbSmartStorage - this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartStorage); i++) {
               this.ns.corporation.levelUpgrade(CorpUpgradeName.SmartStorage)
            }
         }
         this.setupState++
      }

      if (this.setupState == 12) {
         this.divisions[0].warehouseTargetLevel = 11
         this.divisions[0].tick()
         this.setupState++
      }

      if (this.setupState == 13) {
         let nbHardware = 2800
         let nbAi = 2520
         let nbRE = 146400
         let nbRobot = 96


         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.Hardware) < nbHardware) {
            this.divisions[0].setMaterialInEachCity(CorpMaterialName.Hardware, nbHardware)
         }

         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.AiCores) < nbAi) {
            this.divisions[0].setMaterialInEachCity(CorpMaterialName.AiCores, nbAi)
         }

         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.RealEstate) < nbRE) {
            this.divisions[0].setMaterialInEachCity(CorpMaterialName.RealEstate, nbRE)
         }
         if (this.divisions[0].getAvgMaterialGoal(CorpMaterialName.Robots) < nbRobot) {
            this.divisions[0].setMaterialInEachCity(CorpMaterialName.Robots, nbRobot)
         }



         this.setupState++
      }


      if (this.setupState == 14) {
         this.divisions[0].assignEmployees(1, 4, 3, 1, 0, 0)
         this.setupState++
      }

   }

}