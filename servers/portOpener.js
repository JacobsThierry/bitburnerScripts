
import { findAllServers } from "servers/findAllServers"
/** @param {NS} ns */
export function openPortsOnServer(ns, server) {

   if (ns.fileExists("brutessh.exe")) {
      ns.brutessh(server);
   }

   if (ns.fileExists("ftpcrack.exe")) {
      ns.ftpcrack(server);
   }

   if (ns.fileExists("relaysmtp.exe")) {
      ns.relaysmtp(server);
   }

   if (ns.fileExists("httpworm.exe")) {
      ns.httpworm(server);
   }

   if (ns.fileExists("sqlinject.exe")) {
      ns.sqlinject(server);
   }

   try {
      ns.nuke(server)
   } catch {
      pass
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