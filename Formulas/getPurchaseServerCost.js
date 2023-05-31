import { CONSTANTS } from "Formulas/constant"
import { myGetBitNodeMultipliers } from "Formulas/bitNode/getBitNodeMultipliers"

/**
 * Description
 * @param {NS} ns Amount of RAM on purchased server (GB)
 * @param {any} ram
 * @returns {any}  Cost of purchasing the given server
 */
export function myGetPurchaseServerCost(ns, ram) {
   const sanitizedRam = Math.round(ram);
   const upg = Math.max(0, Math.log(sanitizedRam) / Math.log(2) - 6);

   let PurchasedServerCost = 1
   let PurchasedServerSoftcap = 1
   let bitNode = 0
   try {
      //PurchasedServerSoftcap = ns.getBitNodeMultipliers().PurchasedServerSoftcap();
      //PurchasedServerCost = ns.getBitNodeMultipliers().PurchasedServerCost();

      bitNode = JSON.parse(ns.read("/data/resetInfo.txt")).currentNode


   } catch { bitNode = 1 }

   PurchasedServerCost = myGetBitNodeMultipliers(bitNode, 1).PurchasedServerCost;
   PurchasedServerSoftcap = myGetBitNodeMultipliers(bitNode, 1).PurchasedServerSoftcap;

   return (
      sanitizedRam *
      CONSTANTS.BaseCostFor1GBOfRamServer *
      PurchasedServerCost *
      Math.pow(PurchasedServerSoftcap, upg)
   );
}