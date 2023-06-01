

export class compagny {

   //Faction name => compagny name
   static compagnyFaction = {
      "ECorp": "ECorp",
      "MegaCorp": "MegaCorp",
      "KuaiGong International": "KuaiGong International",
      "Four Sigma": "Four Sigma",
      "NWO": "NWO",
      "Blade Industries": "Blade Industries",
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
      return this.ns.singularity.workForCompany(this.compagnyName, true)
   }

   getRep() {
      return this.ns.singularity.getCompanyRep(this.compagnyName)
   }

   getFavor() {
      return this.ns.singularity.getCompanyFavor(this.compagnyName)
   }

}