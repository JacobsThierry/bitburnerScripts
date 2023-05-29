

import { Solver } from "codingContracts/solvers/solver"

export class arrayJumpingGameII extends Solver {

   static dummy = Solver.derived.push(new this())

   constructor() {
      super()
      this.type = arrayJumpingGameII.typeList.arrayJumpingGame2
   }

   /**
    * Description
    * @param {number[]} data
    * @returns {number}
    */
   solve(data) {
      let minJump = Array(data.length).fill(-1)
      minJump[0] = 0
      for (let i = 0; i < data.length; i++) {
         let jumpSize = data[i]
         let jumpNumber = minJump[i]
         if (jumpNumber >= 0) {
            let jumpTime = jumpNumber + 1
            for (let j = i; j <= (i + jumpSize); j++) {
               if (j >= data.length) {
                  break
               }
               if (minJump[j] == -1) {
                  minJump[j] = jumpTime
               } else {
                  minJump[j] = Math.min(minJump[j], jumpTime)
               }
            }
         }
      }

      let anwser = minJump[minJump.length - 1]
      if (anwser == -1) {
         anwser = 0
      }
      return anwser
   }
}

/** @param {NS} ns */
export async function main(ns) {

   arrayJumpingGameII.test(ns)


}