
import { Batcher } from "batching/Batch";
import { findAllRootServers } from "servers/findAllServers"
import { execSomewhere, getMaximumInstanceOfScript } from "servers/ramManager"
import { serverManagerLoop } from "servers/serverManager"
import { optimizeBatch, findBestServers, isMaxed } from "batching/batchOptimizer"
import { resetServer } from "hackingFunctions/resetServer"
import { calculateWeakenTime } from "Formulas/calculateWeakenTime"

import { openAllPorts } from "servers/portOpener"

/** @param {NS} ns */
export async function main(ns) {

   ns.disableLog("ALL");

   ns.disableLog("sleep")
   ns.disableLog("scan")
   ns.disableLog("getServerMaxRam")
   ns.disableLog("getServerUsedRam")

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


   let batchers = []
   //Forcing the n00dle
   let b = new Batcher(ns, "n00dles", 0.5, 200);
   b = optimizeBatch(ns, b);
   batchers.push(b);

   /*let bestServers = findBestServers(ns);

   
   ns.print(b.toString())

   
*/
   let clock = 0;



   //todo : split ça dans des fonctions
   while (true) {

      //to reduce the lag we only do some things every so often
      if (clock == 0) {



         openAllPorts(ns);
         serverManagerLoop(ns);
         //Optimizing the currently running batches
         let totalThreadsAvailable = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js", true) - sumThreadUsage(batchers)

         opt: for (let i = 0; i < batchers.length; i++) {
            if (totalThreadsAvailable < 50) {
               break opt;
            }


            let batcher = batchers[i]
            ns.tprint("On optimise le batcher sur ", batcher.server)
            ns.print("On optimise le batcher sur ", batcher.server)


            let batcherOpt = optimizeBatch(ns, batcher, totalThreadsAvailable + batcher.threadsCount())

            totalThreadsAvailable += batcher.threadsCount()
            totalThreadsAvailable -= batcherOpt.threadsCount()


            batchers[i] = batcherOpt;
         }

         //Add new batch if evrything is alredy maxed
         let nonMaxed = batchers.filter(batch => !isMaxed(batch))

         totalThreadsAvailable = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js", true) - sumThreadUsage(batchers)


         if (nonMaxed.length == 0) {

            let bestServers = findBestServers(ns);

            //Filtering the server that are alredy hacked in the most discusting way I can think of
            bestServers = bestServers.filter(serv => !(batchers.some(batcher => batcher.server == serv.server)))

            //ns.tprint(bestServers.toString())


            //let maxThread = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js", true) - sumThreadUsage(batchers)


            let b = bestServers[0][0]

            optimizeBatch(ns, b, totalThreadsAvailable);

            let { ht, wt1, gt, wt2 } = b.getThreadsPerCycle();

            if (ht > 0) {

               batchers.push(b)
            }
         }
      }


      let str = "\n"
      for (let i = 0; i < batchers.length; i++) {
         let batcher = batchers[i]
         batcher.loop()


         ns.clearLog()

         str += batcher.toString()

      }
      str += "\n TOTAL THREAD : " + getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js", true)
      str += "\n=================\nTotal thread Available :" + (getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js", true) - sumThreadUsage(batchers))
      ns.print(str)

      clock = (clock + 1) % 500

      await ns.sleep(50);
   }
}


/**
 * Description
 * @param {Batcher[]} batches
 * @returns {any}
 */
function sumThreadUsage(batches) {

   let sum = 0
   for (let i = 0; i < batches.length; i++) {
      let b = batches[i]
      sum += b.threadsCount()
   }
   return sum

}