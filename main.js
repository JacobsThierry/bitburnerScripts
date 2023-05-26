import { openAllPorts } from "servers/portOpener"
import { Batcher } from "batching/Batch";
import { getMaximumInstanceOfScript } from "servers/ramManager"
import { copyHacking } from "servers/copyHacking"
import { findAllRootServers } from "servers/findAllServers"

import { calculateHackingTime } from "Formulas/calculateHackingTime"

import { execSomewhere } from "servers/ramManager"

/** @param {NS} ns */
export async function main(ns) {

   ns.disableLog("ALL");

   while (!execSomewhere(ns, "servers/portOpener.js", 1)) {
      await ns.sleep(100)
   }
   while (!execSomewhere(ns, "servers/copyHacking.js", 1)) {
      await ns.sleep(100)
   }

   ns.tail();




   ns.print("Servers : ", findAllRootServers(ns));
   let maxInstance = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js")
   ns.print("max instance = " + maxInstance);

   let b = new Batcher(ns, "n00dles", 0.02, 855);



   ns.print(b.toString());

   //return true;

   await b.loop();


}