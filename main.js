
import { Batcher } from "batching/Batch";
import { findAllRootServers } from "servers/findAllServers"
import { execSomewhere, getMaximumInstanceOfScript } from "servers/ramManager"
import { serverManagerLoop } from "servers/serverManager"
import { optimizeBatch, findBestServers, isMaxed } from "batching/batchOptimizer"
import { resetServer } from "hackingFunctions/resetServer"
import { calculateWeakenTime } from "Formulas/calculateWeakenTime"

import { openAllPorts } from "servers/portOpener"
import { BatcherManager } from "batching/batcherManager"

/** @param {NS} ns */
export async function main(ns) {

   ns.disableLog("ALL");

   ns.disableLog("sleep")
   ns.disableLog("scan")
   ns.disableLog("getServerMaxRam")
   ns.disableLog("getServerUsedRam")
   //ns.enableLog("exec")

   ns.tail();

   openAllPorts(ns);


   ns.print("Done")

   ns.print("Trying to exec copy hacking")
   while (execSomewhere(ns, "servers/copyHacking.js", 1) != 0) {
      await ns.sleep(100)
   }

   while (execSomewhere(ns, "resets/writeResetInfo.js", 1) != 0) {
      await ns.sleep(100)
   }

   ns.print("Done")


   ns.print("Servers : ", findAllRootServers(ns));
   let maxInstance = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js")
   ns.print("max instance = " + maxInstance);





   /*let bestServers = findBestServers(ns);

   
   ns.print(b.toString())

   
*/



   let clock = 0;
   let manager = new BatcherManager(ns)

   //Forcing the n00dle
   let b = new Batcher(ns, "n00dles", 0.5, 200);
   b = optimizeBatch(ns, b);
   manager.batchers.push(b);


   //todo : split ça dans des fonctions
   while (true) {
      openAllPorts(ns);
      serverManagerLoop(ns);

      manager.loop()
      display(ns, manager)

      await ns.sleep(50);
   }
}



/**
 * Description
 * @param {NS} ns
 * @param {BatcherManager} manager
 * @returns {any}
 */
function display(ns, manager) {
   let str = "\n"
   for (let i = 0; i < manager.batchers.length; i++) {
      str += (manager.batchers[i].toString())
   }

   str += "\n=============================================";
   str += "\nMax thread : " + getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js", true)
   str += "\nThreads available : " + getTotalThreadsAvailable(ns, manager);

   ns.clearLog()
   ns.print(str)

}


/**
 * Description
 * @param {NS} ns
 * @param {BatcherManager} manager
 * @returns {any}
 */
function getTotalThreadsAvailable(ns, manager) {
   return getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js", true) - manager.sumThreadUsage()
}