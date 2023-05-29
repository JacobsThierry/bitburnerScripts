import { Solver } from "codingContracts/solvers/solver";
import { arrayJumpingGameII } from "codingContracts/solvers/solvers/arrayJumpingGameII";


export class arrayJumpingGameI extends Solver {

   static dummy = Solver.derived.push(new this())

   constructor() {
      super()
      this.type = arrayJumpingGameI.typeList.arrayJumpingGame1
   }

   solve(data) {
      let res = (((new arrayJumpingGameII()).solve(data) != 0) ? 1 : 0)

      return res
   }

}