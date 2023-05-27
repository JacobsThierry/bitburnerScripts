import { execSomewhere } from "servers/ramManager"

import { myGetPurchasedServerUpgradeCost } from "Formulas/getPurchasedServerUpgradeCost"

/** @param {NS} ns */
export async function main(ns) {
   ns.tail()
   ns.print(myGetPurchasedServerUpgradeCost(ns, "pserv-0", 32))
   ns.print(ns.getPurchasedServerUpgradeCost("pserv-0", 32))

}