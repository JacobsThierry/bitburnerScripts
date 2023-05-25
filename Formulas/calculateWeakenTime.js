import { calculateHackingTime } from "Formulas/calculateHackingTime"
/**
 * Returns time it takes to complete a weaken operation on a server, in milliseconds
 * @param {Server} server
 * @param {IPerson} person
 * @returns {number}
 */
export function calculateWeakenTime(server, person) {
   const weakenTimeMultiplier = 4; // Relative to hacking time

   return 1 * weakenTimeMultiplier * calculateHackingTime(server, person);
}