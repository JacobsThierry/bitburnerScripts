
import { Batcher } from "batching/Batch";

import { execSomewhere, getMaximumInstanceOfScript } from "servers/ramManager"
import { serverManagerLoop } from "servers/serverManager"
import { optimizeBatch, findBestServers, isMaxed } from "batching/batchOptimizer"


import { openAllPorts } from "servers/portOpener"
import { BatcherManager } from "batching/batcherManager"


export class Main {

   /** @type {Main} */
   static instance

   /**
    * Description
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns) {

      Main.instance = this

      this.ns = ns

      ns.disableLog("ALL");
      //ns.enableLog("exec")
      ns.tail();
      openAllPorts(ns);

      this.manager = new BatcherManager(ns)
      this.writeRevenues()

      //Forcing the n00dle
      let b = new Batcher(ns, "n00dles", 0.5, 200);
      b = optimizeBatch(ns, b);
      this.manager.batchers.push(b);

      this.clock = 0

   }

   writeRevenues() {
      let revenues = Math.floor(this.manager.getRevenues())
      if (revenues != 0) {
         this.ns.write("/data/hackRevenues.txt", revenues, "w")
      }
   }

   loop() {

      if (this.clock == 0) {
         openAllPorts(this.ns);
         serverManagerLoop(this.ns);
         execSomewhere(this.ns, "codingContracts/solveContracts.js")

      }

      //The compagny manager can cancel the faction work and the programs can cancel the compagny manager   
      if (this.clock == 50) {
         this.ns.exec("factions/factionManager.js", "home")
      }
      if (this.clock == 100) {
         this.ns.exec("factions/compagny/compagnyManager.js", "home")
      }
      if (this.clock == 200) {
         this.ns.exec("/programs/buyTor.js", "home")
      }

      if (this.clock == 250) {
         execSomewhere(this.ns, "servers/backDoorer.js")
      }





      if (this.clock == 900) {
         this.writeRevenues()
      }


      this.manager.loop()
      display(this.ns, this.manager)

      //10000 =~ 1m 10s
      this.clock = (this.clock + 1) % 5000
   }

}

/** @param {NS} ns */
export async function main(ns) {

   let m = new Main(ns)
   while (true) {

      m.loop()
      await ns.sleep(1);
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

