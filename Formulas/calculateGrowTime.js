
import { calculateHackingTime } from "Formulas/calculateHackingTime"

/**
 * Returns time it takes to complete a grow operation on a server, in seconds
 * @param {Server} server
 * @param {IPerson} person
 * @returns {number}
 */
export function calculateGrowTime(server, person) {
   const growTimeMultiplier = 3.2; // Relative to hacking time. 16/5 = 3.2

   return growTimeMultiplier * calculateHackingTime(server, person);
}