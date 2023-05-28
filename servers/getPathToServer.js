function reconsitutePath(parent, source, dest) {
   let path = [dest]

   if (!(dest in parent)) {
      return []
   }

   while (path[0] != source) {
      path.unshift(parent[path[0]])
   }

   return path


}

/**
 * Description
 * @param {NS} ns
 * @param {string} source
 * @param {string} dest
 * @returns {string[]}
 */
export function getPathToServer(ns, source, dest) {
   let closed = []
   let open = []

   let parent = {}

   open.push(source)

   while (open.length > 0) {
      let u = open[0]
      closed.push(u)
      open.splice(0, 1);



      let childrens = ns.scan(u)



      blbl: for (let i = 0; i < childrens.length; i++) {
         let child = childrens[i]



         if (closed.includes(child)) {
            continue blbl
         }

         //
         if (!(child in parent)) {
            parent[child] = u
         }
         /*
         if (child == dest) {
            open = []
            break
         }*/

         open.push(child)

      }
   }

   return reconsitutePath(parent, source, dest)

}

export function autocomplete(data, args) {
   return [...data.servers]; // This script autocompletes the list of servers.
}

/** @param {NS} ns */
export async function main(ns) {
   ns.disableLog("ALL")
   ns.tail()
   if (ns.args.length < 1) {
      ns.print("not enough args")
      return
   }
   let path = getPathToServer(ns, "home", ns.args[0])

   let str = ""

   for (let i = 0; i < path.length; i++) {
      str += "; connect " + path[i]
   }
   str = str.slice(2)

   ns.print("\n\n\n" + str + "\n\n\n")



}