import { findContracts } from "codingContracts/findContract"
import { Solver } from "codingContracts/solvers/solver"
import * as azeazea from "codingContracts/solvers/solversImports"



/** @param {NS} ns */
export function solveContracts(ns) {



   let contracts = findContracts(ns)
   //ns.print(Solver.derived)

   for (let i = 0; i < contracts.length; i++) {
      let contract = contracts[i]
      //find the right solver



      for (let j = 0; j < Solver.derived.length; j++) {
         let derived = Solver.derived[j]

         if (derived.type == contract.getType()) {
            let answer = derived.solve(contract.getData())
            contract.attempt(answer)
            break
         }
      }


   }
}


/** @param {NS} ns */
export async function main(ns) {

   ns.tail()
   solveContracts(ns)

}