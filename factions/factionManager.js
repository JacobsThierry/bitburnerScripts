import { CONSTANTS } from "Formulas/constant";
import { Augmentation } from "factions/augmentation";
import { Faction } from "factions/faction"
import { getDonationFromRep } from "factions/factionsFormulas";
import { execSomewhere } from "servers/ramManager";


export class FactionsManager {

   /**
    * Description
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns) {
      this.ns = ns
      this.factionsList = []


      for (let i = 0; i < Faction.factionList.length; i++) {
         let f = new Faction(this.ns, Faction.factionList[i])
         this.factionsList.push(f)
      }

   }

   getNextCityFaction() {
      let cityFactions = this.getCityFactionsList()
      cityFactions = cityFactions.filter(f => (f.getAugsRemainingCount() > 0))
      cityFactions = cityFactions.filter(f => (f != undefined))

      let v = cityFactions.reduce((prev, curr) => { return prev.getCheapeastRepAug().getReputationReq() > curr.getCheapeastRepAug().getReputationReq() ? prev : curr })

      return v
   }

   getJoinedFactions() {
      return this.factionsList.filter(f => f.isJoined())
   }

   getCityFactionsList() {
      let cityFactions = this.factionsList.filter(f => (Faction.cityFactions.includes(f.factionName)));
      return cityFactions
   }

   getNextFactionToWorkFor() {
      let joinedFactions = this.getJoinedFactions()
      joinedFactions = joinedFactions.filter(f => f.getTimeToNextAug() > 0)
      joinedFactions = joinedFactions.filter(f => (f.getFavor() + f.getFavorGain() < 152))
      joinedFactions = joinedFactions.sort((a, b) => a.getTimeToNextAug() - b.getTimeToNextAug())

      return joinedFactions[0]
   }

   getNonInstalledAugCount() {
      return this.ns.singularity.getOwnedAugmentations(true).length - this.ns.singularity.getOwnedAugmentations(false).length
   }

   getHighestRepFaction() {
      if (this.factionsList.length == 0) {
         return null
      }
      return this.factionsList.reduce(function (prev, current) { return ((prev.getRep() < current.getRep()) && current.isJoined()) ? current : prev }, this.factionsList[0])
   }

   loop() {
      for (let i = 0; i < this.factionsList.length; i++) {
         let faction = this.factionsList[i]

         try {
            if (!faction.isCityFaction() && !faction.isJoined()) {
               faction.joinFaction()
            }
         } catch (e) {
            this.ns.tprint(e)
         }


         let augs = faction.augmentations

         augs.sort((a, b) => a.getAugPrice() - b.getAugPrice())

         for (let j = 0; j < augs.length; j++) {
            let a = augs[j]

            if (faction.getFavor() > CONSTANTS.BaseFavorToDonate) {
               let diff = a.getReputationReq() - faction.getRep();
               if (diff > 0) {
                  let donationAmt = getDonationFromRep(this.ns, diff)
                  if (donationAmt < this.ns.getServerMoneyAvailable("home")) {
                     faction.donate(donationAmt)
                  }
               }
            }

            if (faction.getRep() > a.getReputationReq() && this.ns.getServerMoneyAvailable("home") > a.getAugPrice()) {
               a.purchase();
            }
         }
      }

      if (this.getNextCityFaction() != null) {
         this.getNextCityFaction().joinFaction()
      }

      if (this.getNextFactionToWorkFor() != null) {
         this.getNextFactionToWorkFor().workFor(this.ns.singularity.isFocused())
      }

      if (this.getNonInstalledAugCount() > 0) {
         let revenues = parseInt(this.ns.read("/data/hackRevenues.txt"))

         if (this.getNextFactionToWorkFor().getCheapeastRepAug().getAugPrice() > 120 * revenues) {

            let highestRep = this.getHighestRepFaction()
            for (let q = 0; q < 10; q++) {
               //this.ns.singularity.purchaseAugmentation(highestRep.factionName, Augmentation.neuroflux);

               execSomewhere(this.ns, "factions/workers/purchaseNeuroflux.js");

            }

            execSomewhere(this.ns, "factions/workers/installAugs.js");
         }
      }
   }

}

/** @param {NS} ns */
export async function main(ns) {
   ns.disableLog("scan")

   let fm = new FactionsManager(ns)

   fm.loop();

}