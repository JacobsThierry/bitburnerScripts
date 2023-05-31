
import { CONSTANTS } from "Formulas/constant"
import { myGetBitNodeMultipliers } from "Formulas/bitNode/getBitNodeMultipliers"


/**
 * Return the multiplier of the growth. >1
 * @param {NS} ns
 * @param {Server} server
 * @param {number} threads
 * @param {IPerson} p
 * @param {number} cores=1
 * @returns {number }
 */
export function calculateServerGrowth(ns, server, threads, p, cores = 1) {
   const numServerGrowthCycles = Math.max(Math.floor(threads), 0);

   //Get adjusted growth rate, which accounts for server security
   const growthRate = CONSTANTS.ServerBaseGrowthRate;
   let adjGrowthRate = 1 + (growthRate - 1) / server.hackDifficulty;
   if (adjGrowthRate > CONSTANTS.ServerMaxGrowthRate) {
      adjGrowthRate = CONSTANTS.ServerMaxGrowthRate;
   }

   //Calculate adjusted server growth rate based on parameters
   const serverGrowthPercentage = server.serverGrowth / 100;

   let bnm = 1
   let bitnode = 0
   try {
      bitnode = JSON.parse(ns.read("/data/resetInfo.txt")).currentNode

   } catch {
      bitnode = 1
   }
   let bitNodeMultipliers = myGetBitNodeMultipliers(bitnode)
   bnm = bitNodeMultipliers.ServerGrowthRate;



   const numServerGrowthCyclesAdjusted =
      numServerGrowthCycles * serverGrowthPercentage * bnm;

   //Apply serverGrowth for the calculated number of growth cycles
   const coreBonus = 1 + (cores - 1) / 16;
   return Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted * p.mults.hacking_grow * coreBonus);
}


/**
 * Return how many threads are needed to grow by a value.
 * TODO : remove the while and do it properly
 * @param {NS} ns
 * @param {Server} server
 * @param {number} growth
 * @param {IPerson} p
 * @param {number} cores=1
 * @returns {number}
 */
export function calculateThreadsForGrowth(ns, server, growth, p, cores = 1) {

   let t = 1;
   while (calculateServerGrowth(ns, server, t, p, cores) < growth) {
      t = t + 1;
   }
   return t;

}