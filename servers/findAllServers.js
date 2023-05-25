/** @param {NS} ns */
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

/** @param {NS} ns */
export async function main(ns) {
   ns.tail();
   ns.print((findAllServers(ns)));

}