import { Material } from "corporation/Material"
import { MaterialInfo } from "corporation/MaterialInfo"
import { secondsPerMarketCycle } from "corporation/constants"
import { CorpEmployeeJob, CorpMaterialName, CorpUpgradeName, IndustryType } from "corporation/enums"
import { productionFactor } from "corporation/formulas"
import { IndustriesData } from "corporation/industryData"

export class CityDivision {

   /**
    * Description
    * @param {NS} ns
    * @param {any} divisionName
    * @param {any} city
    * @param {any} industryType
    * @returns {any}
    */
   constructor(ns, divisionName, city, industryType) {
      this.ns = ns
      this.divisionName = divisionName
      this.city = city
      this.industryType = industryType
      /** @type { Object.<string, Material> }  */
      this.material = {}

      let materialNames = Object.values(CorpMaterialName)
      materialNames.forEach((m) => { this.material[m] = new Material(this.ns, m, this.divisionName, this.city, this.industryType, this) })

      let producedMaterials = ns.corporation.getIndustryData(industryType).producedMaterials

      if (!(producedMaterials === undefined)) {

         producedMaterials.forEach(m => { this.material[m].setQuantityGoal(0) })
      }

      let requiredMaterials = Object.keys(this.ns.corporation.getIndustryData(this.industryType).requiredMaterials)
      requiredMaterials.forEach(m => { this.material[m].setQuantityGoal(0) })

      //this.sellProducedMaterial()

      this.smartSupplyEnabled = false
      this.productDesign = []

      for (let i = 0; i < ns.corporation.getDivision(divisionName).products; i++) {
         let p = ns.corporation.getProduct(ns.corporation.getDivision(divisionName).products[i])

      }


   }

   tick() {
      this.hireMaxEmployees()


      this.autoProductionBoostingMaterial()

      Object.values(this.material).forEach((m) => {

         if (this.smartSupplyEnabled) {
            let requiredMaterials = Object.keys(this.ns.corporation.getIndustryData(this.industryType).requiredMaterials)
            if (!requiredMaterials.includes(m.materialName)) {
               m.tick()

            }
         } else {
            m.tick(true)
         }


      })

      //After testing, it's more or less 1 avg happyness per 10k
      let magicPartyNumber = (100 - this.ns.corporation.getOffice(this.divisionName, this.city).avgMorale) * 100000

      if (Math.floor(magicPartyNumber) > 0) {
         this.ns.corporation.throwParty(this.divisionName, this.city, magicPartyNumber)
      }


      if (this.ns.corporation.getOffice(this.divisionName, this.city).avgEnergy < 95) {
         this.ns.corporation.buyTea(this.divisionName, this.city)
      }


      this.productDesign = this.productDesign.filter(p => { return this.ns.corporation.getDivision(this.divisionName).products.includes(p) })

      this.productDesign = this.productDesign.filter(p => { return this.ns.corporation.getProduct(this.divisionName, this.city, p).developmentProgress < 100 })
   }

   buyMaterial(materialName, qte) {
      this.material[materialName].buyMaterial(qte)
   }

   setMaterial(materialName, qte) {
      this.material[materialName].setQuantityGoal(qte)
   }



   upgradeOffice(qte = 1) {
      this.ns.corporation.upgradeOfficeSize(this.divisionName, this.city, qte)
      this.hireMaxEmployees()
   }

   upgradeWarehouse(qte = 1) {
      this.ns.corporation.upgradeWarehouse(this.divisionName, this.city, qte)
   }


   sellProducts(price = "MP") {
      let products = this.ns.corporation.getDivision(this.divisionName).products
      products.forEach(prod => {

         //TODO : do the TA2 thing when/if we can get the markup
         this.ns.corporation.sellProduct(this.divisionName, this.city, prod, "MAX", price, false)
      })
   }

   stopSellingProducts(price = "MP") {
      let products = this.ns.corporation.getDivision(this.divisionName).products

      products.forEach(prod => {
         this.ns.corporation.sellProduct(this.divisionName, this.city, prod, 0, price, false)
      })

   }



   hireMaxEmployees() {
      while (this.ns.corporation.getOffice(this.divisionName, this.city).numEmployees < this.ns.corporation.getOffice(this.divisionName, this.city).size) {
         this.ns.corporation.hireEmployee(this.divisionName, this.city, CorpEmployeeJob.Intern)
      }
   }

   assignEmployees(nbOperation, nbEngineer, nbBusiness, nbManagement, nbRD, nbIntern) {

      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Operations, 0)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Engineer, 0)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Business, 0)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Management, 0)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.RandD, 0)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Intern, 0)


      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Operations, nbOperation)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Engineer, nbEngineer)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Business, nbBusiness)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Management, nbManagement)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.RandD, nbRD)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Intern, nbIntern)
   }

   enableSmartSupply() {
      this.ns.corporation.setSmartSupply(this.divisionName, this.city, true)
      this.smartSupplyEnabled = true
   }

   disableSmartSupply() {
      this.ns.corporation.setSmartSupply(this.divisionName, this.city, false)
      this.smartSupplyEnabled = false
   }

   setSmartSupply(bool) {
      this.ns.corporation.setSmartSupply(this.divisionName, this.city, bool)
      this.smartSupplyEnabled = bool
   }

   createProduct(design, marketing) {
      try {
         let productName = this.productNameGenerator()
         this.ns.corporation.makeProduct(this.divisionName, this.city, productName, design, marketing)
         this.productDesign.push(productName)
         return true
      } catch {
         return false
      }
   }

   isCreatingAProduct() {
      return (this.productDesign.length > 0)
   }

   setProductionBoostingMaterial(nbHardware, nbRobots, nbAi, nbRealEstate) {
      this.material[CorpMaterialName.Hardware].quantityGoal = nbHardware
      this.material[CorpMaterialName.Robots].quantityGoal = nbRobots
      this.material[CorpMaterialName.AiCores].quantityGoal = nbAi
      this.material[CorpMaterialName.RealEstate].quantityGoal = nbRealEstate
   }

   autoProductionBoostingMaterial() {

      //Brut forcing coz i'm lazy
      //todo : faire ça correcement c'est de la merde la
      let maxProd = 0;
      let totalMatSize = 0

      let addRe
      let addHard
      let addRob
      let addAi

      let max

      gigaWhile: while (true) {

         /*



     (1)    bonusSize = tailleRE * nbRE + tailleHard * nbHard + tailleRob * nbRob + tailleAi * nbAi
            prod = this.getOfficeProductivity(false) * smartFactory * productionMult 

     (2)   productionMult = Math.pow(Math.pow(0.002 * nbRE + 1, IndustriesData[industryType].realEstateFactor) * Math.pow(0.002 * nbHardware + 1, IndustriesData[industryType].hardwareFactor) * Math.pow(0.002 * nbRobot + 1, IndustriesData[industryType].robotFactor) * Math.pow(0.002 * nbAI + 1, IndustriesData[industryType].aiCoreFactor), 0.73) * 6

            prodSize = Max(sum(prod * producedMaterialSize), sum( requiredProductQte * requiredProductSize * prod )  )



            prodSize + bonusSize < warehouseSize



            On cherche a maximiser productionMult (2) en minimisant bonusSize (1)

            
         */

         maxProd = this.getOfficeProductivity(false) * (1 + this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) * 0.03) * productionFactor(this.industryType,
            this.material[CorpMaterialName.RealEstate].quantityGoal, this.material[CorpMaterialName.Hardware].quantityGoal,
            this.material[CorpMaterialName.Robots].quantityGoal, this.material[CorpMaterialName.AiCores].quantityGoal) * secondsPerMarketCycle



         if (maxProd == 0) {
            return
         }

         // Calculate net change in warehouse storage making the produced materials will cost
         let totalMatSize = 0;

         let producedMaterials = this.ns.corporation.getIndustryData(this.industryType).producedMaterials
         if (!(producedMaterials === undefined)) {
            for (let tmp = 0; tmp < producedMaterials.length; ++tmp) {
               totalMatSize += MaterialInfo[producedMaterials[tmp]].size * maxProd;
            }
         }
         for (const [reqMatName, reqQty] of Object.entries(this.ns.corporation.getIndustryData(this.industryType).requiredMaterials)) {
            totalMatSize -= MaterialInfo[reqMatName].size * reqQty * maxProd;
         }



         totalMatSize += this.material[CorpMaterialName.RealEstate].quantityGoal * MaterialInfo["Real Estate"].size +
            this.material[CorpMaterialName.Hardware].quantityGoal * MaterialInfo.Hardware.size +
            this.material[CorpMaterialName.Robots].quantityGoal * MaterialInfo.Robots.size +
            this.material[CorpMaterialName.AiCores].quantityGoal * MaterialInfo["AI Cores"].size


         if (totalMatSize > this.ns.corporation.getWarehouse(this.divisionName, "Aevum").size * 0.9) {
            return
         }


         let REgain = productionFactor(this.industryType,
            this.material[CorpMaterialName.RealEstate].quantityGoal + 1 / MaterialInfo["Real Estate"].size, this.material[CorpMaterialName.Hardware].quantityGoal,
            this.material[CorpMaterialName.Robots].quantityGoal, this.material[CorpMaterialName.AiCores].quantityGoal) -
            productionFactor(this.industryType,
               this.material[CorpMaterialName.RealEstate].quantityGoal, this.material[CorpMaterialName.Hardware].quantityGoal,
               this.material[CorpMaterialName.Robots].quantityGoal, this.material[CorpMaterialName.AiCores].quantityGoal)

         let hardWareGain = productionFactor(this.industryType,
            this.material[CorpMaterialName.RealEstate].quantityGoal, this.material[CorpMaterialName.Hardware].quantityGoal + 1 / MaterialInfo.Hardware.size,
            this.material[CorpMaterialName.Robots].quantityGoal, this.material[CorpMaterialName.AiCores].quantityGoal) -
            productionFactor(this.industryType,
               this.material[CorpMaterialName.RealEstate].quantityGoal, this.material[CorpMaterialName.Hardware].quantityGoal,
               this.material[CorpMaterialName.Robots].quantityGoal, this.material[CorpMaterialName.AiCores].quantityGoal)

         let robotGain = productionFactor(this.industryType,
            this.material[CorpMaterialName.RealEstate].quantityGoal, this.material[CorpMaterialName.Hardware].quantityGoal,
            this.material[CorpMaterialName.Robots].quantityGoal + 1 / MaterialInfo.Robots.size, this.material[CorpMaterialName.AiCores].quantityGoal) -
            productionFactor(this.industryType,
               this.material[CorpMaterialName.RealEstate].quantityGoal, this.material[CorpMaterialName.Hardware].quantityGoal,
               this.material[CorpMaterialName.Robots].quantityGoal, this.material[CorpMaterialName.AiCores].quantityGoal)

         let AiGain = productionFactor(this.industryType,
            this.material[CorpMaterialName.RealEstate].quantityGoal, this.material[CorpMaterialName.Hardware].quantityGoal,
            this.material[CorpMaterialName.Robots].quantityGoal, this.material[CorpMaterialName.AiCores].quantityGoal + 1 / MaterialInfo["AI Cores"].size) -
            productionFactor(this.industryType,
               this.material[CorpMaterialName.RealEstate].quantityGoal, this.material[CorpMaterialName.Hardware].quantityGoal,
               this.material[CorpMaterialName.Robots].quantityGoal, this.material[CorpMaterialName.AiCores].quantityGoal)

         max = Math.max(REgain, hardWareGain, robotGain, AiGain)

         switch (max) {
            case REgain:
               //this.ns.print("RE")
               this.material[CorpMaterialName.RealEstate].quantityGoal += 1 / MaterialInfo["Real Estate"].size
               break
            case hardWareGain:
               //this.ns.print("hard")
               this.material[CorpMaterialName.Hardware].quantityGoal += 1 / MaterialInfo.Hardware.size
               break;
            case robotGain:
               //this.ns.print("r")
               this.material[CorpMaterialName.Robots].quantityGoal += 1 / MaterialInfo.Robots.size
               break;
            case AiGain:
               //this.ns.print("ai")
               this.material[CorpMaterialName.AiCores].quantityGoal += 1 / MaterialInfo["AI Cores"].size
               break;
            default: break gigaWhile
         }


         maxProd = this.getOfficeProductivity(false) * (1 + this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) * 0.03) * productionFactor(this.industryType,
            this.material[CorpMaterialName.RealEstate].quantityGoal, this.material[CorpMaterialName.Hardware].quantityGoal,
            this.material[CorpMaterialName.Robots].quantityGoal, this.material[CorpMaterialName.AiCores].quantityGoal) * secondsPerMarketCycle

         // Calculate net change in warehouse storage making the produced materials will cost
         totalMatSize = 0;

         producedMaterials = this.ns.corporation.getIndustryData(this.industryType).producedMaterials
         if (!(producedMaterials === undefined)) {
            for (let tmp = 0; tmp < producedMaterials.length; ++tmp) {
               totalMatSize += MaterialInfo[producedMaterials[tmp]].size * maxProd;
            }
         }
         for (const [reqMatName, reqQty] of Object.entries(this.ns.corporation.getIndustryData(this.industryType).requiredMaterials)) {
            totalMatSize -= MaterialInfo[reqMatName].size * reqQty * maxProd;
         }



         totalMatSize += this.material[CorpMaterialName.RealEstate].quantityGoal * MaterialInfo["Real Estate"].size +
            this.material[CorpMaterialName.Hardware].quantityGoal * MaterialInfo.Hardware.size +
            this.material[CorpMaterialName.Robots].quantityGoal * MaterialInfo.Robots.size +
            this.material[CorpMaterialName.AiCores].quantityGoal * MaterialInfo["AI Cores"].size


      }


   }


   productNameGenerator() {
      let prefixes = [
         "", "Super", "Boring", "New", this.divisionName + "'s", "Incredible", "Ultra", "Adorable", "Adventurous",
         "Aggressive", "Agreeable", "Alert", "Alive", "Amused", "Angry", "Annoyed", "Annoying", "Anxious",
         "Arrogant", "Ashamed", "Attractive", "Average", "Awful", "Bad", "Beautiful", "Better", "Bewildered", "Black", "Bloody",
         "Blue", "Blue-eyed", "Blushing", "Bored", "Brainy", "Brave", "Breakable", "Bright", "Busy", "Calm", "Careful", "Cautious",
         "Charming", "Cheerful", "Clean", "Clear", "Clever", "Cloudy", "Clumsy", "Colorful", "Combative", "Comfortable", "Concerned",
         "Condemned", "Confused", "Cooperative", "Courageous", "Crazy", "Creepy", "Crowded", "Cruel", "Curious", "Cute", "Dangerous",
         "Dark", "Dead", "Defeated", "Defiant", "Delightful", "Depressed", "Determined", "Different", "Difficult", "Disgusted",
         "Distinct", "Disturbed", "Dizzy", "Doubtful", "Drab", "Dull", "Lazy", "Light", "Lively", "Lonely", "Long", "Lovely", "Lucky", "Lost",
         "Magnificent", "Misty", "Modern", "Motionless", "Muddy", "Mesmerizing", "Mushy", "Mysterious", "Nasty", "Naughty", "Nervous", "Nice", "Nutty",
         "Obedient", "Obnoxious", "Odd", "Old-fashioned", "Open", "Outrageous", "Outstanding", "Painful", "Panicky", "Perfect", "Plain", "Pleasant",
         "Poised", "Poor", "Powerful", "Precious", "Prickly", "Proud", "Putrid", "Puzzled", "Quaint", "Real", "Relieved", "Repulsive",
         "Rich", "Scary", "Selfish", "Shiny", "Shy", "Silly", "Sleepy", "Smiling", "Smoggy", "Sore", "Sparkling", "Splendid", "Spotless",
         "Stormy", "Strange", "Stupid", "Successful", "Super", "Sexy", "Talented", "Tame", "Tasty", "Tender", "Tense", "Terrible", "Thankful",
         "Thoughtful", "Thoughtless", "Tired", "Tough", "Troubled", "Ugliest", "Ugly", "Uninterested", "Unsightly", "Unusual", "Upset",
         "Uptight", "Vast", "Victorious", "Vivacious", "Wandering", "Weary", "Wicked", "Wide-eyed", "Wild",
         "Witty", "Worried", "Worrisome", "Wrong", "Zany", "Zealous", "Drunk", "Secret"
      ]
      let suffixes = [
         "", "Of Doom", "Of Death", "Of Darkness", "From Sector-12", "From Neo-Tokyo", "From Ishima", "From Aevum", "From Volhaven", ", The expert choice"
      ]
      let names = ""
      switch (this.industryType) {
         case IndustryType.Tobacco:
            names = ["Cigarette", "Fag", "Gasper", "Ciggy", "Coffin Nail", "Cancer Stick", "Bone", "Buzz", "Charch", "Dipper", "Joe", "Lung dart", "Rollie", "Smokey Treat",
               "Stogie", "Stog", "Zazhy", "Schmère"]
            break
         case IndustryType.Software:
            names = ["Text Editor", "VPN", "Video Game", "Voice Chat", "Website", "Online Store", "Virus", "Malware", "Ransomware", "Spambot", "Trojan", "Spyware",
               "Adware", "Wiper", "Keylogger", "Cryptominer", "Calculator", "Database", "Physic Engine"]
            break
      }
      return (prefixes[Math.floor(Math.random() * prefixes.length)] + " " + names[Math.floor(Math.random() * names.length)] + " " + suffixes[Math.floor(Math.random() * suffixes.length)]).trim()
   }

   getOfficeProductivity(forProduct = false) {

      let office = this.ns.corporation.getOffice(this.divisionName, this.city)

      const opProd = office.employeeProductionByJob[CorpEmployeeJob.Operations];
      const engrProd = office.employeeProductionByJob[CorpEmployeeJob.Engineer];
      const mgmtProd = office.employeeProductionByJob[CorpEmployeeJob.Management];
      const total = opProd + engrProd + mgmtProd;

      if (total <= 0) return 0;

      // Management is a multiplier for the production from Operations and Engineers
      const mgmtFactor = 1 + mgmtProd / (1.2 * total);

      // For production, Operations is slightly more important than engineering
      // Both Engineering and Operations have diminishing returns
      const prod = (Math.pow(opProd, 0.4) + Math.pow(engrProd, 0.3)) * mgmtFactor;

      // Generic multiplier for the production. Used for game-balancing purposes
      const balancingMult = 0.05;

      if (forProduct) {
         // Products are harder to create and therefore have less production
         return 0.5 * balancingMult * prod;
      } else {
         return balancingMult * prod;
      }
   }

}