import { execSomewhere } from "servers/ramManager"

import { myGetPurchasedServerUpgradeCost } from "Formulas/getPurchasedServerUpgradeCost"

import * as chart from "asciiCharts/asciiCharts"

import * as rm from "servers/ramManager"
import * as fas from "servers/findAllServers"

/** @param {NS} ns */
export async function main(ns) {
   ns.tail()
   ns.disableLog("ALL")
   /*
   ns.print(rm.getTotalRamAvailable(ns))

   ns.print("Max grow : ", rm.getMaximumInstanceOfScript(ns, "/hackingFunctions/grow.js"))

   ns.print(fas.findAllRootServers(ns))

   ns.enableLog("ALL")

   */

   let mySuperList = [0, 1, 2, 2, 2, 1, 3, 0, 0, 1, 5]

   //let plotter = chart;

   //var asciichart = require("asciiCharts/asciiCharts")

   let str = "\n"
   str += chart.plot(mySuperList)

   ns.print(str)

}