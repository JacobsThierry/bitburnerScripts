
/** @param {NS} ns */
export async function main(ns) {
   await ns.sleep(500)
   ns.write("/data/lastInstall.txt", Date.now(), "w")
   ns.singularity.installAugmentations("main.js")
}