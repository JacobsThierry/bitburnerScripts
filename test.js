import { Batch } from "batching/Batch"

/** @param {NS} ns */
export async function main(ns) {

   ns.tail()

   let b = new Batch(ns, "n00dles", 0.01, 1000);

   ns.print(b.toString())

}