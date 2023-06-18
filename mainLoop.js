
import { Batcher } from "batching/Batch";

import { execSomewhere, getMaximumInstanceOfScript } from "servers/ramManager"
import { serverManagerLoop } from "servers/serverManager"
import { optimizeBatch, findBestServers, isMaxed } from "batching/batchOptimizer"


import { openAllPorts } from "servers/portOpener"
import { BatcherManager } from "batching/batcherManager"
import { serverResetter } from "hackingFunctions/serverResetter";


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
         execSomewhere(this.ns, "codingContracts/solveContracts.js")

      }

      if (this.clock == 20) {
         if (this.ns.getServerMoneyAvailable("home") > (((this.ns.getPlayer().city == "Aevum") ? 0 : 200000) + 5e3) && this.ns.getServerMoneyAvailable("home") < 20e9) {
            //execSomewhere(this.ns, "exploits/casino/roulette/roulette.js")

            if (this.ns.read("/data/casino/kickedFromRoulette.txt") == "false") {
               this.ns.exec("exploits/casino/roulette/roulette.js", "home")
               this.clock = 401 //skip the part that can unfocus the casino. Next clock is bigger so that we have time to make some money
            }
            /*
                        if (this.ns.getServerMoneyAvailable("home") < 5e6) {
                           execSomewhere(this.ns, "exploits/casino/coinFlip/coinFlip.js")
                           this.clock = 401
                        }
            */
         }
      }


      //The compagny manager can cancel the faction work and the programs can cancel the compagny manager   
      if (this.clock == 100) {
         this.ns.exec("factions/factionManager.js", "home")
      }

      if (this.clock == 250) {
         execSomewhere(this.ns, "servers/backDoorer.js")
      }

      if (this.clock == 300) {
         this.ns.exec("factions/compagny/compagnyManager.js", "home")
      }

      if (this.clock == 350) {
         this.ns.exec("/programs/buyTor.js", "home")
      }

      if (this.clock == 400) {
         serverManagerLoop(this.ns);
      }

      if (this.clock == 4500) {
         this.writeRevenues()
      }


      this.manager.loop()
      try {
         display(this.ns, this.manager)
      } catch { }
      //10000 =~ 1m 10s
      this.clock = (this.clock + 1) % 10000
   }

}

/** @param {NS} ns */
export async function main(ns) {

   ns.tail()


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
   /*
┌───────────────────┬───────────────────┐
│  sigma-cosmetics  │ sigma-cosmetics   │
├───────────────────┼───────────────────┤
│ T0 = 0.xxx        │T0 = 0.xxx         │
│ Percent = 0.xx    │Percent = 0.xx     │
│ Depth   = xxx     │Depth   = xxx      │
│ State   = x/5     │State   = x/5      │
│ cur depth/threads │cur depth/threads  │
│                   │                   │
│ Rev     = xxx     │Rev     = xxx      │
│ Threads = xxxxx   │Threads = xxxxx    │
└───────────────────┴───────────────────┘
   */

   let str = "\n"
   let tableWidth = 19
   let lines = []



   for (let i = 0; i < manager.batchers.length; i++) {

      let tab = []
      let b = manager.batchers[i]

      tab.push(b.server)
      tab.push("T0 = " + parseFloat(b.t0.toFixed(3)))
      tab.push("Percent = " + parseFloat(b.percentStolen.toFixed(3)))
      tab.push("Depth = " + b.getDepth())
      tab.push(("State = " + (b.serverResetter.isDone() ? "Started" : (b.serverResetter.state + "/4"))))

      if (b.serverResetter.isDone()) {
         tab.push("Curr depth = " + b.batches.length)
      } else {
         if (b.serverResetter.state == 4) {
            let t = b.serverResetter.waitTime
            let seconds = t / 1000;
            let minutes = parseInt(seconds / 60);
            seconds = seconds % 60;

            //tab.push("T rem = " + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0'))
            tab.push("")
         } else {
            tab.push("T rem = " + (Math.max(0, b.serverResetter.gthread) + Math.max(0, b.serverResetter.weakenThread)))
         }
      }

      tab.push("Rev = " + ns.formatNumber(b.getRevenues()))
      tab.push("Threads = " + b.threadsCount())

      lines.push(tab)

      if (lines.length == 2) {
         str += "┌───────────────────┬───────────────────┐\n"
         str += "│" + lines[0][0] + " ".repeat(tableWidth - lines[0][0].length) + "│" + lines[1][0] + " ".repeat(tableWidth - lines[1][0].length) + "│\n"
         str += "├───────────────────┼───────────────────┤\n"

         for (let i = 1; i < lines[0].length; i++) {
            str += "│" + lines[0][i] + " ".repeat(tableWidth - lines[0][i].length) + "│" + lines[1][i] + " ".repeat(tableWidth - lines[1][i].length) + "│\n"
         }

         str += "└───────────────────┴───────────────────┘\n"
         lines = []
      }
   }

   if (lines.length == 1) {
      str += "┌───────────────────┐\n"
      str += "│" + lines[0][0] + " ".repeat(tableWidth - lines[0][0].length) + "│\n"
      str += "├───────────────────┤\n"

      for (let i = 1; i < lines[0].length; i++) {
         str += "│" + lines[0][i] + " ".repeat(tableWidth - lines[0][i].length) + "│\n"
      }
      str += "└───────────────────┘\n"

   }

   ns.clearLog()

   str += "\n=============================================";
   str += "\nMax thread : " + getMaximumInstanceOfScript(ns, "/hackingFunctions/grow_delay.js", true)
   str += "\nThreads available : " + manager.getTotalThreadsAvailable();
   ns.print(str)


}

