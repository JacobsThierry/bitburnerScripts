import { CONSTANTS } from "Formulas/constant"
import { Compagny } from "factions/compagny/compagny"

export class CompagnyManager {


   /**
    * Description
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns, factionManager) {
      /** @type {string[]} */
      let compagnies = Object.values(Compagny.compagnyFaction)

      this.ns = ns


      this.compagnies = []

      for (let i = 0; i < compagnies.length; i++) {
         this.compagnies.push(new Compagny(ns, compagnies[i]))
      }
   }

   canWork() {

      let factionsToWorkFor = null

      try {
         factionsToWorkFor = JSON.parse(this.ns.read("/data/joinedFactionsWithoutFavor.txt"))
      } catch {
         factionsToWorkFor = []
      }

      return factionsToWorkFor.length == 0
   }


   /**
    * Description
    * @returns {Compagny[]}
    */
   compagnyToWorkFor() {
      let com = Compagny.compagnyFaction

      let filtered = Object.keys(com).reduce((filtered, key) => {
         if (this.ns.singularity.getCompanyRep(com[key]) < CONSTANTS.CorpFactionRepRequirement && !(this.ns.getPlayer().factions.includes(key))) {
            filtered[key] = com[key]
         }
         return filtered
      }, {})

      let out = []
      let vals = Object.values(filtered)
      for (let i = 0; i < vals.length; i++) {
         out.push(new Compagny(this.ns, vals[i]))
      }
      return out

   }

   loop() {



      if (this.canWork()) {
         if (this.compagnyToWorkFor().length > 0) {
            this.compagnyToWorkFor()[0].workForCompagny()
         }
      }
   }

}

/** @param {NS} ns */
export async function main(ns) {
   ns.disableLog("scan")
   let compagnyManager = new CompagnyManager(ns)
   compagnyManager.loop()
}