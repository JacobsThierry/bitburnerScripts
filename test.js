import { execSomewhere } from "servers/ramManager"

/** @param {NS} ns */
export async function main(ns) {
   ns.tail()
   execSomewhere(ns, "servers/portOpener.js", 1)

}