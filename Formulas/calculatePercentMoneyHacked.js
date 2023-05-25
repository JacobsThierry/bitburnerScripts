/**
 * Description
 * @param {Server} server
 * @param {IPerson} person
 * @returns {number}
 */
export function calculatePercentMoneyHacked(server, person) {
   // Adjust if needed for balancing. This is the divisor for the final calculation
   const balanceFactor = 240;

   let bnm = 0
   try {
      bnm = BitNodeMultipliers.ScriptHackMoney;
   } catch {
      bnm = 1;
   }

   const difficultyMult = (100 - server.hackDifficulty) / 100;
   const skillMult = (person.skills.hacking - (server.requiredHackingSkill - 1)) / person.skills.hacking;
   const percentMoneyHacked =
      (difficultyMult * skillMult * person.mults.hacking_money * bnm) / balanceFactor;
   if (percentMoneyHacked < 0) {
      return 0;
   }
   if (percentMoneyHacked > 1) {
      return 1;
   }

   return percentMoneyHacked;
}

