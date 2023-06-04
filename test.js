import { execSomewhere } from "servers/ramManager"

import { myGetPurchasedServerUpgradeCost } from "Formulas/getPurchasedServerUpgradeCost"

import * as chart from "asciiCharts/asciiCharts"

import * as rm from "servers/ramManager"
import * as fas from "servers/findAllServers"

import { getPathToServer } from "servers/getPathToServer"
import { calculatePercentMoneyHacked } from "Formulas/calculatePercentMoneyHacked"
import { getRepFromDonation } from "factions/factionsFormulas"
import { calculateGrowTime } from "Formulas/calculateGrowTime"
import { calculateHackingTime } from "Formulas/calculateHackingTime"

/** @param {NS} ns */
export async function main(ns) {
   ns.tail()
   ns.disableLog("ALL")

   //ns.tprint(ns.tFormat(calculateHackingTime(ns.getServer("n00dles"), ns.getPlayer())))

   /*
   ns.print(rm.getTotalRamAvailable(ns))

   ns.print("Max grow : ", rm.getMaximumInstanceOfScript(ns, "/hackingFunctions/grow.js"))

   ns.print(fas.findAllRootServers(ns))

   ns.enableLog("ALL")

   */
   /*
      let mySuperList = [0, 1, 2, 2, 2, 1, 3, 0, 0, 1, 5]
   
      //let plotter = chart;
   
      //var asciichart = require("asciiCharts/asciiCharts")
   
      let str = "\n"
      str += chart.plot(mySuperList)
   
      ns.print(str)*/

   //ns.print(await getPathToServer(ns, "home", "megacorp"))

   //ns.tprint(ns.codingcontract.getContractTypes())

   //let bitnode = JSON.parse(ns.read("/data/resetInfo.txt")).currentNode
   //ns.tprint(bitnode)

   //ns.exec("hackingFunctions/share.js", "home")

   //ns.print(ns.getServerMaxMoney("n00dles"), " ", ns.getServerMaxMoney("n00dles") * calculatePercentMoneyHacked(ns, ns.getServer("n00dles"), ns.getPlayer()))


   //ns.print(getRepFromDonation(ns, 10000))

}