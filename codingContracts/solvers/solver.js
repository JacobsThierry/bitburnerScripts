import { contractTester } from "codingContracts/solvers/contractTester"



export class Solver {
   static typeList = {
      largestPrime: "Find Largest Prime Factor",
      sumSubarray: "Subarray with Maximum Sum",
      totalWaysToSum1: "Total Ways to Sum",
      totalWaysToSum2: "Total Ways to Sum II",
      spiralizeMatrix: "Spiralize Matrix",
      arrayJumpingGame1: "Array Jumping Game",
      arrayJumpingGame2: "Array Jumping Game II",
      mergeOverlappingIntervals: "Merge Overlapping Intervals",
      generateIPAdresses: "Generate IP Addresses",
      trader1: "Algorithmic Stock Trader I",
      trader2: "Algorithmic Stock Trader II",
      trader3: "Algorithmic Stock Trader III",
      trader3: "Algorithmic Stock Trader IV",
      minimumPathSum: "Minimum Path Sum in a Triangle",
      uniquePaths1: "Unique Paths in a Grid I",
      uniquePaths2: "Unique Paths in a Grid II",
      shortestPath: "Shortest Path in a Grid",
      sanitizeParentheses: "Sanitize Parentheses in Expression",
      allValidMathExpressions: "Find All Valid Math Expressions",
      hammingCodes1: "HammingCodes: Integer to Encoded Binary",
      hammingCodes2: "HammingCodes: Encoded Binary to Integer",
      twoColoring: "Proper 2-Coloring of a Graph",
      compression1: "Compression I: RLE Compression",
      compression2: "Compression II: LZ Decompression",
      compression3: "Compression III: LZ Compression",
      encryption1: "Encryption I: Caesar Cipher",
      encryption2: "Encryption II: Vigenère Cipher"
   }

   /** @type {Solver[]} */
   static derived = []

   constructor() {
      this.type = ""
   }

   solve(data) {
      return -1;
   }

   /** @param {NS} ns */
   test(ns, loud = false) {
      ns.tail()



      //Small test
      let result = contractTester(ns, this)

      /*
      if (loud) {
         ns.print("Result : ", result)
      }
      */
      let res = true
      for (let i = 0; i < 50; i++) {
         res = res && contractTester(ns, this)
      }
      /*
      if (loud) {
         ns.print("Result after 50 tests : ", res)
      }*/

      return res

   }
}