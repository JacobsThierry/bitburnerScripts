import { calculateHackingTime } from "Formulas/calculateHackingTime"
/**
 * Returns time it takes to complete a weaken operation on a server, in seconds
 * @param {Server} server
 * @param {IPerson} person
 * @returns {number}
 */
export function calculateWeakenTime(server, person) {
   const weakenTimeMultiplier = 4; // Relative to hacking time

   return weakenTimeMultiplier * calculateHackingTime(server, person);
}