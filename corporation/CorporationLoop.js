import { Corporation } from "corporation/Corporation"

export class CorporationMain {

   /**
    * Description
    * @param {NS} ns
    * @returns {any}
    */
   constructor(ns) {
      this.ns = ns
      this.corporation = new Corporation(ns)

   }

   loop() {

      if (ns.corporation.getCorporation() == null) {
         this.ns.corporation.createCorporation("PapoursCorp", false)
         this.ns.corporation.createCorporation("PapoursCorp", true)
      } else {
         this.corporation.tick()
      }
   }

}

/** @param {NS} ns */
export async function main(ns) {



   let corpLoop = new CorporationMain(ns)

   while (true) {
      corpLoop.loop()
      await ns.sleep(10)
   }
}