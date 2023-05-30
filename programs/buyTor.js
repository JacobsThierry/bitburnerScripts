import { CONSTANTS } from "Formulas/constant";


/** @param {NS} ns */
export async function main(ns) {
   if (ns.getServerMoneyAvailable("home") > CONSTANTS.TorRouterCost) {
      ns.singularity.purchaseTor()
      ns.singularity.purchaseProgram("BruteSSH.exe")
      ns.singularity.purchaseProgram("FTPCrack.exe")
      ns.singularity.purchaseProgram("relaySMTP.exe")
      ns.singularity.purchaseProgram("HTTPWorm.exe")
      ns.singularity.purchaseProgram("SQLInject.exe")
   }

}