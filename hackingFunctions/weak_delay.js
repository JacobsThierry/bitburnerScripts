

/** @param {NS} ns */
export async function main(ns) {
   if (ns.args.length < 2) {
      ns.print("Not enough args");
      return;
   }
   await ns.sleep(ns.args[1])
   ns.print("Weakening " + ns.args[0]);
   await ns.grow(ns.args[0]);
   ns.print("Done");

}