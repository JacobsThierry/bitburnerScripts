
import { findAllServers } from "servers/findAllServers"

/** @param {NS} ns */
export function getTotalRam(ns) {
   let servers = findAllServers(ns);
   let totalRam = 0;

   for (let i = 0; i < servers.length; i++) {
      let serv = servers[i]
      if (ns.hasRootAccess(serv)) {
         totalRam += ns.getServerMaxRam(serv)
      }
   }

   return totalRam;
}


/** @param {NS} ns */
export function getTotalRamAvailable(ns) {
   let servers = findAllServers(ns);
   let totalRam = 0;

   for (let i = 0; i < servers.length; i++) {
      let serv = servers[i]
      if (ns.hasRootAccess(serv)) {
         totalRam += ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);
      }
   }
   return totalRam;
}

/** @param {NS} ns */
export function execSomewhere(ns, script, threads, ...args) {



   let servers = findAllServers(ns);
   let scriptRam = ns.getScriptRam(script)

   for (let i = 0; i < servers.length; i++) {

      let serv = servers[i]

      if (!ns.hasRootAccess(serv)) {
         continue
      }


      let ramAvailable = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);

      if (serv == "home") {
         ramAvailable -= 2;
      }

      let threadRoom = Math.min(threads, Math.floor(ramAvailable / scriptRam));


      if (threadRoom > 0) {
         ns.exec(script, serv, threadRoom, ...args)
         threads -= threadRoom;
      }

      if (threads == 0) {
         return true;
      }


   }

   return false;
}

/** @param {NS} ns */
export function getMaximumInstanceOfScript(ns, script) {
   let servers = findAllServers(ns);
   let scriptRam = ns.getScriptRam(script)
   let instances = 0;


   for (let i = 0; i < servers.length; i++) {

      let serv = servers[i]

      if (!ns.hasRootAccess(serv)) {
         continue
      }

      let ramAvailable = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);

      if (serv == "home") {
         ramAvailable -= 8;
      }

      let threadRoom = Math.floor(ramAvailable / scriptRam);

      if (threadRoom > 0) {
         instances += threadRoom;
      }



   }

   return instances;

}


/** @param {NS} ns */
export async function main(ns) {

   ns.tail();
   ns.print(getTotalRamAvailable(ns));

}