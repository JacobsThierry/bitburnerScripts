import { Material } from "corporation/Material"
import { CorpEmployeeJob, CorpMaterialName } from "corporation/enums"

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
      materialNames.forEach((m) => { this.material[m] = new Material(this.ns, m, this.divisionName, this.city) })

      this.sellProducedMaterial()

   }

   tick() {

      Object.values(this.material).forEach((m) => { m.tick() })

      if (this.ns.corporation.getOffice(this.divisionName, this.city).avgMorale < 95) {
         this.ns.corporation.throwParty(this.divisionName, this.city, 100) //100 = super magic number :)
      }

      if (this.ns.corporation.getOffice(this.divisionName, this.city).avgEnergy < 95) {
         this.ns.corporation.buyTea(this.divisionName, this.city)
      }



   }

   buyMaterial(materialName, qte) {
      this.material[materialName].buyMaterial(qte)
   }

   setMaterial(materialName, qte) {
      this.material[materialName].setQuantityGoal(qte)
   }



   upgradeOffice(qte = 1) {
      this.ns.corporation.upgradeOfficeSize(this.divisionName, this.city, qte)
   }

   upgradeWarehouse(qte = 1) {
      this.ns.corporation.upgradeWarehouse(this.divisionName, this.city, qte)
   }

   sellProducedMaterial(price = "MP") {
      let industryInfo = this.ns.corporation.getIndustryData(this.industryType)
      let producedMaterial = industryInfo.producedMaterials

      for (let i = 0; i < producedMaterial.length; i++) {
         let mat = producedMaterial[i]
         this.ns.corporation.sellMaterial(this.divisionName, this.city, mat, "MAX", price)
      }
   }

   stopSellingProducedMaterial() {
      let industryInfo = this.ns.corporation.getIndustryData(this.industryType)
      let producedMaterial = industryInfo.producedMaterials

      for (let i = 0; i < producedMaterial.length; i++) {
         let mat = producedMaterial[i]
         this.ns.corporation.sellMaterial(this.divisionName, this.city, mat, 0, "MP")
      }
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



}