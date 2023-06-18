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
   constructor(ns, divisionName, industryType) {
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

         d.tick()

      }
      )

   }

   expand(city) {
      let division = this.ns.corporation.getDivision(this.divisionName)
      //If the division alredy exists, we don't create it
      if (!division.cities.includes(city)) {
         this.ns.corporation.expandCity(this.divisionName, city)
      }

      division = this.ns.corporation.getDivision(this.divisionName)


      if (division.cities.includes(city)) {
         if (!Object.keys(this.citiesDivisions).includes(city)) {
            this.citiesDivisions[city] = new CityDivision(this.ns, this.divisionName, city, this.industryType)
         }

         this.citiesDivisions[city].sellProducedMaterial()
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

   sellProducedMaterial(price = "MP") {
      Object.values(this.citiesDivisions).forEach(d => { d.sellProducedMaterial(price) })
   }



   stopSellingProducedMaterial() {
      Object.values(this.citiesDivisions).forEach(d => { d.stopSellingProducedMaterial() })
   }

   buyMaterialInEachCity(materialName, qte) {
      Object.values(this.citiesDivisions).forEach(d => { d.buyMaterial(materialName, qte) })
   }

   setMaterialInEachCity(materialName, qte) {
      Object.values(this.citiesDivisions).forEach(d => { d.setMaterial(materialName, qte) })
   }

   getAvgMaterialGoal(materialName) {
      let average = Object.values(this.citiesDivisions).reduce((total, next) => { total + next.material[materialName].quantityGoal }, 0) / Object.values(this.citiesDivisions).length
      return average
   }

   getAdvertlevel() {
      return this.ns.corporation.getDivision(this.divisionName).numAdVerts
   }

}