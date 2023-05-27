import { execSomewhere } from "servers/ramManager"

import { myGetPurchasedServerUpgradeCost } from "Formulas/getPurchasedServerUpgradeCost"


import * as rm from "servers/ramManager"
import * as fas from "servers/findAllServers"

/** @param {NS} ns */
export async function main(ns) {
   ns.tail()
   ns.disableLog("ALL")
   ns.print(rm.getTotalRamAvailable(ns))

   ns.print(rm.getMaximumInstanceOfScript(ns, "/hackingFunctions/grow.js", true))

   ns.print(fas.findAllRootServers(ns))


}