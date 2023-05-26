import { findAllServers } from "servers/findAllServers"

/** @param {NS} ns */
export async function copyHacking(ns) {

   let servers = findAllServers(ns)

   let files = ns.ls("home", "hackingFunctions")




   for (let j = 0; j < servers.length; j++) {

      let serv = servers[j]

      if (serv == "home") { continue }

      for (let i = 0; i < files.length; i++) {
         ns.scp(files[i], serv, "home")
      }

   }
}


/** @param {NS} ns */
export async function main(ns) {
   copyHacking(ns);
}