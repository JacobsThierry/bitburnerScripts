import { calculateHackingTime } from "Formulas/calculateHackingTime"
import { calculateGrowTime } from "Formulas/calculateGrowTime"
import { calculateWeakenTime } from "Formulas/calculateWeakenTime"
import { execSomewhere } from "servers/ramManager"
import { calculateServerSecurityIncrease } from "Formulas/calculateServerSecurityIncrease"
import { hackAnalyzeThreads as hackAnalThreads } from "Formulas/hackAnalyzeThreads"
import { growthAnalyzeThreads } from "Formulas/growthAnalyzeThreads"
import { getThreadsToWeaken } from "Formulas/calculateWeakenAmount"

import { serverResetter } from "hackingFunctions/serverResetter"
import { calculatePercentMoneyHacked } from "Formulas/calculatePercentMoneyHacked"
import { calculateHackingChance } from "Formulas/calculateHackingChance"
import { resetServer } from "hackingFunctions/resetServer"

export class Batch {


   /**
    * Description
    * @param {NS} ns
    * @param {any} server
    * @param {any} hdelay
    * @param {any} w1delay
    * @param {any} gdelay
    * @param {any} w2delay
    * @param {any} t0
    * @param {any} hthread
    * @param {any} w1thread
    * @param {any} gthread
    * @param {any} w2thread
    * @param {any} hackScript
    * @param {any} growScript
    * @param {any} weakScript
    * @param {any} id
    * @returns {any}
    */
   constructor(ns, server, hdelay, w1delay, gdelay, w2delay, t0, hthread, w1thread, gthread, w2thread, hackScript, growScript, weakScript, hacktime, id) {

      this.ns = ns;
      this.server = server;

      this.hdelay = hdelay;
      this.w1delay = w1delay;
      this.gdelay = gdelay;
      this.w2delay = w2delay

      this.t0 = t0;

      this.hthread = hthread;
      this.w1thread = w1thread;
      this.gthread = gthread;
      this.w2thread = w2thread;

      this.hackScript = hackScript
      this.growScript = growScript
      this.weakScript = weakScript

      //this.ns.tprint("Delays = ", this.ns.tFormat(hdelay), " ", this.ns.tFormat(w1delay), " ", this.ns.tFormat(gdelay), " ", this.ns.tFormat(w2delay))


      this.id = id;
      this.hackStarted = false
      this.weak1Started = false
      this.growStarted = false
      this.weak2Started = false

      this.startTime = Date.now();
      this.done = false;
      this.dieTime = -1
      this.hacktime = hacktime
   }

   selfDestroy() {
      this.done = true;
      this.hackStarted = true;
      this.growStarted = true;
      this.hdelay = 9999999;
      this.gdelay = 9999999;
      this.dieTime = Date.now()
   }

   //Ammout of threads currently running
   threadsRunning() {
      let hacktime = this.startTime + this.hdelay;
      let weaken1time = this.startTime + this.w1delay;
      let growTime = this.startTime + this.gdelay;
      let weaken2time = this.startTime + this.w2delay

      let serv = this.ns.getServer(this.server)
      serv.hackDifficulty = serv.minDifficulty
      let p = this.ns.getPlayer()

      let tot = 0

      if (this.hackStarted && ((hacktime + calculateHackingTime(serv, p)) > Date.now())) {
         tot += this.hthread
      }


      if (this.weak1Started && ((weaken1time + calculateWeakenTime(serv, p)) > Date.now())) {

         tot += this.w1thread
      }

      if (this.growStarted && ((growTime + calculateGrowTime(serv, p)) > Date.now())) {
         tot += this.gthread
      }

      if (this.weak2Started && ((weaken2time + calculateWeakenTime(serv, p)) > Date.now())) {
         tot += this.w2thread
      }

      return tot;
   }

   update() {
      let hacktime = this.startTime + this.hdelay;
      let hacktimeRemaining = hacktime - Date.now();


      if ((!this.hackStarted) && (hacktimeRemaining < this.t0)) {

         let hackok = execSomewhere(this.ns, this.hackScript, this.hthread, this.server, hacktimeRemaining, this.id);
         if (hackok == 0) {
            this.ns.print("All hack threads with the id ", this.id, " have been started")
         } else {
            //this.ns.tprint("Not all hack threads with the id ", this.id, " have been started")
         }
         this.dieTime = Date.now() + this.hacktime;
         this.hackStarted = true
      }


      let weaken1time = this.startTime + this.w1delay;
      let weaktimeRemaining = weaken1time - Date.now();

      if (!this.weak1Started && weaktimeRemaining < this.t0) {
         let w1ok = execSomewhere(this.ns, this.weakScript, this.w1thread, this.server, weaktimeRemaining, this.id);

         //In case the game freez and the weak is too late
         if (weaktimeRemaining < -this.t0) {
            this.selfDestroy()
            // this.ns.tprint("Canceled batch ", this.id, " because it is late")
         }

         if (w1ok == 0) {
            this.ns.print("All weaken 1 threads with the id ", this.id, " have been started")



         } else {
            //this.ns.tprint("Not all weaken 1 threads with the id ", this.id, " have been started")
            this.selfDestroy()
         }

         this.weak1Started = true
      }

      let growTime = this.startTime + this.gdelay;
      let growtimeRemaining = growTime - Date.now();

      if (!this.growStarted && growtimeRemaining < this.t0) {
         let gok = execSomewhere(this.ns, this.growScript, this.gthread, this.server, growtimeRemaining, this.id);

         if (gok == 0) {
            this.ns.print("All grow threads with the id ", this.id, " have been started")
         } else {
            //this.ns.tprint("Not all grow threads with the id ", this.id, " have been started")
         }
         this.growStarted = true;
      }

      let weaken2time = this.startTime + this.w2delay
      let weaktime2Remaining = weaken2time - Date.now();

      if (!this.weak2Started && weaktime2Remaining < this.t0) {

         //In case the game freez and the weak is too late
         if (weaktime2Remaining < -this.t0) {
            this.selfDestroy()
            // this.ns.tprint("Canceled batch ", this.id, " because it is late")
         }

         let w2ok = execSomewhere(this.ns, this.weakScript, this.w2thread, this.server, weaktime2Remaining, this.id);
         if (w2ok == 0) {
            this.ns.print("All weaken 2 threads with the id ", this.id, " have been started")
         } else {
            //this.ns.tprint("Not all weaken 2 threads with the id ", this.id, " have been started")
            this.selfDestroy()
         }

         this.weak2Started = true;

      }

      if (this.hackStarted && this.weak1Started && this.growStarted && this.weak2Started && Date.now() > this.dieTime) {
         this.done = true;
      }
   }

}

export class Batcher {
   /**
    * Description
    * @param {any} server
    * @param {any} t0
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns, server, percentStolen = 0.5, t0 = 1000, max_depth = 9999) {
      this.server = server
      this.t0 = t0
      this.ns = ns
      this.max_depth = max_depth
      this.percentStolen = percentStolen;

      this.id = 0
      /** @type {Batch[]} */
      this.batches = []
      this.lastStart = 0;

      this.serverResetter = new serverResetter(ns, server, this.trueThreadsCount())

   }

   toString() {
      let out = "\n======================================\n"
      out += "Server = " + this.server + "\n"
      out += "T0 = " + this.ns.tFormat(this.t0, 3) + "\n"
      out += "Max depth = " + this.max_depth + "\n"
      out += "Percent stolent = " + this.percentStolen + "\n"



      let { depth, period } = this.getDepthAndPeriod();

      if (period != undefined) {

         out += "Depth = " + depth + " ; Period = " + this.ns.tFormat(period, 3) + "\n"
      }

      out += "Started : " + this.serverResetter.isDone()

      if (!this.serverResetter.isDone()) {
         out += " (state " + this.serverResetter.state + "/" + serverResetter.maxState + " - " + this.serverResetter.stateMessage() + ")"
      }

      out += "\n\n"

      out += "Current depth* = " + this.batches.length + "\n"

      let serv = this.ns.getServer(this.server);
      serv.hackDifficulty = serv.minDifficulty //this.ns.getServerMinSecurityLevel(this.server)

      out += "\nTimes : \n"
      let { weak_time, grow_time, hack_time } = this.times()
      out += "\t Hacking time = " + this.ns.tFormat(hack_time, 5) + "\n"
      out += "\t Grow time = " + this.ns.tFormat(grow_time, 5) + "\n"
      out += "\t Weaken time = " + this.ns.tFormat(weak_time, 5) + "\n"

      out += "\n"
      let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();
      out += "Threads per cycles : \n"
      out += "\t Hack thread : " + ht + "\n"
      out += "\t Weaken 1 thread : " + wt1 + "\n"
      out += "\t Grow thread : " + gt + "\n"
      out += "\t Weaken 2 thread : " + wt2 + "\n"
      out += "\t total : " + (ht + wt1 + gt + wt2) + "\n"


      out += "\n"
      let rev = this.getRevenues()
      if (rev == NaN) {
         rev = 0
      }
      try {
         out += "Estimated revenues per sec : " + this.ns.formatNumber(rev) + "\n";

      } catch {
         out += "Estimated revenues per sec : " + this.ns.formatNumber(0) + "\n";

      }

      out += "Ram per cycle : " + this.ns.formatRam(this.getCycleRamCost()) + "\n";

      try {
         out += "Total ram cost : " + this.ns.formatRam(this.getTotalRamCost()) + "\n";
      } catch {
         out += "Total ram cost : " + this.ns.formatRam(0) + "\n";
      }
      out += "Total thread count : " + ((ht + wt1 + gt + wt2) * depth) + "\n"



      return out

   }

   /**
    * Sum of all the threads used by the script
    * @returns {number}
    */
   threadsCount() {
      let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();
      let { depth, period } = this.getDepthAndPeriod();
      return ((ht + wt1 + gt + wt2) * depth)
   }

   /**
    * Sum of all the threads used concurrently by the script
    * Not perfect : the margin of error is +10%. The value returned is never less than the true total thread count
    * @returns {number}
    */
   trueThreadsCount() {

      let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();
      let serv = this.ns.getServer(this.server)
      serv.hackDifficulty = serv.minDifficulty

      let p = this.ns.getPlayer()

      let totalThread = this.threadsCount()

      //ammount of time per batch without hacking 
      let timeWithoutHack = calculateWeakenTime(serv, p) - calculateHackingTime(serv, p)

      //number of period without hacking per batch
      let periodWithoutHack = timeWithoutHack / this.getPeriod()

      //this.ns.tprint("Period without hack : ", periodWithoutHack)

      //same for grow
      let timeWithoutGrow = calculateWeakenTime(serv, p) - calculateGrowTime(serv, p)
      let periodWithoutGrow = timeWithoutGrow / this.getPeriod()

      let res = Math.ceil(totalThread - (periodWithoutHack * ht - periodWithoutGrow * gt))

      if (!isNaN(res) && !(res == undefined)) {
         return res
      } else {
         return this.threadsCount()
      }
   }

   compareTrueThreadCount() {

      if (this.batches.length == this.getDepth()) {

         let threadRunning = this.batches.reduce((acc, current) => acc + current.threadsRunning(), 0)

         let calculatedValue = this.trueThreadCount()
         this.ns.tprint("Thread running = ", threadRunning, " calculated value = ", calculatedValue, ". Diff = ", calculatedValue - threadRunning)
      }
   }

   /**
    * return the estimated money/sec of the batcher
    * @returns {number}
    */
   getRevenues() {

      let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();

      if (ht == 0) {
         return 0
      }

      let { depth, period } = this.getDepthAndPeriod();
      let serv = this.ns.getServer(this.server)
      serv.moneyAvailable = serv.moneyMax
      serv.hackDifficulty = serv.minDifficulty

      if (serv.requiredHackingSkill > this.ns.getPlayer().skills.hacking) {
         return 0
      }

      let moneyPerPeriod = Math.min(Math.floor(serv.moneyMax * calculatePercentMoneyHacked(this.ns, serv, this.ns.getPlayer()) * ht), serv.moneyMax)

      let periodSec = (period) * 0.001;
      let moneyPerSec = moneyPerPeriod / periodSec;

      moneyPerSec = moneyPerSec * calculateHackingChance(serv, this.ns.getPlayer())

      return moneyPerSec;

   }

   /**
    * return the weak time, grow time and hack time of the server if the security is at the minimum
    * @returns {number, number, number}
    */
   times() {

      let serv = this.ns.getServer(this.server);
      serv.hackDifficulty = serv.minDifficulty //this.ns.getServerMinSecurityLevel(this.server)

      let weak_time = calculateWeakenTime(serv, this.ns.getPlayer());
      let grow_time = calculateGrowTime(serv, this.ns.getPlayer());
      let hack_time = calculateHackingTime(serv, this.ns.getPlayer());

      return { weak_time, grow_time, hack_time }
   }

   getDepth() {
      let { depth, period } = this.getDepthAndPeriod();
      return depth
   }

   getPeriod() {
      let { depth, period } = this.getDepthAndPeriod();
      return period
   }

   /**
    * return the depth and the period of the batch
    * @returns {number, number}
    */
   getDepthAndPeriod() {

      let { weak_time, grow_time, hack_time } = this.times()

      let t0 = this.t0;


      //from stalefish on discord
      let period, depth;
      const kW_max = Math.min(Math.ceil(weak_time / (4 * this.t0)), this.max_depth);
      schedule: for (let kW = kW_max; kW >= 1; --kW) {
         const t_min_W = (weak_time + 4 * t0) / kW;
         const t_max_W = (weak_time - 4 * t0) / (kW - 1);
         const kG_min = Math.ceil(Math.max((kW - 1) * 0.8, 1));
         const kG_max = Math.floor(1 + kW * 0.8);
         for (let kG = kG_max; kG >= kG_min; --kG) {
            const t_min_G = (grow_time + 3 * t0) / kG
            const t_max_G = (grow_time - 3 * t0) / (kG - 1);
            const kH_min = Math.ceil(Math.max((kW - 1) * 0.25, (kG - 1) * 0.3125, 1));
            const kH_max = Math.floor(Math.min(1 + kW * 0.25, 1 + kG * 0.3125));
            for (let kH = kH_max; kH >= kH_min; --kH) {
               const t_min_H = (hack_time + 5 * t0) / kH;
               const t_max_H = (hack_time - 1 * t0) / (kH - 1);
               const t_min = Math.max(t_min_H, t_min_G, t_min_W);
               const t_max = Math.min(t_max_H, t_max_G, t_max_W);
               if (t_min <= t_max) {
                  period = t_min;
                  depth = kW;
                  break schedule;
               }
            }
         }
      }

      if (depth == undefined) {
         depth = 1
      }
      if (period == undefined) {
         let { weak_time, grow_time, hack_time } = this.times()
         period = weak_time + 4 * this.t0
      }

      return { depth, period }
   }

   /**
    * Return the hack, weak1, grow, weak2 delays
    * @returns {number, number, number, number}
    */
   getDelays() {

      let { weak_time, grow_time, hack_time } = this.times()

      let { depth, period } = this.getDepthAndPeriod();



      const hack_delay = depth * period - 4 * this.t0 - hack_time;
      const weak_delay_1 = depth * period - 3 * this.t0 - weak_time;
      const grow_delay = depth * period - 2 * this.t0 - grow_time;
      const weak_delay_2 = depth * period - 1 * this.t0 - weak_time;


      return { hack_delay, weak_delay_1, grow_delay, weak_delay_2 };

   }


   hackScript = "/hackingFunctions/hack_delay.js";
   weakScript = "/hackingFunctions/weak_delay.js"
   growScript = "/hackingFunctions/grow_delay.js"


   /**
    * Return the number of threads per cycle for hack, weaken1, grow, weaken2
    * @returns {number, number, number, number}
    */
   getThreadsPerCycle() {
      let ht, wt1, gt, wt2;

      let serv = this.ns.getServer(this.server);
      serv.hackDifficulty = serv.minDifficulty //this.ns.getServerMinSecurityLevel(this.server)
      serv.moneyAvailable = serv.moneyMax

      //How many thread to steal percentSolen% of the cash
      ht = hackAnalThreads(this.ns, serv,
         this.ns.getPlayer(),
         Math.floor(serv.moneyMax * this.percentStolen))

      ht = Math.floor(ht)
      let hackSecurityIncrase = calculateServerSecurityIncrease(ht, false)
      hackSecurityIncrase *= 1.1

      //How many thread to double the cash
      gt = growthAnalyzeThreads(this.ns, serv, this.ns.getPlayer(), 1 / (1 - this.percentStolen), 1)
      gt = Math.ceil(gt)
      let growSecurityIncrase = calculateServerSecurityIncrease(gt, true)
      growSecurityIncrase *= 1.1

      wt1 = getThreadsToWeaken(hackSecurityIncrase, 1);
      wt2 = getThreadsToWeaken(growSecurityIncrase, 1);

      wt1 = Math.ceil(wt1)
      wt2 = Math.ceil(wt2)

      return { ht, wt1, gt, wt2 }

   }

   /**
    * Return the ram cost per cycle
    * @returns {number}
    */
   getCycleRamCost() {

      let hackScriptCost = this.ns.getScriptRam(this.hackScript);
      let weakScriptCost = this.ns.getScriptRam(this.weakScript);
      let growScriptCost = this.ns.getScriptRam(this.growScript);

      let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();

      //this.ns.tprint("Threads : ", ht, " ", wt1, " ", gt, " ", wt2)
      //this.ns.tprint("Ram cost : ", hackScriptCost, " ", weakScriptCost, " ", growScriptCost)

      return ht * hackScriptCost + wt1 * weakScriptCost + gt * growScriptCost + wt2 * weakScriptCost
   }

   /**
    * Return the total ram cost of the batcher
    * @returns {any}
    */
   getTotalRamCost() {
      let { depth, period } = this.getDepthAndPeriod();
      return this.getCycleRamCost() * depth;
   }

   getMoneyPercent() {
      let serv = this.ns.getServer(this.server)
      return 100 * serv.moneyAvailable / serv.moneyMax
   }

   getSecurityPercent() {
      let serv = this.ns.getServer(this.server)
      return 100 * (serv.hackDifficulty - serv.minDifficulty) / (100 - serv.minDifficulty)
   }

   loop() {

      if (!this.serverResetter.isDone()) {
         this.serverResetter.maxThreads = this.trueThreadsCount()
         this.serverResetter.loop()
         return;
      }


      let { depth, period } = this.getDepthAndPeriod();
      let { weak_time, grow_time, hack_time } = this.times()

      let delay = Date.now() - (this.lastStart + period)

      //Emergency stop if for some reasons the server run out of cash
      if (this.getMoneyPercent() < 5) {
         this.serverResetter = new serverResetter(this.ns, this.server, this.trueThreadsCount())
         this.batches = []
         //this.ns.tprint(this.server, " has stopped because the money was too low")
         return
      }


      if (Date.now() > (this.lastStart + period)) {

         if (this.lastStart == 0) {
            delay = 0
         }

         this.lastStart = Date.now()

         let { hack_delay, weak_delay_1, grow_delay, weak_delay_2 } = this.getDelays();
         let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();

         let b = new Batch(this.ns, this.server, Math.max(0, hack_delay - delay),
            Math.max(weak_delay_1 - delay, 0),
            Math.max(grow_delay - delay, 0),
            Math.max(weak_delay_2 - delay, 0), this.t0, ht, wt1,
            gt, wt2, this.hackScript, this.growScript, this.weakScript, hack_time, this.id);

         this.batches.push(b);
         this.id++;
      }



      for (let i = 0; i < this.batches.length; i++) {
         let b = this.batches[i];
         b.update();
      }

      this.batches = this.batches.filter(b => !b.done)



   }

}

