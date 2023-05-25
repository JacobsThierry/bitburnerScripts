

/** @param {NS} ns */
export async function main(ns) {
   if (ns.args.length == 0) {
      ns.print("Not enough args");
      return;
   }
   ns.print("Growing " + ns.args[0]);
   await ns.grow(ns.args[0]);
   ns.print("Done");

}