
import { Batcher } from "batching/Batch";
import { getMaximumInstanceOfScript } from "servers/ramManager"
import { findAllRootServers } from "servers/findAllServers"
import { execSomewhere } from "servers/ramManager"
import { serverManagerLoop } from "servers/serverManager"

import { optimizeBatch } from "batching/batchStarter"

import { resetServer } from "hackingFunctions/resetServer"

import { calculateWeakenTime } from "Formulas/calculateWeakenTime"

/** @param {NS} ns */
export async function main(ns) {

   ns.disableLog("ALL");
   ns.tail();

   ns.print("Trying to exec port opener")
   while (execSomewhere(ns, "servers/portOpener.js", 1) != 0) {
      await ns.sleep(100)
   }
   ns.print("Done")

   ns.print("Trying to exec copy hacking")
   while (execSomewhere(ns, "servers/copyHacking.js", 1) != 0) {
      await ns.sleep(100)
   }

   ns.print("Done")






   ns.print("Servers : ", findAllRootServers(ns));
   let maxInstance = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js")
   ns.print("max instance = " + maxInstance);

   let t0 = 855;
   let b = new Batcher(ns, "n00dles", 0.03, t0);

   b = optimizeBatch(ns, b);

   t0 = b.t0;


   ns.print(b.toString());

   //return true;

   let didSomething = await resetServer(ns, b.server);
   if (didSomething) {
      let sleeptime = calculateWeakenTime(ns.getServer(b.server), ns.getPlayer())
      ns.print("Waiting for the weakens to end (", ns.tFormat(sleeptime), ")");
      await ns.sleep(sleeptime)
   }



   while (true) {
      await serverManagerLoop(ns);
      b.loop(ns);
      await ns.sleep(t0);
   }


}