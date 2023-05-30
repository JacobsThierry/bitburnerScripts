import { myGetBitNodeMultipliers } from "Formulas/bitNode/getBitNodeMultipliers";
import { calculateIntelligenceBonus } from "Formulas/calculateIntelligenceBonus";
import { CONSTANTS } from "Formulas/constant";


//TODO: ajouter ns dans les dernières fonctions pour récupérer le bitnode

/**
* Description
* @param {NS} ns
* @param {number} amt
* @returns {any}
*/
export function getRepFromDonation(ns, amt) {
   let person = ns.getPlayer()
   let bnm = 0

   try {
      let bitnode = JSON.parse(ns.read("/data/resetInfo.txt")).currentNode
      let bitNodeMultipliers = myGetBitNodeMultipliers(bitnode)
      bnm = bitNodeMultipliers.FactionWorkRepGain;
   } catch {
      bnm = 1;
   }
   return (amt / CONSTANTS.DonateMoneyToRepDivisor) * person.mults.faction_rep * bnm;
}


export function favorToRep(f) {
   const raw = 25000 * (Math.pow(1.02, f) - 1);
   return Math.round(raw * 10000) / 10000; // round to make things easier.
}

export function repToFavor(r) {
   const raw = Math.log(r / 25000 + 1) / Math.log(1.02);
   return Math.round(raw * 10000) / 10000; // round to make things easier.
}

export var FactionWorkType = {
   hacking: "hacking",
   field: "field",
   security: "security",
}

/**
 * Description
 * @param {NS} ns
 * @param {IPerson} person
 * @param {FactionWorkType} type
 * @param {favor} favor
 * @returns {any}
 */
export function calculateFactionRep(ns, person, type, favor) {
   const repFormulas = {
      [FactionWorkType.hacking]: getHackingWorkRepGain,
      [FactionWorkType.field]: getFactionFieldWorkRepGain,
      [FactionWorkType.security]: getFactionSecurityWorkRepGain,
   };
   return repFormulas[type](ns, person, favor);
};

/**
 * Description
 * @param {IPerson} p
 * @param {number} favor
 * @returns {number}
 */
export function getHackingWorkRepGain(ns, p, favor) {
   return (
      ((p.skills.hacking + p.skills.intelligence / 3) / CONSTANTS.MaxSkillLevel) *
      p.mults.faction_rep *
      calculateIntelligenceBonus(p.skills.intelligence, 1) *
      mult(ns, favor) *
      CalculateShareMult()
   );
}

export function CalculateShareMult(power = 0) {
   const x = 1 + Math.log(power) / 25;
   if (isNaN(x) || !isFinite(x)) return 1;
   return x;
}

/**
 * Description
 * @param {IPerson} p
 * @param {number} favor
 * @returns {number}
 */
export function getFactionFieldWorkRepGain(ns, p, favor) {
   const t =
      (0.9 *
         (p.skills.strength +
            p.skills.defense +
            p.skills.dexterity +
            p.skills.agility +
            p.skills.charisma +
            (p.skills.hacking + p.skills.intelligence) * CalculateShareMult())) /
      CONSTANTS.MaxSkillLevel /
      5.5;
   return t * p.mults.faction_rep * mult(ns, favor) * calculateIntelligenceBonus(p.skills.intelligence, 1);
}

/**
 * Description
 * @param {IPerson} p
 * @param {number} favor
 * @returns {number}
 */
export function getFactionSecurityWorkRepGain(ns, p, favor) {
   const t =
      (0.9 *
         (p.skills.strength +
            p.skills.defense +
            p.skills.dexterity +
            p.skills.agility +
            (p.skills.hacking + p.skills.intelligence) * CalculateShareMult())) /
      CONSTANTS.MaxSkillLevel /
      4.5;
   return t * p.mults.faction_rep * mult(ns, favor) * calculateIntelligenceBonus(p.skills.intelligence, 1);
}


export function mult(ns, favor) {
   let favorMult = 1 + favor / 100;
   if (isNaN(favorMult)) {
      favorMult = 1;
   }

   let bnm = 0

   try {
      let bitnode = JSON.parse(ns.read("/data/resetInfo.txt")).currentNode
      let bitNodeMultipliers = myGetBitNodeMultipliers(bitnode)
      bnm = bitNodeMultipliers.FactionWorkRepGain;
   } catch {
      bnm = 1;
   }

   return favorMult * bnm;
}