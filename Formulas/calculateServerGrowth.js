
import { CONSTANTS } from "Formulas/constant"

/**
 * Return the multiplier of the growth. >1
 * @param {Server} server
 * @param {number} threads
 * @param {IPerson} p
 * @param {number} cores=1
 * @returns {number }
 */
export function calculateServerGrowth(server, threads, p, cores = 1) {
   const numServerGrowthCycles = Math.max(Math.floor(threads), 0);

   //Get adjusted growth rate, which accounts for server security
   const growthRate = CONSTANTS.ServerBaseGrowthRate;
   let adjGrowthRate = 1 + (growthRate - 1) / server.hackDifficulty;
   if (adjGrowthRate > CONSTANTS.ServerMaxGrowthRate) {
      adjGrowthRate = CONSTANTS.ServerMaxGrowthRate;
   }

   //Calculate adjusted server growth rate based on parameters
   const serverGrowthPercentage = server.serverGrowth / 100;

   let bnm = 0
   try {
      bnm = BitNodeMultipliers.ServerGrowthRate;
   } catch {
      bnm = 1;
   }

   const numServerGrowthCyclesAdjusted =
      numServerGrowthCycles * serverGrowthPercentage * bnm;

   //Apply serverGrowth for the calculated number of growth cycles
   const coreBonus = 1 + (cores - 1) / 16;
   return Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted * p.mults.hacking_grow * coreBonus);
}


/**
 * Return how many threads are needed to grow by a value.
 * TODO : remove the while and do it properly
 * @param {Server} server
 * @param {number} growth
 * @param {IPerson} p
 * @param {number} cores=1
 * @returns {number}
 */
export function calculateThreadsForGrowth(server, growth, p, cores = 1) {

   let t = 1;
   while (calculateServerGrowth(server, t, p, cores) < growth) {
      t = t + 1;
   }
   return t;

}