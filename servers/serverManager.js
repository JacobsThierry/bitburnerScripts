import { execSomewhere } from "servers/ramManager"

let prefix = "pserv-"

/**
 * Description
 * @param {NS} ns
 * @param {number} ram
 * @param {number} id
 * @returns {any}
 */
function buyServer(ns, ram, id) {
   let serverName = prefix + id;

   execSomewhere(ns, "/servers/purchaseServer.js", 1, serverName, ram);

}



/** @param {NS} ns */
function getServers(ns) {
   let serv = ns.scan("home");
   serv = serv.filter(s => (s.startsWith("pserv")))
   return serv;
}

/** @param {NS} ns */
export async function serverManagerLoop(ns) {

   let maxServers = ns.getPurchasedServerLimit();
   let maxRam = ns.getPurchasedServerMaxRam()

   let servers = getServers(ns);


   if (servers.length < maxServers) {

      for (let i = servers.length; i < maxServers; i++) {
         buyServer(ns, 8, i);
      }

      while (!execSomewhere(ns, "servers/copyHacking.js", 1) != 0) {
         await ns.sleep(100)
      }

   }

   servers = getServers(ns);


   for (let ram = maxRam; ram > 8; ram = ram / 2) {


      for (let i = 0; i < servers.length; i++) {
         let money = ns.getServerMoneyAvailable("home");
         let serv = prefix + i;

         if (ns.getPurchasedServerUpgradeCost(serv, ram) < money) {
            ns.upgradePurchasedServer(serv, ram);
         }

      }


   }


}


/** @param {NS} ns */
export async function main(ns) {
}