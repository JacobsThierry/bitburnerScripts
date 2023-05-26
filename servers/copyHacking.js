import { findAllServers } from "servers/findAllServers"

/** @param {NS} ns */
export function copyHacking(ns) {

   let servers = findAllServers(ns)

   let files = ns.ls("home", "")




   for (let j = 0; j < servers.length; j++) {

      let serv = servers[j]

      if (serv == "home") { continue }

      for (let i = 0; i < files.length; i++) {
         let f = files[i]
         if (f.endsWith(".js")) {
            ns.scp(f, serv, "home")
         }
      }

   }
}


/** @param {NS} ns */
export async function main(ns) {
   copyHacking(ns);
}