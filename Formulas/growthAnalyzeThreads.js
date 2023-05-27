
import { numCycleForGrowth } from "Formulas/numCycleForGrowth"
/**
 * @param {NS} ns
 * @param {Server} server
 * @param {IPerson} person
 * @param {number} growthAmount
 * @returns {number}
 */
export function growthAnalyzeThreads(ns, server, person, growthAmount, cores = 1) {
   return numCycleForGrowth(ns, server, person, growthAmount, cores)
}