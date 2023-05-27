import { getThreadsToWeaken } from "Formulas/calculateWeakenAmount"
import { calculateServerSecurityIncrease } from "Formulas/calculateServerSecurityIncrease"
import { execSomewhere } from "servers/ramManager"
import { growthAnalyzeThreads } from "Formulas/growthAnalyzeThreads"
import { calculateWeakenTime } from "Formulas/calculateWeakenTime"
import { calculateGrowTime } from "Formulas/calculateGrowTime"

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

      this.threadList = []
      this.maxThreads = maxThreads

      if (serv.moneyMax == serv.moneyAvailable && serv.hackDifficulty == serv.minDifficulty) {
         this.state = 5
      }
   }

   updateThreadList() {
      this.threadList = this.threadList.filter(elem => elem[1] > Date.now())
   }
   addThreadList(nbThread, threadDuration) {
      this.threadList.push([nbThread, Date.now() + threadDuration])
   }

   getThreadsAvailable() {
      this.updateThreadList()
      let currentThreads = this.threadList.reduce((accumulator, currentValue) => accumulator + currentValue[0], 0)
      let ret = this.maxThreads - currentThreads
      return ret
   }

   stateMessage() {
      if (this.state == 0) {
         return "Executing weakens 1 (" + this.weakenThread + ") threads left"
      }
      if (this.state == 1) {
         return "Calculating grow state"
      }
      if (this.state == 2) {
         return "Remove the security increase caused by the grows (" + this.weakenThread + ") threads left"
      }
      if (this.state == 3) {
         return "Executing grows (" + this.gthread + ") threads left"
      }
      if (this.state == 4) {
         return "Waiting for the weakens to end (" + this.ns.tFormat(this.waitTime - Date.now()) + " left)"
      }

      return "( ͡° ͜ʖ ͡°)"
   }

   //Weakening the base security
   state0() {

      let threadAvailable = this.getThreadsAvailable();
      let temp = Math.min(threadAvailable, this.weakenThread)

      let temp2 = execSomewhere(this.ns, this.weakScript, temp, this.server)

      let executedThreads = temp - temp2;
      this.addThreadList(executedThreads, calculateWeakenTime(this.ns.getServer(this.server), this.ns.getPlayer()))

      this.weakenThread -= executedThreads;

      if (this.weakenThread == 0) {
         this.waitTime = Math.max(Date.now() + calculateWeakenTime(this.ns.getServer(this.server), this.ns.getPlayer()), this.waitTime)
         this.state++;
      }
   }

   //Calculate the ° of grow thread needed
   state1() {
      let serv = this.ns.getServer(this.server)
      let growRatio = serv.moneyMax / serv.moneyAvailable;
      this.gthread = Math.ceil(growthAnalyzeThreads(this.ns, serv, this.ns.getPlayer(), growRatio, 1));
      this.state += 2;
   }

   //Remove the security increase caused by the grows
   state2() {

      let threadAvailable = this.getThreadsAvailable();
      let temp = Math.min(threadAvailable, this.weakenThread)
      let temp2 = execSomewhere(this.ns, this.weakScript, temp, this.server)
      let executedThreads = temp - temp2;
      this.addThreadList(executedThreads, calculateWeakenTime(this.ns.getServer(this.server), this.ns.getPlayer()))

      this.weakenThread -= executedThreads;

      if (this.weakenThread == 0) {
         this.waitTime = Math.max(Date.now() + calculateWeakenTime(this.ns.getServer(this.server), this.ns.getPlayer()), this.waitTime)
         this.state++;
      }
   }


   state3() {
      if (this.gthread == 0) {
         this.state++;
      }



      let old = this.gthread

      let threadAvailable = this.getThreadsAvailable();


      let temp = Math.min(threadAvailable, this.gthread)
      let temp2 = execSomewhere(this.ns, this.growScript, temp, this.server)
      let executedThreads = temp - temp2;

      this.addThreadList(executedThreads, calculateGrowTime(this.ns.getServer(this.server), this.ns.getPlayer()))



      this.gthread -= executedThreads;
      if (executedThreads > 0) {
         let growSecurityIncrase = calculateServerSecurityIncrease(executedThreads, true)
         this.weakenThread += getThreadsToWeaken(growSecurityIncrase, 1);
         this.state--;
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
         this.state3()
      }
      //Wait for everything to end
      if (this.state == 4) {
         this.state4()
      }
   }
}