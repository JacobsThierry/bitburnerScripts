
import { findAllServers } from "servers/findAllServers"
/** @param {NS} ns */
export function openPortsOnServer(ns, server) {

   if (ns.fileExists("BruteSSH.exe", "home")) {
      ns.brutessh(server);
   }

   if (ns.fileExists("FTPCrack.exe", "home")) {
      ns.ftpcrack(server);
   }

   if (ns.fileExists("relaySMTP.exe", "home")) {
      ns.relaysmtp(server);
   }

   if (ns.fileExists("HTTPWorm.exe", "home")) {
      ns.httpworm(server);
   }

   if (ns.fileExists("SQLInject.exe", "home")) {
      ns.sqlinject(server);
   }

   try {
      ns.nuke(server)
   } catch {

   }


}


/** @param {NS} ns */
export function openAllPorts(ns) {
   let servers = findAllServers(ns);

   for (var j = 0; j < servers.length; j++) {
      let serv = servers[j]
      openPortsOnServer(ns, serv);
   }
}

/** @param {NS} ns */
export function countPortOpen(ns) {

   let p = 0
   if (ns.fileExists("brutessh.exe")) {
      p++
   }
   if (ns.fileExists("ftpcrack.exe")) {
      p++
   }
   if (ns.fileExists("relaysmtp.exe")) {
      p++
   }
   if (ns.fileExists("httpworm.exe")) {
      p++
   }
   if (ns.fileExists("sqlinject.exe")) {
      p++
   }
   return p
}

/** @param {NS} ns */
export async function main(ns) {
   openAllPorts(ns);
}