import { openAllPorts } from "servers/portOpener"
import { Batch } from "batching/Batch";
import { getMaximumInstanceOfScript } from "servers/ramManager"

import { calculateHackingTime } from "Formulas/calculateHackingTime"

/** @param {NS} ns */
export async function main(ns) {
   openAllPorts(ns);
   ns.tail();

   let maxInstance = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js")
   ns.print("max instance = " + maxInstance);

   let b = new Batch(ns, "n00dles", 0.04, 1000);



   ns.print(b.toString());

   await b.loop();


}