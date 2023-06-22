import { MaterialInfo } from "corporation/MaterialInfo"
import { secondsPerMarketCycle } from "corporation/constants"
import { CorpEmployeeJob, CorpMaterialName, CorpUpgradeName } from "corporation/enums"
import { IndustriesData } from "corporation/industryData"
import { researches } from "corporation/researchMap"

export class Material {


   /**
    * Description
    * @param {NS} ns
    * @param {any} materialName
    * @param {any} divisionName
    * @param {any} city
    * @param {any} industryType
    * @param {CityDivision} cityDivision
    * @returns {any}
    */
   constructor(ns, materialName, divisionName, city, industryType, cityDivision) {
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

      this.cityDivision = cityDivision

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

   getBuyQuantity(smartySupply = false) {
      let desiredBuyMaterial = this.quantityGoal - this.getCurrentQuantity() - this.getMaterial().productionAmount// - this.ns.corporation.getMaterial(this.divisionName, this.city, this.materialName).exports.reduce((acc, curr) => { acc + curr }, 0)


      desiredBuyMaterial /= this.ns.corporation.getConstants().secondsPerMarketCycle; //One tick = 10 secs

      if (smartySupply) {
         desiredBuyMaterial += this.smartySupply()

      }

      return desiredBuyMaterial

   }

   tick(smartySupply = false) {

      let desiredBuyMaterial = this.getBuyQuantity(smartySupply)


      if (desiredBuyMaterial < 0) {
         this.sellPrice = this.smartyTAA(Math.ceil(- desiredBuyMaterial))

         /*
                     if (this.city == "Aevum") {
                        let thisMaterial = this.getMaterial()
                        this.ns.print(this.materialName + " " + this.sellPrice + " qte : ", -desiredBuyMaterial, " quantity goal : ", this.quantityGoal, " markup limit = ", this.ns.corporation.getMaterialData(this.materialName).baseMarkup / thisMaterial.quality,
                           " current markup : ", this.sellPrice - thisMaterial.marketPrice)
                        this.ns.print(- desiredBuyMaterial * this.ns.corporation.getConstants().secondsPerMarketCycle)
                     }*/
      }


      if (this.divisionName == "Papa's Stogie" && this.city == "Sector-12" && this.materialName == CorpMaterialName.Plants) {
         //  this.ns.print(this.smartySupply())
      }
      if (desiredBuyMaterial >= 0) {



         //We cannot bulk purchase if money < 0, so we do this :
         this.ns.corporation.buyMaterial(this.divisionName, this.city, this.materialName, Math.abs(desiredBuyMaterial))
         this.ns.corporation.sellMaterial(this.divisionName, this.city, this.materialName, 0, this.sellPrice)

         //this.ns.corporation.bulkPurchase(this.divisionName, this.city, this.materialName, desiredBuyMaterial)
      } else {

         desiredBuyMaterial = Math.abs(desiredBuyMaterial)
         /*
         if (this.quantityGoal == 0) {
            desiredBuyMaterial = "MAX"
         }
         */



         this.ns.corporation.buyMaterial(this.divisionName, this.city, this.materialName, 0)
         this.ns.corporation.sellMaterial(this.divisionName, this.city, this.materialName, desiredBuyMaterial, this.sellPrice)
      }
   }


   maxProd() {
      let maxProd = 0
      if (!this.ns.corporation.getIndustryData(this.industryType).product) {
         //material
         maxProd = this.cityDivision.getOfficeProductivity() * this.ns.corporation.getDivision(this.divisionName).productionMult
            * (1 + this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) * 0.03)
      } else {
         maxProd = this.cityDivision.getOfficeProductivity() * this.ns.corporation.getDivision(this.divisionName).productionMult
            * (1 + this.ns.corporation.getUpgradeLevel(CorpUpgradeName.SmartFactories) * 0.03)
      }

      let researchMult = 1

      Object.keys(researches).forEach(k => {
         if (researches[k].hasOwnProperty("productionMult")) {
            if (this.ns.corporation.hasResearched(this.divisionName, k)) {
               researchMult *= researches[k]["productionMult"]
            }
         }
      })

      maxProd *= researchMult

      return maxProd
   }


   smartySupply() {


      let reqMat = Object.keys(this.ns.corporation.getIndustryData(this.industryType).requiredMaterials)
      if (!(reqMat.includes(this.materialName))) {
         return 0
      }

      let maxProd = this.maxProd()

      let prod = maxProd

      let totalMatSize = 0

      if (!(this.ns.corporation.getIndustryData(this.industryType).producedMaterials === undefined)) {

         for (let i = 0; i < this.ns.corporation.getIndustryData(this.industryType).producedMaterials.length; i++) {
            let material = this.ns.corporation.getIndustryData(this.industryType).producedMaterials[i]
            totalMatSize += MaterialInfo[material].size
         }
      }

      let reqMats = Object.keys(this.ns.corporation.getIndustryData(this.industryType).requiredMaterials)

      for (let i = 0; i < reqMats.length; i++) {
         let material = reqMats[i]
         totalMatSize -= MaterialInfo[material].size * this.ns.corporation.getIndustryData(this.industryType).requiredMaterials[reqMats[i]]
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
         return temps * (1 - 0.999 / secondsPerMarketCycle) //For some reason there is always 1 secs too much of ressources. I don't know why, so here is this magic line

      }

      return 0


   }




   /*

         sellAmt = (mat.quality + 0.001) * marketFactor * (mat.marketPrice / sCost) * businessFactor * corporation.getSalesMult() * advertisingFactor * this.getSalesMultiplier();
         sellAmt * sCost = (mat.quality + 0.001) * marketFactor * (mat.marketPrice) * businessFactor * corporation.getSalesMult() * advertisingFactor * this.getSalesMultiplier();
         sCost = (mat.quality + 0.001) * marketFactor * (mat.marketPrice) * businessFactor * corporation.getSalesMult() * advertisingFactor * this.getSalesMultiplier() / sellAmt;

   */

   smartyTAA(sellAmt) {
      let thisMaterial = this.ns.corporation.getMaterial(this.divisionName, this.city, this.materialName)
      let markup = this.ns.corporation.getMaterialData(this.materialName).baseMarkup
      let markupLimit = markup / thisMaterial.quality

      let marketFactor



      let demand = thisMaterial.demand
      let compet = thisMaterial.competition

      if (isNaN(demand)) {
         demand = MaterialInfo[this.materialName]["demandRange"][0]
      }

      if (isNaN(compet)) {
         compet = MaterialInfo[this.materialName]["competitionRange"][1]
      }

      marketFactor = Math.max(0.1, (demand * (100 - compet)) / 100)


      let businessFactor
      const businessProd = 1 + this.ns.corporation.getOffice(this.divisionName, this.city).employeeProductionByJob[CorpEmployeeJob.Business];

      businessFactor = Math.pow(businessProd, 0.26) + businessProd / 10e3;

      let salesMult = 1 + 0.01 * this.ns.corporation.getUpgradeLevel(CorpUpgradeName.ABCSalesBots)

      const awarenessFac = Math.pow(this.ns.corporation.getDivision(this.divisionName).awareness + 1, IndustriesData[this.industryType].advertisingFactor);
      const popularityFac = Math.pow(this.ns.corporation.getDivision(this.divisionName).popularity + 1, IndustriesData[this.industryType].advertisingFactor);
      const ratioFac = this.ns.corporation.getDivision(this.divisionName).awareness === 0 ? 0.01 : Math.max((this.ns.corporation.getDivision(this.divisionName).popularity + 0.001) / this.ns.corporation.getDivision(this.divisionName).awareness, 0.01);
      const advertisingFactor = Math.pow(awarenessFac * popularityFac * ratioFac, 0.85);



      let sm = 1 //Research sales mult : there is no multipliers right now ?


      const numerator = markupLimit
      const sqrtNumerator = sellAmt

      //this.ns.print("Factors : ", marketFactor, " ", businessFactor, " ", salesMult, " ", advertisingFactor, " ")

      const sqrtDenominator =
         (thisMaterial.quality + 0.001) *
         marketFactor *
         businessFactor *
         salesMult *
         advertisingFactor *
         sm
      //this.ns.print(marketFactor)

      const denominator = Math.sqrt(sqrtNumerator / sqrtDenominator);

      let optimalPrice;
      if (sqrtDenominator === 0 || denominator === 0) {
         if (sqrtNumerator === 0) {
            optimalPrice = 0; // Nothing to sell
         } else {
            optimalPrice = thisMaterial.marketPrice + markupLimit;
         }
      } else {
         optimalPrice = numerator / denominator + thisMaterial.marketPrice;
      }


      return optimalPrice

   }

}