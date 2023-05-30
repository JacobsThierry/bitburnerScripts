import { Augmentation } from "factions/augmentation";


/** @param {NS} ns */
export async function main(ns) {
   if (ns.args.length < 1) {
      ns.print("Not enough args");
      return;
   }

   for (let i = 0; i < 10; i++) {
      ns.singularity.purchaseAugmentation(ns.args[0], Augmentation.neuroflux)
   }
}