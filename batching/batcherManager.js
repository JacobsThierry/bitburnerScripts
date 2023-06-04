import { Batcher } from "batching/Batch";
import { findAllRootServers } from "servers/findAllServers"
import { execSomewhere, getMaximumInstanceOfScript } from "servers/ramManager"
import { serverManagerLoop } from "servers/serverManager"
import { optimizeBatch, findBestServers, isMaxed } from "batching/batchOptimizer"
import { resetServer } from "hackingFunctions/resetServer"
import { calculateWeakenTime } from "Formulas/calculateWeakenTime"

import { openAllPorts } from "servers/portOpener"
import { CONSTANTS } from "Formulas/constant";


export class BatcherManager {


   /**
    * Description
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns) {
      this.ns = ns


      this.clock = 0

      this.lastShare = 0

      /**@type {Batcher[]} */
      this.batchers = []
   }


   loop() {
      if (this.clock == 0) {
         //Optimizing the currently running batches
         let totalThreadsAvailable = this.getTotalThreadsAvailable()

         opt: for (let i = 0; i < this.batchers.length; i++) {
            if (totalThreadsAvailable < 10) {
               break opt;
            }

            let batcher = this.batchers[i]
            let batcherOpt = optimizeBatch(this.ns, batcher, totalThreadsAvailable + batcher.trueThreadsCount())


            totalThreadsAvailable += batcher.trueThreadsCount()
            totalThreadsAvailable -= batcherOpt.trueThreadsCount()
            this.batchers[i] = batcherOpt;


         }
         let nonMaxed = this.batchers.filter(batch => !isMaxed(batch))

         let added = true
         while (added) {
            added = false
            totalThreadsAvailable = this.getTotalThreadsAvailable()

            if (totalThreadsAvailable > 100 || nonMaxed.length == 0) {
               let bestServers = findBestServers(this.ns);

               //Filtering the server that are alredy hacked
               bestServers = bestServers.filter(serv => !(this.batchers.some(batcher => batcher.server.trim() == serv[0].server.trim())))

               let b = bestServers[0][0]
               b = optimizeBatch(this.ns, b, totalThreadsAvailable);

               let { ht, wt1, gt, wt2 } = b.getThreadsPerCycle();

               if (ht > 0 && b.trueThreadsCount() != NaN) {
                  this.batchers.push(b)
                  added = true
               }
            }
         }
      }



      this.manageShare()
      this.clock = (this.clock + 1) % 6000
      for (let i = 0; i < this.batchers.length; i++) {

         let bat = this.batchers[i]
         bat.loop()
         //bat.compareTrueThreadCount()
      }
   }


   shareScript = "hackingFunctions/share.js"


   manageShare() {
      let threadsAvailable = this.getTotalThreadsAvailable();
      if ((Date.now() - this.lastShare) > 10100) {
         this.lastShare = Date.now()
         let shareThreads = Math.floor(threadsAvailable / 4)
         //execSomewhere(this.ns, this.shareScript, shareThreads)

         let ramAvailable = this.ns.getServerMaxRam("home") - this.ns.getScriptRam("mainLoop.js", "home") - this.ns.getScriptRam("factions/factionManager.js");
         let scriptRam = this.ns.getScriptRam(this.shareScript)
         let threadRoom = Math.floor(ramAvailable / scriptRam);

         shareThreads = Math.min(shareThreads, threadRoom)

         if (shareThreads > 0) {
            this.ns.exec(this.shareScript, "home", shareThreads)
         }
      }

   }

   getTotalThreadsAvailable() {
      return (getMaximumInstanceOfScript(this.ns, "hackingFunctions/grow_delay.js", true) - this.sumThreadUsage())
   }

   getRevenues() {
      let rev = 0;
      for (let i = 0; i < this.batchers.length; i++) {
         let b = this.batchers[i]
         if (b.serverResetter.isDone()) {

            let temp = b.getRevenues()
            if (b.getDepth() > 0) {
               temp *= b.batches.length / b.getDepth()
               rev += temp
            }
         }
      }
      return rev;
   }

   /**
  * Description
  * @returns {number}
  */
   sumThreadUsage() {

      let sum = 0
      for (let i = 0; i < this.batchers.length; i++) {
         let b = this.batchers[i]
         let tc = b.trueThreadsCount()

         if (!isNaN(tc) && !(tc == null)) {
            sum += tc
         }
      }
      return sum

   }


}