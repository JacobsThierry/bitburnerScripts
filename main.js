
import { Batcher } from "batching/Batch";
import { findAllRootServers } from "servers/findAllServers"
import { execSomewhere, getMaximumInstanceOfScript } from "servers/ramManager"
import { serverManagerLoop } from "servers/serverManager"
import { optimizeBatch, findBestServers } from "batching/batchOptimizer"
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
   let bestServers = findBestServers(ns);

   let b = new Batcher(ns, "n00dles", 0.5, 200);
   b = optimizeBatch(ns, b);
   ns.print(b.toString())

   batchers.push(b);




   let didSomething = await resetServer(ns, b.server);
   if (didSomething) {
      let sleeptime = calculateWeakenTime(ns.getServer(b.server), ns.getPlayer())
      ns.print("Waiting for the weakens to end (", ns.tFormat(sleeptime), ")");
      await ns.sleep(sleeptime)
   }


   let clock = 0;

   //todo : split ça dans des fonctions
   while (true) {

      //to reduce the lag we only do some things every so often
      if (clock == 0) {
         openAllPorts(ns);
         serverManagerLoop(ns);

         let totalThreadsAvailable = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js")
         for (let i = 0; i < batchers.length; i++) {
            let batcher = batchers[i]
            totalThreadsAvailable -= batcher.threadsCount()
         }


         for (let i = 0; i < batchers.length; i++) {

            if (totalThreadsAvailable < 100) {
               break;
            }


            let batcher = batchers[i]
            ns.print("On optimise le batcher sur ", batcher.server)

            let batcherOpt = optimizeBatch(ns, batcher, totalThreadsAvailable + batcher.getThreadsPerCycle())

            totalThreadsAvailable += batcher.threadsCount()
            totalThreadsAvailable -= batcherOpt.threadsCount()
            batchers[i] = batcherOpt;
         }
      }

      for (let i = 0; i < batchers.length; i++) {
         let batcher = batchers[i]
         batcher.loop()
      }

      clock = (clock + 1) % 500

      await ns.sleep(50);
   }


}