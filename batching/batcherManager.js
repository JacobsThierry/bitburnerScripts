import { Batcher } from "batching/Batch";
import { findAllRootServers } from "servers/findAllServers"
import { execSomewhere, getMaximumInstanceOfScript } from "servers/ramManager"
import { serverManagerLoop } from "servers/serverManager"
import { optimizeBatch, findBestServers, isMaxed } from "batching/batchOptimizer"
import { resetServer } from "hackingFunctions/resetServer"
import { calculateWeakenTime } from "Formulas/calculateWeakenTime"

import { openAllPorts } from "servers/portOpener"


export class BatcherManager {


   /**
    * Description
    * @param {ns} ns
    * @returns {any}
    */
   constructor(ns) {
      this.ns = ns


      this.clock = 0

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
            let batcherOpt = optimizeBatch(this.ns, batcher, totalThreadsAvailable + batcher.threadsCount())

            if (batcherOpt.getRevenues() > batcher.getRevenues()) {
               totalThreadsAvailable += batcher.threadsCount()
               totalThreadsAvailable -= batcherOpt.threadsCount()
               this.batchers[i] = batcherOpt;
            }
         }

         let nonMaxed = this.batchers.filter(batch => !isMaxed(batch))
         totalThreadsAvailable = this.getTotalThreadsAvailable()

         if (totalThreadsAvailable > 100 || nonMaxed.length == 0) {
            let bestServers = findBestServers(this.ns);

            //Filtering the server that are alredy hacked
            bestServers = bestServers.filter(serv => !(this.batchers.some(batcher => batcher.server.trim() == serv[0].server.trim())))

            let b = bestServers[0][0]
            optimizeBatch(this.ns, b, totalThreadsAvailable);

            let { ht, wt1, gt, wt2 } = b.getThreadsPerCycle();

            if (ht > 0) {
               this.batchers.push(b)
            }

         }
      }




      this.clock = (this.clock + 1) % 500
      for (let i = 0; i < this.batchers; i++) {
         let bat = this.batchers[i]
         bat.loop()
      }
   }

   getTotalThreadsAvailable() {
      return getMaximumInstanceOfScript(this.ns, "/hackingFunctions/grow_delay.js", true) - this.sumThreadUsage()
   }

   /**
  * Description
  * @returns {number}
  */
   sumThreadUsage() {

      let sum = 0
      for (let i = 0; i < this.batchers.length; i++) {
         let b = this.batchers[i]
         sum += b.threadsCount()
      }
      return sum

   }


}