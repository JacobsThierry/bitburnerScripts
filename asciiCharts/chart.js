import * as asciicharts from "asciiCharts/asciiCharts"

import { Serie } from "asciiCharts/serie"



export class Chart {

   // control sequences for coloring
   static black = "\u001b[30m"
   static red = "\u001b[31m"
   static green = "\u001b[32m"
   static yellow = "\u001b[33m"
   static blue = "\u001b[34m"
   static magenta = "\u001b[35m"
   static cyan = "\u001b[36m"
   static lightgray = "\u001b[37m"
   static darkgray = "\u001b[90m"
   static lightred = "\u001b[91m"
   static lightgreen = "\u001b[92m"
   static lightyellow = "\u001b[93m"
   static lightblue = "\u001b[94m"
   static lightmagenta = "\u001b[95m"
   static lightcyan = "\u001b[96m"
   static white = "\u001b[97m"
   static reset = "\u001b[0m"

   /**
    * Description
    * @param {Serie[]} series
    * @param {{offset : number, padding : number, height : number, colors : String[], min : number, max : number } } cfg
    * @returns {any}
    */
   constructor(series = [], cfg = {}, arraySize = 10) {
      /**@type {Serie[]} */
      this.series = series


      /**@type {{offset : number, padding : number, height : number, colors : String[], min : number, max : number } }*/
      this.cfg = cfg

      if (cfg.colors == 'undefined') {

         cfg.colors = new Array(this.series.length).fill(asciicharts.reset)
      }
   }

   addSerie(serie) {
      this.series.push(serie)
   }



   plot(nbElems = 30) {

      let data = []

      for (let i = 0; i < this.series.length; i++) {
         /**@type {Serie} */
         let s = this.series[i]
         data.push(s.toArray(nbElems))
      }


      return asciicharts.plot(data, this.cfg)
   }

   plotWithXaxis(nbElems = 30) {
      let data = []

      for (let i = 0; i < this.series.length; i++) {
         /**@type {Serie} */
         let s = this.series[i]
         data.push(s.toArray(nbElems))
      }

      let xAxis = this.series[0].toStampArray(nbElems)

      for (let i = 0; i < xAxis.length; i++) {
         let d = new Date(xAxis[i])

         //xAxis[i] = `${d.getHours}:${d.getMinutes}`
      }


      return asciicharts.plotWithXaxis(data, xAxis, this.cfg)

   }

}