

/** @param {NS} ns */
export async function main(ns) {
   if (ns.args.length == 0) {
      ns.print("Not enough args");
      return;
   }

   ns.singularity.joinFaction(ns.args[0])
}