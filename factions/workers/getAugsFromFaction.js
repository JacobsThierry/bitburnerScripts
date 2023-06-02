


/** @param {NS} ns */
export async function main(ns) {

   let factionList = ["CyberSec", "Tian Di Hui", "Netburners", "Shadows of Anarchy",
      "Sector-12", "Chongqing", "New Tokyo", "Ishima", "Aevum", "Volhaven",
      "NiteSec", "The Black Hand", "BitRunners", "ECorp", "MegaCorp", "KuaiGong International",
      "Four Sigma", "NWO", "Blade Industries", "OmniTek Incorporated", "Bachman & Associates",
      "Clarke Incorporated", "Fulcrum Secret Technologies", "Slum Snakes", "Tetrads", "Silhouette",
      "Speakers for the Dead", "The Dark Army", "The Syndicate", "The Covenant", "Daedalus", "Illuminati"]

   let augsFromFaction = {}

   for (let i = 0; i < factionList.length; i++) {
      augsFromFaction[factionList[i]] = ns.singularity.getAugmentationsFromFaction(factionList[i])
   }

   ns.write("/data/getAugmentationsFromFaction.txt", JSON.stringify(augsFromFaction), "w")

}