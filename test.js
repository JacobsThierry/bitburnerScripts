import { Batch } from "batching/Batch"

/** @param {NS} ns */
export async function main(ns) {

   ns.tail()

   let b = new Batch(ns, "n00dles", 1);

   ns.print("Cycle ram = ", b.getCycleRamCost())
   ns.print("Total ram = ", ns.getServerMaxRam("home"))

}