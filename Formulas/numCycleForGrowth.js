
import { myGetBitNodeMultipliers } from "Formulas/bitNode/getBitNodeMultipliers";
import { CONSTANTS } from "Formulas/constant"
/**
 * Returns the number of "growth cycles" needed to grow the specified server by the
 * specified amount.
 * @param {NS} ns
 * @param {Server} server
 * @param {IPerson} player
 * @param {number} growth
 * @param {number} cores=1
 * @returns {number}
 */
export function numCycleForGrowth(ns, server, player, growth, cores = 1) {
   let ajdGrowthRate = 1 + (CONSTANTS.ServerBaseGrowthRate - 1) / server.hackDifficulty;
   if (ajdGrowthRate > CONSTANTS.ServerMaxGrowthRate) {
      ajdGrowthRate = CONSTANTS.ServerMaxGrowthRate;
   }

   const serverGrowthPercentage = server.serverGrowth / 100;

   const coreBonus = 1 + (cores - 1) / 16;


   let bnm = 0
   let bitnode = 0
   try {
      bitnode = JSON.parse(ns.read("/data/resetInfo.txt")).currentNode

   } catch {
      bitnode = 1;
   }

   let bitNodeMultipliers = myGetBitNodeMultipliers(bitnode)
   bnm = bitNodeMultipliers.ServerGrowthRate;

   const cycles =
      Math.log(growth) /
      (Math.log(ajdGrowthRate) *
         player.mults.hacking_grow *
         serverGrowthPercentage *
         bnm *
         coreBonus);

   return cycles;
}