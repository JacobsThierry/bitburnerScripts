import { execSomewhere } from "servers/ramManager"

import { myGetPurchasedServerUpgradeCost } from "Formulas/getPurchasedServerUpgradeCost"

import * as rm from "servers/ramManager"
import * as fas from "servers/findAllServers"

/** @param {NS} ns */
export async function main(ns) {
   ns.tail()
   ns.print(ns.exec("test2.js", "megacorp", 1))



}