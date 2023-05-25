
import { numCycleForGrowth } from "Formulas/numCycleForGrowth"
/**
 * 
 * @param {Server} server
 * @param {IPerson} person
 * @param {number} growthAmount
 * @returns {number}
 */
export function growthAnalyzeThreads(server, person, growthAmount, cores = 1) {
   return numCycleForGrowth(server, person, growthAmount, cores)
}