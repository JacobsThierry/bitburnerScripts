
/**
 * Description
 * @param {number} intelligence
 * @param {number} weight=1
 * @returns {number}
 */
export function calculateIntelligenceBonus(intelligence, weight = 1) {
   return 1 + (weight * Math.pow(intelligence, 0.8)) / 600;
}