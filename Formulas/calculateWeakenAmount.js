import { CONSTANTS } from "Formulas/constant"

export function calculateWeakenAmount(threads, core) {
   return threads * core * CONSTANTS.ServerWeakenAmount;
}


export function getThreadsToWeaken(weakenValue, core = 1) {
   let t = 1;

   while (calculateWeakenAmount(t, core) < weakenValue) {
      t++;
   }
   return t;
}