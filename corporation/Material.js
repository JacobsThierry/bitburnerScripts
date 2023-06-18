export class Material {


   /**
    * Description
    * @param {NS} ns
    * @param {any} materialName
    * @param {any} divisionName
    * @param {any} city
    * @returns {any}
    */
   constructor(ns, materialName, divisionName, city) {
      this.ns = ns
      this.materialName = materialName
      this.divisionName = divisionName
      this.city = city
      this.quantityGoal = ns.corporation.getMaterial(divisionName, city, materialName).stored
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

   tick() {
      let desiredBuyMaterial = this.quantityGoal - this.getCurrentQuantity() - this.getMaterial().productionAmount
      desiredBuyMaterial /= Math.floor(10); //One tick = 10 secs

      if (desiredBuyMaterial == 0) {
         return
      }

      if (desiredBuyMaterial > 0) {
         this.ns.corporation.buyMaterial(this.divisionName, this.city, this.materialName, desiredBuyMaterial)
      } else {
         this.ns.corporation.sellMaterial(this.divisionName, this.city, this.materialName, Math.abs(desiredBuyMaterial))
      }


   }
}