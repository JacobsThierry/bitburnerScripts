import { getThreadsToWeaken } from "Formulas/calculateWeakenAmount"
import { calculateServerSecurityIncrease } from "Formulas/calculateServerSecurityIncrease"
import { execSomewhere } from "servers/ramManager"
import { growthAnalyzeThreads } from "Formulas/growthAnalyzeThreads"

let weakScript = "hackingFunctions/weak.js"
let growScript = "hackingFunctions/grow.js"

/**
 * Description
 * @param {NS} ns
 * @param {any} server
 * @returns {any}
 */
export async function resetServer(ns, server) {
   let serv = ns.getServer(server)
   let weakenThread = getThreadsToWeaken(serv.hackDifficulty - serv.minDifficulty, 1);

   if (serv.moneyMax == serv.moneyAvailable && serv.hackDifficulty == serv.minDifficulty) {
      return false;
   }

   ns.print("Resetting server ", server)

   ns.print("Running first batch of weaken")
   do {
      weakenThread = execSomewhere(ns, weakScript, weakenThread, server);

      if (weakenThread > 0) {
         ns.print("\t", weakenThread, " threads left")
         await ns.sleep(10000);
      }


   } while (weakenThread > 0)

   ns.print("Done")

   let growRatio = serv.moneyMax / serv.moneyAvailable;

   let gthread = Math.ceil(growthAnalyzeThreads(serv, ns.getPlayer(), growRatio, 1));
   let growSecurityIncrase = calculateServerSecurityIncrease(gthread, true)

   ns.print("Running batch of grow")

   do {
      gthread = execSomewhere(ns, growScript, gthread, server)
      if (gthread > 0) {
         ns.print("\t", gthread, " threads left")
         await ns.sleep(10000);
      }




   } while (gthread > 0)

   ns.print("Done")

   weakenThread = getThreadsToWeaken(growSecurityIncrase, 1);

   ns.print("Running second batch of weaken")

   do {
      weakenThread = execSomewhere(ns, weakScript, weakenThread, server);
      if (weakenThread > 0) {
         ns.print("\t", weakenThread, " threads left")
         await ns.sleep(10000);
      }

   } while (weakenThread > 0)

   ns.print("Done")

   ns.print("Done resetting the server")

   return true
}


/** @param {NS} ns */
export async function main(ns) {



   /*
   gt = growthAnalyzeThreads(serv, this.ns.getPlayer(), 1 / (1 - this.percentStolen), 1)
   gt = Math.ceil(gt)
   let growSecurityIncrase = calculateServerSecurityIncrease(gt, true)
*/
}