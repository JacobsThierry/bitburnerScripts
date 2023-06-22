import { CityDivision } from "corporation/CityDivision"
import { citiesList } from "corporation/enums"

export class Division {

   /**
    * Description
    * @param {NS} ns
    * @param {any} divisionName
    * @param {any} industryType
    * @returns {any}
    */
   constructor(ns, divisionName, industryType, inSetup = true) {
      this.ns = ns
      this.divisionName = divisionName
      this.industryType = industryType

      /** @type { Object.<string, CityDivision> } } */
      this.citiesDivisions = {}

      let divCities = ns.corporation.getDivision(divisionName).cities

      for (let i = 0; i < divCities.length; i++) {
         this.citiesDivisions[divCities[i]] = new CityDivision(ns, divisionName, divCities[i], industryType)
      }

      this.warehouseTargetLevel = 1

      this.officeTargetLevel = 3;


      this.cityQueue = citiesList

   }


   tick() {

      Object.values(this.citiesDivisions).forEach(d => {

         let warehouseUpgradeAmt = this.warehouseTargetLevel - this.ns.corporation.getWarehouse(d.divisionName, d.city).level
         if (warehouseUpgradeAmt > 0) {
            d.upgradeWarehouse(warehouseUpgradeAmt)
         }

         let officeUpgradeAmt = this.officeTargetLevel - this.ns.corporation.getOffice(d.divisionName, d.city).size
         if (officeUpgradeAmt > 0) {
            d.upgradeOffice(officeUpgradeAmt)
         }

         this.sellProducts("MP")
         d.tick()

      }
      )

      if (this.ns.corporation.getIndustryData(this.industryType).product) {
         if (this.getInDesignProducts().length == 0 || this.ns.corporation.getDivision(this.divisionName).products.length < 3) {
            let totalBudget = Math.min(this.ns.corporation.getCorporation().funds, this.ns.corporation.getDivision(this.divisionName).lastCycleRevenue * 100)
            if (totalBudget > 0) {
               this.createProduct(totalBudget / 2, totalBudget / 2)
            }


         }
      }

   }

   assignEmployees(nbOperation, nbEngineer, nbBusiness, nbManagement, nbRD, nbIntern) {
      Object.values(this.citiesDivisions).forEach(d => {
         d.assignEmployees(nbOperation, nbEngineer, nbBusiness, nbManagement, nbRD, nbIntern)
      })
   }

   enableSmartSupply() {
      Object.values(this.citiesDivisions).forEach(d => {
         d.enableSmartSupply()
      })

   }

   disableSmartSupply() {
      Object.values(this.citiesDivisions).forEach(d => {
         d.disableSmartSupply()
      })
   }

   setSmartSupply(bool) {
      Object.values(this.citiesDivisions).forEach(d => {
         d.setSmartSupply(true)
      })
   }

   expand(city) {
      let division = this.ns.corporation.getDivision(this.divisionName)
      //If the division alredy exists, we don't create it
      if (!division.cities.includes(city)) {
         this.ns.corporation.expandCity(this.divisionName, city)
         this.ns.corporation.purchaseWarehouse(this.divisionName, city)
      }

      division = this.ns.corporation.getDivision(this.divisionName)


      if (division.cities.includes(city)) {
         if (!Object.keys(this.citiesDivisions).includes(city)) {
            this.citiesDivisions[city] = new CityDivision(this.ns, this.divisionName, city, this.industryType)
         }

         //this.citiesDivisions[city].sellProducedMaterial()
      }

   }


   expandInAllCities() {
      let cities = citiesList
      for (let i = 0; i < cities.length; i++) {
         this.expand(cities[i])
      }
   }

   isExpendedEverywhere() {
      return this.ns.corporation.getDivision(this.divisionName).cities.length == citiesList.length
   }

   upgradeWarehouses(qte = 1) {
      this.warehouseTargetLevel += qte;
   }

   buyAdvert(amt = 1) {
      for (let i = 0; i < amt; i++) {
         this.ns.corporation.hireAdVert(this.divisionName)
      }
   }


   sellProducts(price = "MP") {
      Object.values(this.citiesDivisions).forEach(d => { d.sellProducts(price) })
   }

   stopSellingProduct() {
      Object.values(this.citiesDivisions).forEach(d => { d.stopSellingProducts() })
   }

   buyMaterialInEachCity(materialName, qte) {
      Object.values(this.citiesDivisions).forEach(d => { d.buyMaterial(materialName, qte) })
   }

   setMaterialInEachCity(materialName, qte) {
      Object.values(this.citiesDivisions).forEach(d => { d.setMaterial(materialName, qte) })
   }

   getAvgMaterialGoal(materialName) {
      let average = Object.values(this.citiesDivisions).reduce((total, next) => { total + next.material[materialName].quantityGoal }, 0) / Object.values(this.citiesDivisions).length
      if (isNaN(average)) {
         average = 0
      }
      return average
   }

   getAdvertlevel() {
      return this.ns.corporation.getDivision(this.divisionName).numAdVerts
   }

   createProduct(design, market) {
      let products = this.ns.corporation.getDivision(this.divisionName).products
      if (products.length >= 3) {
         this.ns.corporation.discontinueProduct(this.divisionName, products[0])
      }

      /*
      let city = this.cityQueue.shift()
      this.cityQueue.push(city)
      this.citiesDivisions[city].createProduct(design, market)
      */

      Object.values(this.citiesDivisions)[0].createProduct(design, market)
   }

   getProducts() {
      return this.ns.corporation.getDivision(this.divisionName).products
   }


   getInDesignProducts() {
      return this.ns.corporation.getDivision(this.divisionName).products.filter(p => { return this.ns.corporation.getProduct(this.divisionName, "Aevum", p).developmentProgress < 100 })
   }

   setProductionBoostingMaterialInEachCity(nbHardware, nbRobots, nbAi, nbRealEstate) {
      Object.values(this.citiesDivisions).forEach(d => d.setProductionBoostingMaterial(nbHardware, nbRobots, nbAi, nbRealEstate))

   }

}