
import { calculateServerGrowth } from "Formulas/calculateServerGrowth"
/**
 * Applied server growth for a single server. Returns the percentage growth
 * @param {NS} ns
 * @param {Server} server
 * @param {number} threads
 * @param {number} cores
 * @returns {number}
 */
export function processSingleServerGrowth(ns, server, threads, cores = 1) {
   let serverGrowth = calculateServerGrowth(ns, server, threads, Player, cores);
   if (serverGrowth < 1) {
      serverGrowth = 1;
   }

   let mon = server.moneyAvailable;

   const oldMoneyAvailable = mon;
   mon += 1 * threads; // It can be grown even if it has no money
   mon *= serverGrowth;

   // in case of data corruption
   if (isValidNumber(server.moneyMax) && isNaN(mon)) {
      mon = server.moneyMax;
   }

   // cap at max
   if (isValidNumber(server.moneyMax) && mon > server.moneyMax) {
      mon = server.moneyMax;
   }

   return mon / oldMoneyAvailable;
}