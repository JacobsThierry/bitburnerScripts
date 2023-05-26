import { Batcher } from "batching/Batch";
import { getMaximumInstanceOfScript } from "servers/ramManager"

/**
 * Description
 * @param {Batcher} batcher
 * @returns {any}
 */
function getBatcherThreadCount(batcher) {
   let { ht, wt1, gt, wt2 } = batcher.getThreadsPerCycle();

   let { depth, period } = batcher.getDepthAndPeriod();

   return (ht + wt1 + gt + wt2) * depth;
}

/**
 * Description
 * @param {NS} ns
 * @param {Batcher} batcher
 * * @param {number} maxloop
 * @returns {Batcher}
 */
export function optimizeBatch(ns, batcher, maxloop = 10000) {

   let maxInstance = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js")

   batcher.percentStolen = 0.5;
   batcher.t0 = 200;


   let clock = 0;
   while (getBatcherThreadCount(batcher) > maxInstance) {
      if (clock == 0) {
         batcher.percentStolen *= 0.9;
      } else {
         batcher.t0 = batcher.t0 + 10;
      }
      clock = (clock + 1) % 2
   }

   /*
      //revert last change
      if (clock == 1) {
         batcher.percentStolen /= 0.9;
      } else {
         batcher.t0 = batcher.t0 - 10;
      }
   */
   return batcher

}


/** @param {NS} ns */
export async function main(ns) {



}