import { Augmentation } from "factions/augmentation";


export class Faction {

   /**
    * Description
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns, factionName) {

      this.ns = ns
      this.factionName = factionName
      this.joined = false;

      let aug = ns.singularity.getAugmentationsFromFaction(factionName)

      this.augmentations = []

      for (let i = 0; i < aug.length; i++) {
         this.augmentations.push(new Augmentation(ns, aug[i], factionName))
      }

   }

   isCityFaction() {
      let cityFactions = ["Sector-12", "Chongqing", "New Tokyo", "Ishima", "Aevum", "Volhaven"]
      return cityFactions.includes(this.factionName)
   }


   joinFaction() {

      let joined = this.ns.singularity.joinFaction(this.factionName)
      this.joined = this.joined || joined

      return this.joined
   }

}