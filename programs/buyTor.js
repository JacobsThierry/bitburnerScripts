import { CONSTANTS } from "Formulas/constant";

function canWork(ns) {

   let factionsToWorkFor = null

   try {
      factionsToWorkFor = JSON.parse(ns.read("/data/joinedFactionsWithoutFavor.txt"))
   } catch {
      factionsToWorkFor = []
   }

   return factionsToWorkFor.length == 0
}


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


   //if (canWork(ns)) {
   if (ns.singularity.createProgram("BruteSSH.exe")) return
   if (ns.singularity.createProgram("FTPCrack.exe")) return
   if (ns.singularity.createProgram("relaySMTP.exe")) return
   if (ns.singularity.createProgram("HTTPWorm.exe")) return
   if (ns.singularity.createProgram("SQLInject.exe")) return
   //}

}