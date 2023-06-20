import { Material } from "corporation/Material"
import { CorpEmployeeJob, CorpMaterialName, IndustryType } from "corporation/enums"

export class CityDivision {

   /**
    * Description
    * @param {NS} ns
    * @param {any} divisionName
    * @param {any} city
    * @param {any} industryType
    * @returns {any}
    */
   constructor(ns, divisionName, city, industryType) {
      this.ns = ns
      this.divisionName = divisionName
      this.city = city
      this.industryType = industryType
      /** @type { Object.<string, Material> }  */
      this.material = {}

      let materialNames = Object.values(CorpMaterialName)
      materialNames.forEach((m) => { this.material[m] = new Material(this.ns, m, this.divisionName, this.city, this.industryType) })

      let producedMaterials = ns.corporation.getIndustryData(industryType).producedMaterials
      producedMaterials.forEach(m => { this.material[m].setQuantityGoal(0) })


      let requiredMaterials = Object.keys(this.ns.corporation.getIndustryData(this.industryType).requiredMaterials)
      requiredMaterials.forEach(m => { this.material[m].setQuantityGoal(0) })

      //this.sellProducedMaterial()

      this.smartSupplyEnabled = false
      this.productDesign = []

      this.tick()



   }

   tick() {
      this.hireMaxEmployees()

      Object.values(this.material).forEach((m) => {

         if (this.smartSupplyEnabled) {
            let requiredMaterials = Object.keys(this.ns.corporation.getIndustryData(this.industryType).requiredMaterials)
            if (!requiredMaterials.includes(m.materialName)) {
               m.tick()

            }
         } else {
            m.tick(true)
         }


      })

      //After testing, it's more or less 1 avg happyness per 10k
      let magicPartyNumber = (100 - this.ns.corporation.getOffice(this.divisionName, this.city).avgMorale) * 100000

      if (Math.floor(magicPartyNumber) > 0) {
         this.ns.corporation.throwParty(this.divisionName, this.city, magicPartyNumber)
      }


      if (this.ns.corporation.getOffice(this.divisionName, this.city).avgEnergy < 95) {
         this.ns.corporation.buyTea(this.divisionName, this.city)
      }


      this.productDesign = this.productDesign.filter(p => { return this.ns.corporation.getProduct(this.divisionName, this.city, p).developmentProgress < 100 })
   }

   buyMaterial(materialName, qte) {
      this.material[materialName].buyMaterial(qte)
   }

   setMaterial(materialName, qte) {
      this.material[materialName].setQuantityGoal(qte)
   }



   upgradeOffice(qte = 1) {
      this.ns.corporation.upgradeOfficeSize(this.divisionName, this.city, qte)
      this.hireMaxEmployees()
   }

   upgradeWarehouse(qte = 1) {
      this.ns.corporation.upgradeWarehouse(this.divisionName, this.city, qte)
   }


   sellProducts(price = "MP") {
      let products = this.ns.corporation.getDivision(this.divisionName).products

      products.forEach(prod => {
         this.ns.corporation.sellProduct(this.divisionName, this.city, prod, "MAX", price, false)
      })
   }

   stopSellingProducts(price = "MP") {
      let products = this.ns.corporation.getDivision(this.divisionName).products

      products.forEach(prod => {
         this.ns.corporation.sellProduct(this.divisionName, this.city, prod, 0, price, false)
      })

   }



   hireMaxEmployees() {
      while (this.ns.corporation.getOffice(this.divisionName, this.city).numEmployees < this.ns.corporation.getOffice(this.divisionName, this.city).size) {
         this.ns.corporation.hireEmployee(this.divisionName, this.city, CorpEmployeeJob.Intern)
      }
   }

   assignEmployees(nbOperation, nbEngineer, nbBusiness, nbManagement, nbRD, nbIntern) {

      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Operations, 0)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Engineer, 0)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Business, 0)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Management, 0)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.RandD, 0)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Intern, 0)


      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Operations, nbOperation)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Engineer, nbEngineer)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Business, nbBusiness)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Management, nbManagement)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.RandD, nbRD)
      this.ns.corporation.setAutoJobAssignment(this.divisionName, this.city, CorpEmployeeJob.Intern, nbIntern)
   }

   enableSmartSupply() {
      this.ns.corporation.setSmartSupply(this.divisionName, this.city, true)
      this.smartSupplyEnabled = true
   }

   disableSmartSupply() {
      this.ns.corporation.setSmartSupply(this.divisionName, this.city, false)
      this.smartSupplyEnabled = false
   }

   setSmartSupply(bool) {
      this.ns.corporation.setSmartSupply(this.divisionName, this.city, bool)
      this.smartSupplyEnabled = bool
   }

   createProduct(design, marketing) {
      let productName = this.productNameGenerator()
      this.ns.corporation.makeProduct(this.divisionName, this.city, productName, design, marketing)
      this.productDesign.push(productName)
   }

   isCreatingAProduct() {
      return (this.productDesign.length > 0)
   }


   productNameGenerator() {
      let prefixes = [
         "", "Super", "Boring", "New", this.divisionName + "'s", "Incredible", "Ultra", "Adorable", "Adventurous",
         "Aggressive", "Agreeable", "Alert", "Alive", "Amused", "Angry", "Annoyed", "Annoying", "Anxious",
         "Arrogant", "Ashamed", "Attractive", "Average", "Awful", "Bad", "Beautiful", "Better", "Bewildered", "Black", "Bloody",
         "Blue", "Blue-eyed", "Blushing", "Bored", "Brainy", "Brave", "Breakable", "Bright", "Busy", "Calm", "Careful", "Cautious",
         "Charming", "Cheerful", "Clean", "Clear", "Clever", "Cloudy", "Clumsy", "Colorful", "Combative", "Comfortable", "Concerned",
         "Condemned", "Confused", "Cooperative", "Courageous", "Crazy", "Creepy", "Crowded", "Cruel", "Curious", "Cute", "Dangerous",
         "Dark", "Dead", "Defeated", "Defiant", "Delightful", "Depressed", "Determined", "Different", "Difficult", "Disgusted",
         "Distinct", "Disturbed", "Dizzy", "Doubtful", "Drab", "Dull", "Lazy", "Light", "Lively", "Lonely", "Long", "Lovely", "Lucky", "Lost",
         "Magnificent", "Misty", "Modern", "Motionless", "Muddy", "Mesmerizing", "Mushy", "Mysterious", "Nasty", "Naughty", "Nervous", "Nice", "Nutty",
         "Obedient", "Obnoxious", "Odd", "Old-fashioned", "Open", "Outrageous", "Outstanding", "Painful", "Panicky", "Perfect", "Plain", "Pleasant",
         "Poised", "Poor", "Powerful", "Precious", "Prickly", "Proud", "Putrid", "Puzzled", "Quaint", "Real", "Relieved", "Repulsive",
         "Rich", "Scary", "Selfish", "Shiny", "Shy", "Silly", "Sleepy", "Smiling", "Smoggy", "Sore", "Sparkling", "Splendid", "Spotless",
         "Stormy", "Strange", "Stupid", "Successful", "Super", "Sexy", "Talented", "Tame", "Tasty", "Tender", "Tense", "Terrible", "Thankful",
         "Thoughtful", "Thoughtless", "Tired", "Tough", "Troubled", "Ugliest", "Ugly", "Uninterested", "Unsightly", "Unusual", "Upset",
         "Uptight", "Vast", "Victorious", "Vivacious", "Wandering", "Weary", "Wicked", "Wide-eyed", "Wild",
         "Witty", "Worried", "Worrisome", "Wrong", "Zany", "Zealous", "Drunk", "Secret"
      ]
      let suffixes = [
         "", "Of Doom", "Of Death", "Of Darkness", "From Sector-12", "From Neo-Tokyo", "From Ishima", "From Aevum", "From Volhaven", ", The expert choice"
      ]
      let names = ""
      switch (this.industryType) {
         case IndustryType.Tobacco:
            names = ["Cigarette", "Fag", "Gasper", "Ciggy", "Coffin Nail", "Cancer Stick", "Bone", "Buzz", "Charch", "Dipper", "Joe", "Lung dart", "Rollie", "Smokey Treat",
               "Stogie", "Stog", "Zazhy", "Schmère"]
            break
         case IndustryType.Software:
            names = ["Text Editor", "VPN", "Video Game", "Voice Chat", "Website", "Online Store", "Virus", "Malware", "Ransomware", "Spambot", "Trojan", "Spyware",
               "Adware", "Wiper", "Keylogger", "Cryptominer", "Calculator", "Database", "Physic Engine"]
            break
      }
      return (prefixes[Math.floor(Math.random() * prefixes.length)] + " " + names[Math.floor(Math.random() * names.length)] + " " + suffixes[Math.floor(Math.random() * suffixes.length)]).trim()
   }

}