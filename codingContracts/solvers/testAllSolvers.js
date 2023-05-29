import { Solver } from "codingContracts/solvers/solver";
import * as azeazea from "codingContracts/solvers/solversImports"

/** @param {NS} ns */
export async function main(ns) {
   ns.tail()
   let solvers = Solver.derived

   ns.disableLog("ALL")

   let allTrue = true

   for (let i = 0; i < solvers.length; i++) {
      let solver = solvers[i]
      let res = solver.test(ns, true)
      allTrue = allTrue && res
      if (!res) {
         ns.print(solver.type + " failed")
      }
   }

   ns.print(solvers)
   ns.print("Tout les tests sont passés : ", allTrue)

}