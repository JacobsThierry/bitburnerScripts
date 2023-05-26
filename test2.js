let hack_time = 60000;
let grow_time = hack_time * 3.2;
let weak_time = hack_time * 4;
let t0 = 1000;

function getDepthAndPeriod() {





   let period, depth;
   const kW_max = Math.floor(1 + (weak_time - 4 * t0) / (8 * t0));

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

/** @param {NS} ns */
export async function main(ns) {

   ns.tprint("hack time = ", ns.tFormat(hack_time))
   ns.tprint("weaken time = ", ns.tFormat(weak_time))
   ns.tprint("grow time = ", ns.tFormat(grow_time))
   ns.tprint("t0 time = ", ns.tFormat(t0))

   let { depth, period } = getDepthAndPeriod();

   ns.tprint("depth = ", depth)
   ns.tprint("Period = ", ns.tFormat(period))


}