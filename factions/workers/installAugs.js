
/** @param {NS} ns */
export async function main(ns) {
   await ns.sleep(500)
   ns.singularity.stopAction()
   ns.singularity.installAugmentations("main.js")

}