
import { numCycleForGrowth } from "Formulas/numCycleForGrowth"
/**
 * This function returns the number of script threads you need when running the hack() command to steal the specified amount of money from the target server.
 * @param {Server} server
 * @param {IPerson} person
 * @param {number} growthAmount
 * @returns {number}
 */
export function growthAnalyzeThreads(server, person, growthAmount, cores = 1) {
   return numCycleForGrowth(server, person, growthAmount, cores)
}