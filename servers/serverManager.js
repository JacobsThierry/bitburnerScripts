import { execSomewhere } from "servers/ramManager"
import { myGetPurchaseServerCost } from "Formulas/getPurchaseServerCost"
import { myGetPurchasedServerUpgradeCost } from "Formulas/getPurchasedServerUpgradeCost"

export let pServerPrefix = "pserv-"

/**
 * Description
 * @param {NS} ns
 * @param {number} ram
 * @param {number} id
 * @returns {any}
 */
function buyServer(ns, ram, id) {
   let serverName = pServerPrefix + id;
   execSomewhere(ns, "/servers/purchaseServer.js", 1, serverName, ram);

}



/** @param {NS} ns */
export function getPlayerServers(ns) {
   let serv = ns.scan("home");
   serv = serv.filter(s => (s.startsWith("pserv")))
   return serv;
}

/** @param {NS} ns */
export function serverManagerLoop(ns) {

   let maxServers = ns.getPurchasedServerLimit();
   let maxRam = ns.getPurchasedServerMaxRam()

   let servers = getPlayerServers(ns);

   execSomewhere(ns, "/servers/singularityUpgradeServerRam.js", 1,);
   execSomewhere(ns, "/servers/singularityUpgradeServerCore.js", 1);

   if (servers.length < maxServers) {


      for (let i = servers.length; i < maxServers; i++) {
         let money = ns.getServerMoneyAvailable("home")
         if (money < myGetPurchaseServerCost(ns, 8)) {
            break;
         }

         buyServer(ns, 8, i);
         execSomewhere(ns, "servers/copyHacking.js", 1)
      }
   }

   servers = getPlayerServers(ns);
   for (let ram = maxRam; ram > 8; ram = ram / 2) {
      for (let i = 0; i < servers.length; i++) {
         let money = ns.getServerMoneyAvailable("home")
         let serv = pServerPrefix + i;

         if (myGetPurchasedServerUpgradeCost(ns, serv, ram) < money && ram > ns.getServer(serv).maxRam) {
            ns.upgradePurchasedServer(serv, ram);
            //ns.tprint("Upgraded server ", serv, " to ", ram, "GB");
         }

      }


   }


}


/** @param {NS} ns */
export async function main(ns) {
}