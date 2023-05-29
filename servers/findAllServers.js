
let allServers = []

/**
 * Description
 * @param {NS} ns
 * @returns {string[]}
 */
export function findAllServers(ns) {
   //Find all servers is called all the time, doing this must save a lot of time
   if (allServers.length > 0) {
      return allServers
   }

   let servers = ["home"]
   let i = 0;
   while (i < servers.length) {
      let serv = servers[i];

      let childrens = ns.scan(serv);

      for (let j = 0; j < childrens.length; j++) {
         let host = childrens[j]
         if (!servers.includes(host)) {
            servers.push(host)
         }
      }
      i++;
   }

   allServers = servers;

   return servers
}

let allRootServers = []
/**
 * Description
 * @param {NS} ns
 * @returns {string[]}
 */
export function findAllRootServers(ns) {

   if (allRootServers.length > 0) {
      return allRootServers
   }

   let servers = ["home"]
   let out = ["home"]

   let i = 0;

   while (i < servers.length) {
      let serv = servers[i];

      let childrens = ns.scan(serv);

      for (let j = 0; j < childrens.length; j++) {
         let host = childrens[j]
         if (!servers.includes(host)) {
            servers.push(host)
         }

         if (!out.includes(host) && ns.hasRootAccess(host)) {
            out.push(host)
         }


      }
      i++;
   }

   allRootServers = out;

   return out


}

/** @param {NS} ns */
export async function main(ns) {
   ns.disableLog("ALL")
   ns.tail();
   ns.print("servers : ", (findAllServers(ns)));
   ns.print("")
   ns.print("")
   ns.print("root : ", (findAllRootServers(ns)));

}