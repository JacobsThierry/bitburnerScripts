import { CompagnyManager } from "factions/compagny/compagnyManager";
import { FactionsManager } from "factions/factionManager";

/** @param {NS} ns */
export async function main(ns) {
   ns.disableLog("scan")


   let fm = new FactionsManager(ns)
   let compagnyManager = new CompagnyManager(ns, fm)
   fm.loop();
   compagnyManager.loop()


}