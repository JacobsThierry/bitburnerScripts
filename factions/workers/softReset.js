
/** @param {NS} ns */
export async function main(ns) {
   await ns.sleep(500)
   ns.singularity.softReset("main.js")

}