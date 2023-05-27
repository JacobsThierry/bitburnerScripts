
import { myGetPurchaseServerCost } from "Formulas/getPurchaseServerCost"

/**
 * Description
 * @param {NS} ns
 * @param {any} hostname
 * @param {any} ram
 * @returns {any}
 */
export function myGetPurchasedServerUpgradeCost(ns, hostname, ram) {
   const server = ns.getServer(hostname);
   return myGetPurchaseServerCost(ns, ram) - myGetPurchaseServerCost(ns, server.maxRam);
};