import { execSomewhere } from "servers/ramManager"


export class Augmentation {

   static neuroflux = "NeuroFlux Governor"

   /**
    * Description
    * @param {NS} ns
    * @param {string} augmentationName
    * @returns {any}
    */
   constructor(ns, augmentationName, faction) {
      this.ns = ns
      this.augmentationName = augmentationName
      this.faction = faction
   }

   getAugPrice() {
      return this.ns.singularity.getAugmentationPrice(this.augmentationName)
   }

   getReputationReq() {
      return this.ns.singularity.getAugmentationRepReq(this.augmentationName)
   }

   getAugmentationPrereq() {
      return this.ns.singularity.getAugmentationPrereq(this.augmentationName)
   }

   isOwned() {
      return this.ns.singularity.getOwnedAugmentations(true).includes(this.augmentationName)
   }

   hasAugmentationPrereq() {
      let prereq = this.getAugmentationPrereq()
      let myAugs = this.ns.singularity.getOwnedAugmentations(true)
      return prereq.every(aug => myAugs.includes(aug))
   }

   getStats() {
      return this.ns.singularity.getAugmentationStats(this.augmentationName)
   }

   purchase() {
      //return this.ns.singularity.purchaseAugmentation(this.faction, this.augmentationName)
      execSomewhere(this.ns, "factions/workers/purchaseAugmentation.js", 1, this.faction, this.augmentationName)
   }

   isNeuroflux() {
      return this.augmentationName.startsWith(Augmentation.neuroflux)
   }

}