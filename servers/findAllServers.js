/**
 * Description
 * @param {NS} ns
 * @returns {string[]}
 */
export function findAllServers(ns) {
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

   return servers
}


/**
 * Description
 * @param {NS} ns
 * @returns {string[]}
 */
export function findAllRootServers(ns) {
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