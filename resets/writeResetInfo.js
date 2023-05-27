
/** @param {NS} ns */
export async function main(ns) {
   let resetInfos = ns.getResetInfo()
   let str = JSON.stringify(resetInfos);

   ns.write("/data/resetInfo.txt", str, 'w')

}