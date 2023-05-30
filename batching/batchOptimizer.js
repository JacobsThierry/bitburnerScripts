import { Batcher } from "batching/Batch";
import { getMaximumInstanceOfScript } from "servers/ramManager"
import { findAllRootServers, findAllServers } from "servers/findAllServers"

let maxPercentStolen = 0.5;
let maxT0 = 200;

/**
 * Description
 * @param {Batcher} batcher
 * @returns {any}
 */
export function isMaxed(batcher) {
   return batcher.t0 == maxT0 && batcher.percentStolen == maxPercentStolen
}

/**
 * Description
 * @param {NS} ns
 * @param {Batcher} batcher
 * @param {number} maxThreads
 * @returns {Batcher}
 */
export function optimizeBatch(ns, batcher, maxThreads = -1) {

   if (maxThreads == -1) {
      maxThreads = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js")
   }
   batcher.percentStolen = maxPercentStolen;
   batcher.t0 = maxT0;

   let maxloop = 100000
   let clock = 0;
   while (batcher.trueThreadsCount() > maxThreads && maxloop-- > 0) {
      if (clock == 0) {
         batcher.percentStolen *= 0.9;
      } else {
         batcher.t0 = batcher.t0 + 100;
      }

      let { ht, wt1, gt, wt2 } = batcher.getThreadsPerCycle();

      if (ht == 0) {
         return batcher
      }


      clock = (clock + 1) % 2
   }


   return batcher

}

/** @param {NS} ns */
export function findBestServers(ns, examptList = ["home"]) {
   let servers = findAllRootServers(ns)

   servers = servers.filter(serv => !(examptList.includes(serv)));

   let revenues = []

   let maxInstance = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js", true)

   for (let i = 0; i < servers.length; i++) {
      let serv = servers[i]
      let b = new Batcher(ns, serv, 0.5, 200);
      b = optimizeBatch(ns, b, maxInstance);



      revenues.push([b, b.getRevenues() / b.trueThreadsCount()])

   }

   revenues = revenues.sort((a, b) => b[1] - a[1]);

   return revenues;




}


/** @param {NS} ns */
export async function main(ns) {

}