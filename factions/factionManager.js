import { Faction } from "factions/faction"


export class FactionsManager {

   /** @type {FactionsManager} */
   static instance = null;

   /**
    * Description
    * @param {NS} ns
    * @returns {FactionsManager}
    */
   static getInstance(ns) {
      if (FactionsManager.instance == null) {
         return (new FactionsManager(ns))
      } else {
         return FactionsManager.instance;
      }
   }

   /**
    * Description
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns) {
      this.ns = ns
      this.factionsList = []

      for (let i = 0; i < Faction.factionList.length; i++) {
         let f = new Faction(ns, Faction.factionList[i])
         this.factionsList.push(f)
      }

      if (FactionsManager.instance == null) {
         FactionsManager.instance = this;
      }
   }

   getNextCityFaction() {
      let cityFactions = this.getCityFactionsList()
      cityFactions = cityFactions.filter(f => (f.getAugsRemainingCount() > 1))
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
      joinedFactions.filter(f => f.getTimeToNextAug() > 0)
      joinedFactions.sort((a, b) => a.getTimeToNextAug() - b.getTimeToNextAug())

      return joinedFactions[0]
   }

   getNonInstalledAugCount() {
      return this.ns.singularity.getOwnedAugmentations(false).length - this.ns.singularity.getOwnedAugmentations(true).length
   }

   loop() {
      for (let i = 0; i < this.factionsList.length; i++) {
         let faction = this.factionsList[i]

         if (!faction.isCityFaction() && !faction.isJoined()) {
            faction.joinFaction()
         }

         let nextAug = faction.getCheapeastRepAug();


         if (faction.getRep() > nextAug.getReputationReq() && this.ns.getServerMoneyAvailable("home") > nextAug.getPrice()) {
            nextAug.purchase()
         }

      }
      this.getNextCityFaction().joinFaction()

      this.getNextFactionToWorkFor().workFor()

   }



}


/** @param {NS} ns */
export async function main(ns) {

   FactionsManager.getInstance(ns).loop()

}