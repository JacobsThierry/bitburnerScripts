

/** @param {NS} ns */
export async function main(ns) {

   ns.print("Trying to exec copy hacking")
   let maxTry = 500

   while (ns.exec("servers/copyHacking.js", "home") == 0 && maxTry-- > 0) {
      await ns.sleep(100)
   }

   ns.print("Done")

   maxTry = 500


   while (ns.exec("resets/writeResetInfo.js", "home") == 0 && maxTry-- > 0) {
      await ns.sleep(100)
   }

   maxTry = 500
   while (ns.exec("factions/workers/getAugsFromFaction.js", "home") == 0 && maxTry-- > 0) {
      await ns.sleep(100)
   }

   maxTry = 500
   while (ns.exec("factions/workers/getAugmentationRepReq.js", "home") == 0 && maxTry-- > 0) {
      await ns.sleep(100)
   }


   if (ns.exec("mainLoop.js", "home") != 0) {
      return
   } else {
      ns.spawn("mainLoop.js")
   }

}