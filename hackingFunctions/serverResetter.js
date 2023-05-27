import { getThreadsToWeaken } from "Formulas/calculateWeakenAmount"
import { calculateServerSecurityIncrease } from "Formulas/calculateServerSecurityIncrease"
import { execSomewhere } from "servers/ramManager"
import { growthAnalyzeThreads } from "Formulas/growthAnalyzeThreads"
import { calculateWeakenTime } from "Formulas/calculateWeakenTime"

export class serverResetter {

   static maxState = 4

   /**
    * Description
    * @param {NS} ns
    * @param {any} server
    * @returns {any}
    */
   constructor(ns, server, maxThreads = 99999) {
      this.ns = ns;
      this.server = server

      let serv = ns.getServer(server)
      this.weakenThread = getThreadsToWeaken(serv.hackDifficulty - serv.minDifficulty, 1);
      this.gthread = -1;

      this.state = 0

      this.weakScript = "hackingFunctions/weak.js"
      this.growScript = "hackingFunctions/grow.js"

      this.waitTime = -1

      if (serv.moneyMax == serv.moneyAvailable && serv.hackDifficulty == serv.minDifficulty) {
         this.state = 5
      }

   }

   state0() {
      this.weakenThread = execSomewhere(this.ns, this.weakScript, this.weakenThread, this.server);
      if (this.weakenThread == 0) {
         this.waitTime = Date.now() + calculateWeakenTime(this.ns.getServer(this.server), this.ns.getPlayer())
         this.state++;
      }
   }

   state1() {
      let serv = this.ns.getServer(this.server)
      let growRatio = serv.moneyMax / serv.moneyAvailable;
      this.gthread = Math.ceil(growthAnalyzeThreads(this.ns, serv, this.ns.getPlayer(), growRatio, 1));
      let growSecurityIncrase = calculateServerSecurityIncrease(this.gthread, true)
      this.weakenThread = getThreadsToWeaken(growSecurityIncrase, 1);
      this.state++;
   }

   state2() {
      this.gthread = execSomewhere(this.ns, this.growScript, this.gthread, this.server)
      if (this.gthread == 0) {
         this.state++;
      }
   }

   state4() {
      if (Date.now() > this.waitTime) {
         this.state++
      }
   }

   isDone() {
      return this.state == 5
   }


   loop() {



      //weaken 1
      if (this.state == 0) {
         this.state0()
      }

      //calculate grow and weaken 2
      if (this.state == 1) {
         this.state1()
      }

      //grow
      if (this.state == 2) {
         this.state2()
      }

      // weaken 2
      if (this.state == 3) {
         this.state0()
      }

      //Wait for everything to end
      if (this.state == 4) {
         this.state4()
      }

   }

}