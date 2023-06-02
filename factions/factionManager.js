import { CONSTANTS } from "Formulas/constant";
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

      if (cityFactions.length == 0) {
         return null
      }

      let v = cityFactions.reduce((prev, curr) => {
         if (prev.getCheapeastRepAug() == null) return curr
         if (curr.getCheapeastRepAug() == null) return prev
         return prev.getCheapeastRepAug().getReputationReq() > curr.getCheapeastRepAug().getReputationReq() ? prev : curr
      })

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
      joinedFactions = joinedFactions.filter(f => f.getAugsRemainingCount() > 0)
      joinedFactions = joinedFactions.filter(f => f.getTimeToNextAug() > 0)
      joinedFactions = joinedFactions.sort((a, b) => a.getTimeToNextAug() - b.getTimeToNextAug())
      let joinedFactionsWithoutFavor = joinedFactions.filter(f => (f.getFavor() + f.getFavorGain() < CONSTANTS.BaseFavorToDonate))
      /*
            if (joinedFactionsWithoutFavor.length == 0 || joinedFactionsWithoutFavor[0] == null) {
               return joinedFactions[0]
            }
      */


      this.ns.write("/data/joinedFactionsWithoutFavor.txt", JSON.stringify(joinedFactionsWithoutFavor), "w")

      return joinedFactionsWithoutFavor[0]
   }

   getCheapeastAugFaction() {

      if (this.getJoinedFactions().length == 0) {
         return null
      }

      let fac = this.getJoinedFactions().reduce((previous, current) => {

         if (current.getCheapeastAug() == null) { return previous }
         if (previous.getCheapeastAug() == null) { return current }
         return previous.getCheapeastAug().getAugPrice() < current.getCheapeastAug().getAugPrice() ? previous : current
      })


      return fac

   }

   getCheapeastAug() {
      let fac = this.getCheapeastAugFaction()
      if (fac == null) {
         return null
      }

      return this.getCheapeastAugFaction().getCheapeastAug()

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
               faction.join()
            }
         } catch (e) {
            this.ns.tprint(e)
         }


         let augs = faction.getAugsRemaining()

         augs.sort((a, b) => a.getAugPrice() - b.getAugPrice())

         for (let j = 0; j < augs.length; j++) {
            let a = augs[j]

            if (faction.getFavor() > CONSTANTS.BaseFavorToDonate && faction.isJoined()) {
               let diff = a.getReputationReq() - faction.getRep();
               if (diff > 0) {
                  let donationAmt = getDonationFromRep(this.ns, diff)
                  if (donationAmt < this.ns.getServerMoneyAvailable("home")) {

                     faction.donate(donationAmt)
                     this.ns.tprint("Donated ", donationAmt, " to ", faction.factionName)
                  }
               }
            }

            if (!a.isOwned() && faction.getRep() > a.getReputationReq() && this.ns.getServerMoneyAvailable("home") > a.getAugPrice()) {
               a.purchase();

               if (a.augmentationName == "The Red Pill") {
                  this.reset()
               }

            }
         }
      }

      let nextCityFaction = this.getNextCityFaction()

      if (nextCityFaction != null) {

         if (this.ns.getPlayer().city != nextCityFaction.factionName && this.ns.getServerMoneyAvailable("home") > 15e6) {
            execSomewhere(this.ns, "factions/workers/traveller.js", 1, nextCityFaction.factionName)
         }

         nextCityFaction.join()
      }

      let workFor = this.getNextFactionToWorkFor()
      if (workFor != null) {
         if (workFor.getAugsRemainingCount() > 0) {
            this.getNextFactionToWorkFor().workFor(true)
         }
      }
      this.checkForReset()
   }


   checkForReset() {

      let revenues = parseInt(this.ns.read("/data/hackRevenues.txt"))

      let lastReset = -1;
      let d = this.ns.read("/data/lastInstall.txt")
      if (d.length != 0) {
         lastReset = parseInt(d)
      }



      let firstBuy = -1;

      d = this.ns.read("/data/timeOfFirstBuy.txt")
      if (d.length != 0) {
         firstBuy = parseInt(d)
      }


      let timeSinceLastReset = Date.now() - lastReset
      let timeToFirstAug = lastReset - firstBuy
      /*
      this.ns.tprint("Revenues = ", this.ns.formatNumber(revenues))
      this.ns.tprint("Next aug = ", this.getCheapeastAug().augmentationName, " ", this.ns.formatNumber(this.getCheapeastAug().getAugPrice()))
*/
      let cheapestAug = this.getCheapeastAug()
      let timeToAffordNextAug = 0

      if (!cheapestAug == null) {
         //1000* coz revenues is in sec
         timeToAffordNextAug = 1000 * cheapestAug.getAugPrice() / (revenues)
      } else {
         timeToAffordNextAug = Infinity
      }

      let nextResetFavor = false
      let cheapestAugFaction = this.getCheapeastAugFaction()
      let timeToRepNextReset = Infinity
      if (cheapestAugFaction != null) {
         timeToRepNextReset = cheapestAugFaction.getTimeToNextAug(cheapestAugFaction.getFavorNextReset(), true)
         if (cheapestAugFaction.getFavor() < CONSTANTS.BaseFavorToDonate) {
            if (cheapestAugFaction.getFavorNextReset() >= CONSTANTS.BaseFavorToDonate) {
               nextResetFavor = true
            }
         }

      }




      //Reset if we can't afford the new aug, or if it take less time to reset and gain the rep than to afford the aug, or if we can now donate to the faction
      if ((this.getNonInstalledAugCount() > 0 && ((timeToFirstAug / 2) < timeToAffordNextAug || lastReset == -1 || timeToRepNextReset < timeToAffordNextAug)) || nextResetFavor) {

         this.reset()
      }

   }

   reset() {
      let highestRep = this.getHighestRepFaction()
      //TODO : donate so we have enough rep to buy the neurofux
      for (let q = 0; q < 10; q++) {
         execSomewhere(this.ns, "factions/workers/purchaseNeuroflux.js", 1, highestRep.factionName);
      }
      this.ns.write("/data/lastInstall.txt", Date.now(), "w")


      if (this.getNonInstalledAugCount() > 0) {

         execSomewhere(this.ns, "factions/workers/installAugs.js");
      } else {
         execSomewhere(this.ns, "factions/workers/softReset.js");
      }
   }

}

/** @param {NS} ns */
export async function main(ns) {
   ns.disableLog("scan")
   let fm = new FactionsManager(ns)
   fm.loop();
}




