

/** @param {NS} ns */
export async function main(ns) {
   ns.disableLog("ALL")
   if (ns.args.length < 2) {
      ns.print("Not enough args");
      return;
   }
   ns.print("Sleeping for ", ns.tFormat(ns.args[1], 3))
   await ns.sleep(ns.args[1])
   ns.print("Hacking " + ns.args[0]);
   ns.enableLog("ALL")
   await ns.hack(ns.args[0]);
   ns.print("Done");

   //ns.tprint("Done hacking ", ns.args[2])

}