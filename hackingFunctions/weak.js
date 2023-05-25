

/** @param {NS} ns */
export async function main(ns) {
   if (ns.args.length == 0) {
      ns.print("Not enough args");
      return;
   }
   ns.print("Weakening " + ns.args[0]);
   await ns.weaken(ns.args[0]);
   ns.print("Done");

}