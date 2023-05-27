import { calculatePercentMoneyHacked } from "Formulas/calculatePercentMoneyHacked"

/**
 * This function returns the number of script threads you need when running the hack() command to steal the specified amount of money from the target server.
 * @param {NS} ns
 * @param {Server} server
 * @param {IPerson} person
 * @param {number} hackAmount
 * @returns {number}
 */
export function hackAnalyzeThreads(ns, server, person, hackAmount) {
   if (hackAmount < 0 || hackAmount > server.moneyAvailable) {
      return -1;
   } else if (hackAmount === 0) {
      return 0;
   }

   const percentHacked = calculatePercentMoneyHacked(ns, server, person);


   if (percentHacked === 0 || server.moneyAvailable === 0) {
      return 0; // To prevent returning infinity below
   }

   return hackAmount / Math.floor(server.moneyAvailable * percentHacked);
}