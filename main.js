
import { Batcher } from "batching/Batch";
import { findAllRootServers } from "servers/findAllServers"
import { execSomewhere, getMaximumInstanceOfScript } from "servers/ramManager"
import { serverManagerLoop } from "servers/serverManager"
import { optimizeBatch, findBestServers, isMaxed } from "batching/batchOptimizer"
import { resetServer } from "hackingFunctions/resetServer"
import { calculateWeakenTime } from "Formulas/calculateWeakenTime"

import { openAllPorts } from "servers/portOpener"
import { BatcherManager } from "batching/batcherManager"

import { Chart } from "asciiCharts/chart";
import { Serie } from "asciiCharts/serie";

/** @param {NS} ns */
export async function main(ns) {

   ns.disableLog("ALL");

   ns.disableLog("sleep")
   ns.disableLog("scan")
   ns.disableLog("getServerMaxRam")
   ns.disableLog("getServerUsedRam")

   ns.enableLog("exec")
   //ns.enableLog("exec")

   ns.tail();

   openAllPorts(ns);


   ns.print("Done")

   ns.print("Trying to exec copy hacking")
   while (execSomewhere(ns, "servers/copyHacking.js", 1) != 0) {
      await ns.sleep(100)
   }

   while (execSomewhere(ns, "resets/writeResetInfo.js", 1) != 0) {
      await ns.sleep(100)
   }

   ns.print("Done")


   ns.print("Servers : ", findAllRootServers(ns));
   let maxInstance = getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js")
   ns.print("max instance = " + maxInstance);





   /*let bestServers = findBestServers(ns);

   
   ns.print(b.toString())

   
*/




   let manager = new BatcherManager(ns)

   //Forcing the n00dle
   let b = new Batcher(ns, "n00dles", 0.5, 200);
   b = optimizeBatch(ns, b);
   manager.batchers.push(b);


   let chart = new Chart()

   let mockSerie = new Serie()
   chart.addSerie(mockSerie)

   chart.cfg.min = 0
   chart.cfg.max = 6000
   chart.cfg.height = 10

   chart.cfg.colors = [Chart.red, Chart.magenta]


   let clock = 0;
   //todo : split ça dans des fonctions
   while (true) {
      if (clock == 0) {
         openAllPorts(ns);
         serverManagerLoop(ns);
      }

      manager.loop()

      //display(ns, manager)

      ns.clearLog()

      mockSerie.addValue(clock)

      let str = ""
      str += mockSerie.data

      str += "\n"
      str += (chart.plot(150))
      ns.print(str)




      clock = (clock + 1) % 6000
      await ns.sleep(10);
   }
}



/**
 * Description
 * @param {NS} ns
 * @param {BatcherManager} manager
 * @returns {any}
 */
function display(ns, manager) {
   let str = "\n"
   for (let i = 0; i < manager.batchers.length; i++) {
      str += (manager.batchers[i].toString())
   }

   str += "\n=============================================";
   str += "\nMax thread : " + getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js", true)
   str += "\nThreads available : " + manager.getTotalThreadsAvailable();

   ns.clearLog()
   ns.print(str)

}

