export class Serie {

   constructor(data = [], rate = 500, expriry = 600000) {
      /**@type {[[][]] } */
      this.data = data
      this.rate = rate
      this.expriry = expriry
   }

   addValue(value) {

      let v = [value, Date.now()]
      this.data.push(v)

   }

   toArray(nbElems = 10) {

      let out = []
      this.data = this.data.filter(v => ((v[1] + this.expriry) > Date.now()))
      //Sorting in descending 
      this.data = this.data.sort((a, b) => b[1] - a[1])

      let i = 0;

      let latestStamp = Date.now()
      if (this.data.length > 0) {

         let d = this.data[i];

         latestStamp = Math.floor(d[1] / this.rate);
      }

      for (let i = 0; i < nbElems; i++) {
         let v = this.avgValueWithStamp(latestStamp - i)

         //L'interpolation c'est ma passion
         if (isNaN(v)) {
            if (out.length > 0) {
               v = out[0]
            } else {
               v = 0
            }
         }
         out.unshift(v)

      }

      return out

   }

   avgValueWithStamp(stamp) {

      let sum = 0;
      let count = 0

      for (let i = 0; i < this.data.length; i++) {

         let d = this.data[i]

         if ((Math.floor(d[1] / this.rate)) == stamp) {
            sum += d[0]
            count += 1
         }

      }

      if (count == 0) {
         return NaN
      }

      return sum / count

   }

}