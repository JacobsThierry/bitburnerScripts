

/** @param {NS} ns */
export async function main(ns) {

   if (ns.args.length < 2) {
      ns.print("not enough args")
   } else {
      let servername = ns.args[0];
      let ram = ns.args[1];

      ns.purchaseServer(servername, ram);

   }

}