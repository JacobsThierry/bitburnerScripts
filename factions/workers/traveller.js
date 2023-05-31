

/** @param {NS} ns */
export async function main(ns) {
   if (ns.args.length == 0) {
      ns.print("Not enough args");
      return;
   }


   ns.singularity.travelToCity(ns.args[0])
}