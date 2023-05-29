

/**
 * Description
 * @param {NS} ns
 * @param {Solver} solver
 * @returns {any}
 */
export function contractTester(ns, solver) {
   ns.codingcontract.createDummyContract(solver.type)
   let files = ns.ls("home")

   let contract = ""

   for (let i = 0; i < files.length; i++) {
      let f = files[i]
      if (f.endsWith(".cct")) {
         contract = f
         break
      }
   }

   let str = "\n"
   let data = ns.codingcontract.getData(contract, "home")
   str += "Data = " + data + "\n"
   let answer = solver.solve(data)
   str += "anwser = " + answer

   ns.print(str)

   let result = ns.codingcontract.attempt(answer, contract, "home")
   ns.rm(contract, "home")

   let re = (result == "No reward for this contract")

   if (!re) {
      ns.print("Failed ", solver.type, " with data ", contract.data, ". Guess was ", answer)
   }

   return re

}

