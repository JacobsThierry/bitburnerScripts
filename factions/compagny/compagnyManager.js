import { CONSTANTS } from "Formulas/constant"
import { Compagny } from "factions/compagny/compagny"
import { Faction } from "factions/faction"
import { FactionsManager } from "factions/factionManager"

export class CompagnyManager {


   /**
    * Description
    * @param {NS} ns
    * @param {FactionsManager} factionManager
    * @returns {any}
    */
   constructor(ns, factionManager) {
      /** @type {string[]} */
      let compagnies = Object.values(Compagny.compagnyFaction)

      this.ns = ns
      this.factionManager = factionManager

      this.compagnies = []

      for (let i = 0; i < compagnies.length; i++) {
         this.compagnies.push(new Compagny(ns, compagnies[i]))
      }
   }

   canWork() {
      return this.factionManager.getNextFactionToWorkFor() == null
   }


   /**
    * Description
    * @returns {Compagny[]}
    */
   compagnyToWorkFor() {
      let com = Compagny.compagnyFaction

      let filtered = Object.keys(com).reduce((filtered, key) => {
         if (this.ns.singularity.getCompanyRep(com[key]) < CONSTANTS.CorpFactionRepRequirement && !(new Faction(this.ns, key)).isJoined()) {
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

         this.compagnyToWorkFor()[0].workForCompagny()
      }
   }

}