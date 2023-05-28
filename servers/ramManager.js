
import { findAllRootServers, findAllServers } from "servers/findAllServers"

/** @param {NS} ns */
export function getTotalRam(ns) {
   let servers = findAllRootServers(ns);
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
   let servers = findAllRootServers(ns);
   let totalRam = 0;

   for (let i = 0; i < servers.length; i++) {
      let serv = servers[i]
      if (ns.hasRootAccess(serv)) {
         totalRam += ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);
      }
   }
   return totalRam;
}


/**
 * Exec a script somewhere. Return the ammount of threads not done.
 * @param {NS} ns
 * @param {string} script
 * @param {number} threads
 * @param {any} ...args
 * @returns {number}
 */
export function execSomewhere(ns, script, threads, ...args) {
   let servers = findAllRootServers(ns);

   servers = servers.filter(el => el != "home")
   servers.push("home");


   let scriptRam = ns.getScriptRam(script)

   if (threads == 0) {
      return 0
   }

   for (let i = 0; i < servers.length; i++) {

      let serv = servers[i]

      if (!ns.hasRootAccess(serv)) {
         continue
      }


      let ramAvailable = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);


      let threadRoom = Math.min(threads, Math.floor(ramAvailable / scriptRam));


      if (threadRoom > 0) {
         if (ns.exec(script, serv, threadRoom, ...args) > 0) {
            threads -= threadRoom;
         }
      }

      if (threads == 0) {
         return 0;
      }


   }

   return threads;
}

/** @param {NS} ns */
export function getMaximumInstanceOfScript(ns, script, ignoreCurrentUsage = false) {
   let servers = findAllRootServers(ns)
   let scriptRam = ns.getScriptRam(script)
   let instances = 0;


   for (let i = 0; i < servers.length; i++) {

      let serv = servers[i]

      if (!ns.hasRootAccess(serv)) {
         continue
      }

      let ramAvailable = ns.getServerMaxRam(serv);
      if (!ignoreCurrentUsage) {
         ramAvailable -= ns.getServerUsedRam(serv)
      }
      /*
            if (serv == "home") {
               ramAvailable -= 8;
            }
      */
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