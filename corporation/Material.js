import { MaterialInfo } from "corporation/MaterialInfo"
import { secondsPerMarketCycle } from "corporation/constants"
import { CorpEmployeeJob, CorpUpgradeName } from "corporation/enums"
import { researches } from "corporation/researchMap"

export class Material {


   /**
    * Description
    * @param {NS} ns
    * @param {any} materialName
    * @param {any} divisionName
    * @param {any} city
    * @returns {any}
    */
   constructor(ns, materialName, divisionName, city, industryType) {
      this.ns = ns
      this.materialName = materialName
      this.divisionName = divisionName
      this.city = city
      this.industryType = industryType
      this.quantityGoal = ns.corporation.getMaterial(divisionName, city, materialName).stored
      if (isNaN(this.quantityGoal)) {
         this.quantityGoal = 0
      }

      this.sellPrice = "MP"
   }

   getCurrentQuantity() {
      return this.getMaterial().stored
   }

   getQuantityGoal() {
      return this.quantityGoal
   }

   /* It can't be that bad to have two classes with the same name. Right ? */
   getMaterial() {
      return this.ns.corporation.getMaterial(this.divisionName, this.city, this.materialName)
   }

   buyMaterial(qte) {
      this.quantityGoal += qte
   }

   setQuantityGoal(qte) {
      this.quantityGoal = qte
   }

   tick(smartySupply = false) {
      let desiredBuyMaterial = this.quantityGoal - this.getCurrentQuantity() - this.getMaterial().productionAmount
      desiredBuyMaterial /= Math.floor(10); //One tick = 10 secs

      if (smartySupply) {
         desiredBuyMaterial += this.smartySupply()
      }

      if (desiredBuyMaterial >= 0) {
         //We cannot bulk purchase if money < 0, so we do this :
         this.ns.corporation.buyMaterial(this.divisionName, this.city, this.materialName, Math.abs(desiredBuyMaterial))
         this.ns.corporation.sellMaterial(this.divisionName, this.city, this.materialName, 0, this.sellPrice)

         //this.ns.corporation.bulkPurchase(this.divisionName, this.city, this.materialName, desiredBuyMaterial)
      } else {
         this.ns.corporation.buyMaterial(this.divisionName, this.city, this.materialName, 0)
         this.ns.corporation.sellMaterial(this.divisionName, this.city, this.materialName, Math.abs(desiredBuyMaterial), this.sellPrice)
      }
   }



   smartySupply() { // FOR NOW ONLY ""WORK""" FOR PRODUCED MATERIALS, NOT FOR PRODUCTS

      //Process 
      const reqMat = this.ns.corporation.getIndustryData(this.industryType).requiredMaterials[this.materialName]

      let maxProd = this.getOfficeProductivity() * this.ns.corporation.getDivision(this.divisionName).productionMult
         * (1 + this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) * 0.03)

      let researchMult = 1

      Object.keys(researches).forEach(k => {
         if (researches[k].hasOwnProperty("productionMult")) {
            if (this.ns.corporation.hasResearched(this.divisionName, k)) {
               researchMult *= researches[k]["productionMult"]
            }
         }
      })

      maxProd *= researchMult

      let prod = maxProd

      let totalMatSize = 0

      for (let i = 0; i < this.ns.corporation.getIndustryData(this.industryType).producedMaterials.length; i++) {
         let material = this.ns.corporation.getIndustryData(this.industryType).producedMaterials[i]
         totalMatSize += MaterialInfo[material].size
      }

      let reqMats = Object.keys(this.ns.corporation.getIndustryData(this.industryType).requiredMaterials)

      for (let i = 0; i < reqMats.length; i++) {
         let material = reqMats[i]
         totalMatSize += MaterialInfo[material].size * this.ns.corporation.getIndustryData(this.industryType).requiredMaterials[reqMats[i]]
      }



      if (totalMatSize > 0) {
         let warehouse = this.ns.corporation.getWarehouse(this.divisionName, this.city)
         const maxAmt = Math.floor((warehouse.size - warehouse.sizeUsed) / totalMatSize);
         prod = Math.min(maxAmt, prod);
      }

      if (prod < 0) {
         prod = 0;
      }

      let temps = this.ns.corporation.getIndustryData(this.industryType).requiredMaterials[this.materialName] * prod

      let marketCycles = 1 //idk

      //this.ns.tprint(this.materialName, " ", temps)
      if (temps != null && !isNaN(temps)) {
         return temps * (1 - 0.99 / secondsPerMarketCycle) //For some reason there is always 1 secs too much of ressources. I don't know why, so here is this magic line

      }

      return 0



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