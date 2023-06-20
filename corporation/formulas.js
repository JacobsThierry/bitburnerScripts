



/**
 * Description
 * @param {import("NetscriptDefinitions").Material} material
 * @param {import("NetscriptDefinitions").CorpMaterialConstantData} materialData
 * @returns {any}
 */
export function getMarkupLimit(material, materialData) {
   return material.quality / materialData.baseMarkup;
}

/**
 * Description
 * @param {import("NetscriptDefinitions").Office} office
 * @param {import("NetscriptDefinitions").Corporation} corporation
 * @param {import("NetscriptDefinitions").Division} division
 * @param {any} forProduct
 * @param {any} prodMult
 * @returns {any}
 */
export function cityMaxProd(industryType, office, corporation, division, forProduct, prodMult) {


   //const maxProd = getOfficeProductivity(office, forProduct) * division.productionMult

}

// Returns how much of a material can be produced based of office productivity (employee stats)
export function getOfficeProductivity(office, forProduct) {
   const opProd = office.employeeProductionByJob[EmployeePositions.Operations];
   const engrProd = office.employeeProductionByJob[EmployeePositions.Engineer];
   const mgmtProd = office.employeeProductionByJob[EmployeePositions.Management];
   const total = opProd + engrProd + mgmtProd;

   if (total <= 0) return 0;

   // Management is a multiplier for the production from Operations and Engineers
   const mgmtFactor = 1 + mgmtProd / (1.2 * total);

   // For production, Operations is slightly more important than engineering
   // Both Engineering and Operations have diminishing returns
   const prod = (Math.pow(opProd, 0.4) + Math.pow(engrProd, 0.3)) * mgmtFactor;

   // Generic multiplier for the production. Used for game-balancing purposes
   const balancingMult = 0.05;

   if (forProduct) {
      // Products are harder to create and therefore have less production
      return 0.5 * balancingMult * prod;
   } else {
      return balancingMult * prod;
   }
}