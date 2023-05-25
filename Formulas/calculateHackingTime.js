import { calculateIntelligenceBonus } from "Formulas/calculateIntelligenceBonus"

/**
 * Returns time it takes to complete a hack on a server, in milliseconds
 * @param {Server} server
 * @param {IPerson} person
 * @returns {number}
 */
export function calculateHackingTime(server, person) {
   const difficultyMult = server.requiredHackingSkill * server.hackDifficulty;

   const baseDiff = 500;
   const baseSkill = 50;
   const diffFactor = 2.5;
   let skillFactor = diffFactor * difficultyMult + baseDiff;
   // tslint:disable-next-line
   skillFactor /= person.skills.hacking + baseSkill;

   const hackTimeMultiplier = 5;
   const hackingTime =
      (hackTimeMultiplier * skillFactor) /
      (person.mults.hacking_speed * calculateIntelligenceBonus(person.skills.intelligence, 1));

   return 1000 * hackingTime;
}