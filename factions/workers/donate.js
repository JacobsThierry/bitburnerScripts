

/** @param {NS} ns */
export async function main(ns) {
   if (ns.args.length < 2) {
      ns.print("Not enough args");
      return;
   }

   ns.singularity.donateToFaction(ns.args[0], ns.args[1])
}