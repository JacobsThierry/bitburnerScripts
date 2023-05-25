import { calculateHackingTime } from "Formulas/calculateHackingTime"
import { calculateGrowTime } from "Formulas/calculateGrowTime"
import { calculateWeakenTime } from "Formulas/calculateWeakenTime"
import { execSomewhere } from "servers/ramManager"
import { calculateServerSecurityIncrease } from "Formulas/calculateServerSecurityIncrease"
import { hackAnalyzeThreads } from "Formulas/hackAnalyzeThreads"
import { growthAnalyzeThreads } from "Formulas/growthAnalyzeThreads"
import { getThreadsToWeaken } from "Formulas/calculateWeakenAmount"

export class Batch {
   /**
    * Description
    * @param {any} server
    * @param {any} t0
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns, server, percentStolen = 0.5, t0 = 0.2, max_depth = 9999) {
      this.server = server
      this.t0 = t0
      this.ns = ns
      this.max_depth = max_depth
      this.percentStolen = percentStolen;
   }

   toString() {
      let out = ""
      out += "Server = " + this.server + "\n"
      out += "T0 = " + this.t0 + "\n"
      out += "Max depth = " + this.max_depth + "\n"
      out += "Percent stolent = " + this.percentStolen + "\n"


      let { depth, period } = this.getDepthAndPeriod();
      out += "Depth = " + depth + " ; Period = " + this.ns.tFormat(period, 3) + "\n\n"

      let serv = this.ns.getServer(this.server);
      serv.hackDifficulty = this.ns.getServerMinSecurityLevel(this.server)

      out += "Times : \n"
      out += "\t Hacking time = " + this.ns.tFormat(calculateHackingTime(serv, this.ns.getPlayer()), 5) + "\n"
      out += "\t Grow time = " + this.ns.tFormat(calculateGrowTime(serv, this.ns.getPlayer()), 5) + "\n"
      out += "\t Weaken time = " + this.ns.tFormat(calculateWeakenTime(serv, this.ns.getPlayer()), 5) + "\n"

      out += "\n"
      let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();
      out += "Threads per cycles : \n"
      out += "\t Hack thread : " + ht + "\n"
      out += "\t Weaken 1 thread : " + wt1 + "\n"
      out += "\t Grow thread : " + gt + "\n"
      out += "\t Weaken 2 thread : " + wt2 + "\n"
      out += "\t total : " + (ht + wt1 + gt + wt2) + "\n"


      out += "\n"
      out += "Estimated revenues : " + this.getRevenues() + "\n";

      out += "Ram per cycle : " + this.getCycleRamCost() + "\n";

      out += "Total ram cost : " + this.getTotalRamCost() + "\n";
      out += "Total thread count : " + ((ht + wt1 + gt + wt2) * depth) + "\n"



      return out

   }

   getRevenues() {

      let { depth, period } = this.getDepthAndPeriod();

      let moneyPerCycle = this.ns.getServerMaxMoney(this.server) * this.percentStolen
      let totalMoneyPerPeriod = moneyPerCycle * depth
      let moneyPerSec = totalMoneyPerPeriod / period

      return moneyPerSec;

   }

   times() {

      let serv = this.ns.getServer(this.server);
      serv.hackDifficulty = this.ns.getServerMinSecurityLevel(this.server)

      let weak_time = calculateWeakenTime(serv, this.ns.getPlayer());
      let grow_time = calculateGrowTime(serv, this.ns.getPlayer());
      let hack_time = calculateHackingTime(serv, this.ns.getPlayer());

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

      let serv = this.ns.getServer(this.server);
      serv.hackDifficulty = this.ns.getServerMinSecurityLevel(this.server)

      //How many thread to steal percentSolen% of the cash
      ht = hackAnalyzeThreads(serv,
         this.ns.getPlayer(),
         Math.floor(this.ns.getServerMaxMoney(this.server) * this.percentStolen))

      ht = Math.floor(ht)
      let hackSecurityIncrase = calculateServerSecurityIncrease(ht, false)

      //How many thread to double the cash
      gt = growthAnalyzeThreads(serv, this.ns.getPlayer(), 1 / (1 - this.percentStolen), 1)
      gt = Math.ceil(gt)
      let growSecurityIncrase = calculateServerSecurityIncrease(gt, true)

      wt1 = getThreadsToWeaken(hackSecurityIncrase, 1);
      wt2 = getThreadsToWeaken(growSecurityIncrase, 1);

      wt1 = Math.ceil(wt1)
      wt2 = Math.ceil(wt2)

      return { ht, wt1, gt, wt2 }

   }

   getCycleRamCost() {

      let hackScriptCost = this.ns.getScriptRam(this.hackScript);
      let weakScriptCost = this.ns.getScriptRam(this.weakScript);
      let growScriptCost = this.ns.getScriptRam(this.growScript);

      let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();

      //this.ns.tprint("Threads : ", ht, " ", wt1, " ", gt, " ", wt2)
      //this.ns.tprint("Ram cost : ", hackScriptCost, " ", weakScriptCost, " ", growScriptCost)

      return ht * hackScriptCost + wt1 * weakScriptCost + gt * growScriptCost + wt2 * weakScriptCost
   }

   getTotalRamCost() {
      let { depth, period } = this.getDepthAndPeriod();
      return this.getCycleRamCost() * depth + this.ns.getScriptRam("/batching/Batch.js");
   }


   async loop() {
      let id = 0;
      while (true) {
         id++;
         let { hack_delay, weak_delay_1, grow_delay, weak_delay_2 } = this.getDelays();
         let { ht, wt1, gt, wt2 } = this.getThreadsPerCycle();



         let hackok = execSomewhere(this.ns, this.hackScript, ht, this.server, hack_delay, id);
         if (!hackok) {
            this.ns.print("Not all hack threads have been started")
         }
         await this.ns.sleep(this.t0);

         let wt1ok = execSomewhere(this.ns, this.weakScript, wt1, this.server, weak_delay_1, id);
         if (!wt1ok) {
            this.ns.print("Not all weaken 1 threads have been started")
         }
         await this.ns.sleep(this.t0);


         let growok = execSomewhere(this.ns, this.growScript, gt, this.server, grow_delay, id);
         if (!growok) {
            this.ns.print("Not all grow threads have been started")
         }
         await this.ns.sleep(this.t0);

         let wt2ok = execSomewhere(this.ns, this.weakScript, wt2, this.server, weak_delay_2, id);
         if (!wt2ok) {
            this.ns.print("Not all weaken 2 threads have been started")
         }
         await this.ns.sleep(this.t0);

      }
   }

}

