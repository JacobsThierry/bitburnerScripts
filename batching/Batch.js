import { calculateHackingTime } from "Formulas/calculateHackingTime"
import { calculateGrowTime } from "Formulas/calculateGrowTime"
import { calculateWeakenTime } from "Formulas/calculateWeakenTime"

export class Batch {
   /**
    * Description
    * @param {any} server
    * @param {any} t0
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns, server, t0 = 0.2, max_depth = 9999) {
      this.server = server
      this.t0 = t0
      this.ns = ns
      this.max_depth = max_depth
   }

   times() {
      let weak_time = calculateWeakenTime(this.ns.getServer(this.server), this.ns.getPlayer());
      let grow_time = calculateGrowTime(this.ns.getServer(this.server), this.ns.getPlayer());
      let hack_time = calculateHackingTime(this.ns.getServer(this.server), this.ns.getPlayer());





      return { weak_time, grow_time, hack_time }
   }

   //from stalefish on discord
   getDepthAndPeriod() {

      let { weak_time, grow_time, hack_time } = this.times()


      let t0 = this.t0;

      let period, depth;
      const kW_max = Math.min(Math.floor(1 + (weak_time - 4 * t0) / (8 * t0)), this.max_depth);

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

      return { depth, period }
   }

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


   getThreadsPerCycle() {
      let ht, wt1, gt, wt2;

      //How many thread to steal 50% of the cash
      ht = hackAnalyzeThreads(this.ns.getServer(this.server),
         this.ns.getPlayer(),
         Math.floor(this.ns.getServerMaxMoney(this.server) / 2))

      ht = Math.floor(ht)
      let hackSecurityIncrase = calculateServerSecurityIncrease(ht, false)

      //How many thread to double the cash
      gt = growthAnalyzeThreads(this.ns.getServer(this.server), this.ns.getPlayer(), 2, 1)
      gt = Math.ceil(gt)
      let growSecurityIncrase = calculateServerSecurityIncrease(gt, true)

      wt1 = getThreadsToWeaken(hackSecurityIncrase, 1);
      wt2 = getThreadsToWeaken(growSecurityIncrase, 1);

      wt1 = Math.ceil(wt1)
      wt2 = Math.ceil(wt2)



      return { ht, wt1, gt, wt2 }

   }

   getCycleRamCost() {
      this.ns.tprint(this.hackScript)
      let hackScriptCost = this.ns.getScriptRam(this.hackScript);
      let weakScriptCost = this.ns.getScriptRam(this.weakScript);
      let growScriptCost = this.ns.getScriptRam(this.growScript);

      let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();

      this.ns.tprint("Threads : ", ht, " ", wt1, " ", gt, " ", wt2)
      this.ns.tprint("Ram cost : ", hackScriptCost, " ", weakScriptCost, " ", growScriptCost)

      return ht * hackScriptCost + wt1 * weakScriptCost + gt * growScriptCost + wt2 * weakScriptCost
   }


   async loop() {
      while (true) {
         let { hack_delay, weak_delay_1, grow_delay, weak_delay_2 } = this.getDelays();
         let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();

         this.ns.tprint(hack_delay)
         this.ns.execSomewhere(ns, this.hackScript, ht, this.server, hack_delay);
         this.ns.execSomewhere(ns, this.weakScript, wt1, this.server, weak_delay_1);
         this.ns.execSomewhere(ns, this.growScript, gt, this.server, grow_delay);
         this.ns.execSomewhere(ns, this.weakScript, wt2, this.server, weak_delay_2);

         await this.ns.sleep(this.t0);
      }
   }

}

import { execSomewhere } from "servers/ramManager"
import { calculateServerSecurityIncrease } from "Formulas/calculateServerSecurityIncrease"
import { hackAnalyzeThreads } from "Formulas/hackAnalyzeThreads"
import { growthAnalyzeThreads } from "Formulas/growthAnalyzeThreads"
import { calculateThreadsForGrowth } from "Formulas/calculateServerGrowth"
import { getThreadsToWeaken } from "Formulas/calculateWeakenAmount"