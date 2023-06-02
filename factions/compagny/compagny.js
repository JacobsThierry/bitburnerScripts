

export class Compagny {

   //Faction name => compagny name
   static compagnyFaction = {
      "Blade Industries": "Blade Industries",
      "ECorp": "ECorp",
      "MegaCorp": "MegaCorp",
      "KuaiGong International": "KuaiGong International",
      "Four Sigma": "Four Sigma",
      "NWO": "NWO",
      "OmniTek Incorporated": "OmniTek Incorporated",
      "Bachman & Associates": "Bachman & Associates",
      "Clarke Incorporated": "Clarke Incorporated",
      "Fulcrum Secret Technologies": "Fulcrum Technologies"

   }

   /**
    * Description
    * @param {NS} ns
    * @param {string} compagnyName
    * @returns {any}
    */
   constructor(ns, compagnyName) {
      this.ns = ns
      this.compagnyName = compagnyName
   }


   workForCompagny() {

      try {
         this.ns.singularity.applyToCompany(this.compagnyName, "IT")

         return this.ns.singularity.workForCompany(this.compagnyName, true)
      } catch {
         return false
      }
   }

   getRep() {
      return this.ns.singularity.getCompanyRep(this.compagnyName)
   }

   getFavor() {
      return this.ns.singularity.getCompanyFavor(this.compagnyName)
   }

}