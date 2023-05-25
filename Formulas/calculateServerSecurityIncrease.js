import { CONSTANTS } from "Formulas/constant"

/**
 * Return the security increase after a hack or grow
 * @param {number} threads
 * @param {bool} isGrow
 * @returns {number}
 */
export function calculateServerSecurityIncrease(threads, isGrow) {
   return CONSTANTS.ServerFortifyAmount * threads * (isGrow ? 2 : 1);
}