


/** @param {NS} ns */
export async function main(ns) {

   let augsFromFaction = JSON.parse(ns.read("/data/getAugmentationsFromFaction.txt"))

   let values = Object.values(augsFromFaction)

   let augPrice = {}

   for (let i = 0; i < values.length; i++) {

      let augFromFac = values[i]

      for (let j = 0; j < augFromFac.length; j++) {
         let augName = values[i][j]
         augPrice[augName] = ns.singularity.getAugmentationRepReq(augName)
      }
   }

   ns.write("/data/getAugmentationRepReq.txt", JSON.stringify(augPrice), "w")



}