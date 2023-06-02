

/** @param {NS} ns */
export async function main(ns) {
   if (ns.args.length < 3) {
      ns.print("Not enough args");
      return;
   }

   let workTypes = ns.args[1]

   for (let i = 0; i < workTypes.length; i++) {

      ns.singularity.workForFaction(ns.args[0], workTypes[i], ns.args[2])
   }
}