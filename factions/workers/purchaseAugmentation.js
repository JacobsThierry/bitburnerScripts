

/** @param {NS} ns */
export async function main(ns) {
   if (ns.args.length < 2) {
      ns.print("Not enough args");
      return;
   }

   if ((ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length) == 0) {
      ns.write("/data/timeOfFirstBuy.txt", Date.now(), "w")
   }

   ns.singularity.purchaseAugmentation(ns.args[0], ns.args[1])
}