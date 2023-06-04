import { findAllServers } from "servers/findAllServers";
import { getPathToServer } from "servers/getPathToServer";
import { execSomewhere } from "servers/ramManager";
/** @param {NS} ns */
export async function backDoorAll(ns) {

   let servers = findAllServers(ns);
   servers.splice("CSEC", 1)
   servers.splice("avmnite-02h", 1)
   servers.splice("I.I.I.I", 1)
   servers.splice("run4theh111z", 1)

   servers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"].concat(servers)

   ns.singularity.connect("home")
   let previousServ = "home"


   for (let i = 0; i < servers.length; i++) {
      let serv = servers[i]

      if (!ns.getServer(serv).hasAdminRights || ((serv == "w0rld_d43m0n")) || ns.getServer(serv).backdoorInstalled || serv == "darkweb" || ns.getServer(serv).requiredHackingSkill > ns.getPlayer().skills.hacking) {
         continue
      }

      let path = getPathToServer(ns, previousServ, serv)

      for (let j = 0; j < path.length; j++) {
         ns.singularity.connect(path[j])
      }


      await ns.singularity.installBackdoor()

      //execSomewhere(ns, "/servers/backDoorerWorker.js")
      //await ns.sleep(10)

      previousServ = serv

   }

   ns.singularity.connect("home")

}


/** @param {NS} ns */
export async function main(ns) {
   ns.disableLog("scan")
   ns.disableLog("getServerUsedRam")
   ns.disableLog("getServerMaxRam")
   ns.disableLog("getServerMaxRam")

   try {
      await backDoorAll(ns)
   } catch {

   }
}