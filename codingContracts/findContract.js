import { CodingContract } from "codingContracts/CodingContract";
import { findAllServers } from "servers/findAllServers";



/**
 * Description
 * @param {NS} ns
 * @returns {CodingContract[]}
 */
export function findContracts(ns) {
   let servers = findAllServers(ns);

   let out = []

   for (let i = 0; i < servers.length; i++) {
      let server = servers[i]
      let files = ns.ls(server)

      for (let j = 0; j < files.length; j++) {
         let file = files[j]
         if (file.endsWith(".cct")) {
            out.push(new CodingContract(ns, server, file))
         }
      }
   }
   return out

}


/** @param {NS} ns */
export async function main(ns) {
   ns.clearLog()
   ns.tail()
   let contracts = findContracts(ns)

   let str = "\n"

   for (let i = 0; i < contracts.length; i++) {
      str += contracts[i].toString() + "\n"
   }
   ns.print(str)
}