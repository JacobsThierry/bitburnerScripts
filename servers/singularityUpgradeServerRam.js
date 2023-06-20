

/** @param {NS} ns */
export async function main(ns) {

   try {
      for (let i = 0; i < 10; i++) {
         ns.singularity.upgradeHomeRam()
      }

   } catch { }

}