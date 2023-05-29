

export class Augmentation {

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

   getPrice() {
      return this.ns.singularity.getAugmentationPrice(this.augmentationName)
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
      return this.ns.singularity.purchaseAugmentation(this.faction, this.augmentationName)
   }

}