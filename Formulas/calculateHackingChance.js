/**
 * Returns the chance the person has to successfully hack a server
 * @param {Server} server
 * @param {IPerson} person
 * @returns {number}
 */
export function calculateHackingChance(server, person) {
   const hackFactor = 1.75;
   const difficultyMult = (100 - server.hackDifficulty) / 100;
   const skillMult = hackFactor * person.skills.hacking;
   const skillChance = (skillMult - server.requiredHackingSkill) / skillMult;
   const chance =
      skillChance *
      difficultyMult *
      person.mults.hacking_chance *
      calculateIntelligenceBonus(person.skills.intelligence, 1);
   if (chance > 1) {
      return 1;
   }
   if (chance < 0) {
      return 0;
   }

   return chance;
}

