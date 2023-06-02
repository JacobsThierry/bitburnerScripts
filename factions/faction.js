import { calculateIntelligenceBonus } from "Formulas/calculateIntelligenceBonus";
import { CONSTANTS } from "Formulas/constant";
import { Augmentation } from "factions/augmentation";
import { FactionWorkType, calculateFactionRep, getHackingWorkRepGain, repToFavor } from "factions/factionsFormulas";
import { execSomewhere } from "servers/ramManager";


export class Faction {

   static factionList = ["CyberSec", "Tian Di Hui", "Netburners", "Shadows of Anarchy",
      "Sector-12", "Chongqing", "New Tokyo", "Ishima", "Aevum", "Volhaven",
      "NiteSec", "The Black Hand", "BitRunners", "ECorp", "MegaCorp", "KuaiGong International",
      "Four Sigma", "NWO", "Blade Industries", "OmniTek Incorporated", "Bachman & Associates",
      "Clarke Incorporated", "Fulcrum Secret Technologies", "Slum Snakes", "Tetrads", "Silhouette",
      "Speakers for the Dead", "The Dark Army", "The Syndicate", "The Covenant", "Daedalus", "Illuminati"]

   static cityFactions = ["Sector-12", "Chongqing", "New Tokyo", "Ishima", "Aevum", "Volhaven"]
   /**
    * Description
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns, factionName) {
      /** @type {NS} */
      this.ns = ns
      /** @type {string} */
      this.factionName = factionName

      //TODO : make a file will augs from every faction and read that file instead in order to save ram:
      //let aug = ns.singularity.getAugmentationsFromFaction(factionName)

      let aug = JSON.parse(ns.read("/data/getAugmentationsFromFaction.txt"))[factionName]

      this.augmentations = []

      for (let i = 0; i < aug.length; i++) {
         if (aug[i] != Augmentation.neuroflux) {
            this.augmentations.push(new Augmentation(ns, aug[i], factionName))
         }
      }
   }

   toString() {
      return `${this.factionName}, joined : ${this.isJoined()}\n`
   }

   isCityFaction() {

      return Faction.cityFactions.includes(this.factionName)
   }

   join() {
      //let joined = this.ns.singularity.joinFaction(this.factionName)

      if (this.isJoined()) {
         return
      }

      execSomewhere(this.ns, "factions/workers/joinFaction.js", 1, this.factionName)


   }

   getAugsRemaining() {
      let augsRemaining = this.augmentations.filter(a => (!a.isOwned()))
      return augsRemaining
   }

   getAugsRemainingCount() {
      return this.getAugsRemaining().length;
   }

   getCheapeastRepAug() {
      let a = this.getAugsRemaining()

      a = a.filter(aug => aug.getReputationReq() > this.getRep())

      if (a.length > 0) {
         return a.reduce(function (prev, curr) { return prev.getReputationReq() < curr.getReputationReq() ? prev : curr })
      } else {
         return null
      }
   }
   /*
      isUnlocked() {
         return this.ns.getPlayer().factions.includes(this.factionName) || this.ns.singularity.checkFactionInvitations().includes(this.factionName)
      }
   */
   getCheapeastAug() {
      let a = this.getAugsRemaining()

      //a = a.filter(aug => aug.getReputationReq() > this.getRep())

      if (a.length > 0) {
         return a.reduce(function (prev, curr) { return prev.getAugPrice() < curr.getAugPrice() ? prev : curr })
      } else {
         return null
      }
   }

   getFavor() {
      return this.ns.singularity.getFactionFavor(this.factionName)
   }

   getRep() {
      return this.ns.singularity.getFactionRep(this.factionName)
   }

   //RepGain => par cyle. cycle = 200ms
   getTimeToNextAug(favor = -1, ignoreCurrentRep = false) {

      if (favor == -1) {
         favor = this.getFavor()
      }

      if (this.getCheapeastRepAug() == null) {
         return Infinity
      }

      let repGain = getHackingWorkRepGain(this.ns, this.ns.getPlayer(), favor) * 5
      let repToGo = this.getCheapeastRepAug().getReputationReq()
      if (!ignoreCurrentRep) {
         repToGo -= this.getRep()
      }

      return (repToGo) / repGain
   }

   workFor(focus = false) {
      /** @type {string[]} */
      let workType = Object.values(FactionWorkType)

      workType.sort((a, b) => calculateFactionRep(this.ns, this.ns.getPlayer(), a) - calculateFactionRep(this.ns, this.ns.getPlayer(), b))


      //this.ns.singularity.workForFaction(this.factionName, workType[i], focus)
      execSomewhere(ns, "/factions/workers/workForFaction.js", 1, this.factionName, workType, focus)

   }

   isJoined() {

      let facs = this.ns.getPlayer().factions


      for (let i = 0; i < facs.length; i++) {
         if (this.factionName == facs[i]) {
            return true
         }
      }

      return false
      //return facs.includes(this.factionName)
   }

   getFavorGain() {
      let rep = this.getRep()
      return repToFavor(rep)
   }

   getFavorNextReset() {
      return this.getFavor() + this.getFavorGain()
   }

   donate(amt) {

      if (this.getFavor() < CONSTANTS.BaseFavorToDonate) {
         return false
      }

      //return this.ns.singularity.donateToFaction(this.factionName, amt)

      this.ns.execSomewhere(this.ns, "/factions/workers/donate.js", 1, this.factionName, amt)
   }

}