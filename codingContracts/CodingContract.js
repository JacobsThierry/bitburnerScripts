


export class CodingContract {

   /**
    * Description
    * @param {NS} ns
    * @param {string} server
    * @param {string} fileName
    * @returns {any}
    */
   constructor(ns, server, fileName) {
      this.ns = ns
      this.server = server
      this.fileName = fileName
   }

   toString() {
      return JSON.stringify(this)
   }

   getType() {
      return this.ns.codingcontract.getContractType(this.fileName, this.server)
   }

   getData() {
      return this.ns.codingcontract.getData(this.fileName, this.server)
   }

   attempt(answer) {
      return this.ns.codingcontract.attempt(answer, this.fileName, this.server)
   }

   toString() {
      return `Server : ${this.server}, FileName : ${this.fileName}, type : ${this.getType()} `
   }

}