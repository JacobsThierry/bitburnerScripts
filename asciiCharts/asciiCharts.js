// control sequences for coloring
export let black = "\u001b[30m"
export let red = "\u001b[31m"
export let green = "\u001b[32m"
export let yellow = "\u001b[33m"
export let blue = "\u001b[34m"
export let magenta = "\u001b[35m"
export let cyan = "\u001b[36m"
export let lightgray = "\u001b[37m"
export let darkgray = "\u001b[90m"
export let lightred = "\u001b[91m"
export let lightgreen = "\u001b[92m"
export let lightyellow = "\u001b[93m"
export let lightblue = "\u001b[94m"
export let lightmagenta = "\u001b[95m"
export let lightcyan = "\u001b[96m"
export let white = "\u001b[97m"
export let reset = "\u001b[0m"

function colored(char, color) {
   // do not color it if color is not specified
   return (color === undefined) ? char : (color + char + reset)
}

//from https://observablehq.com/@chrispahm/hello-asciichart
export function plotWithXaxis(yArray, xArray, config = {}) {
   if (!xArray) xArray = yArray.map((v, i) => i)
   const p = plot(yArray, config)
   // determine the overall width of the plot (in characters)
   const fullWidth = p.split('\n')[0].length
   // get the number of characters reserved for the y-axis legend
   const reservedYLegendWidth = p.split('\n')[0].split(/┤|┼╮|┼/)[0].length + 2
   // the difference between the two is the actual width of the x axis
   const widthXaxis = fullWidth - reservedYLegendWidth
   // get the number of characters of the longest x-axis label
   const longestXLabel = xArray.map(l => l.toString().length).sort((a, b) => b - a)[0]
   // get maximum amount of decimals in the labels 
   const maxDecimals = !isNaN(config.decimals) ? config.decimals : xArray.map(l => countDecimals(l)).sort((a, b) => b - a)[0]
   // considering a single whitespace left and right (for readibility), the formula for
   // determining the maximum amount of (readable) labels boils down to the following:
   const maxNoXLabels = Math.floor(widthXaxis / (longestXLabel + 2))

   const valueBetweenLabels = (xArray[xArray.length - 1] - xArray[0]) / (maxNoXLabels - 2)
   // add labels with fixed distance, however always include first and last position
   const factor = Math.pow(10, maxDecimals)
   const labels = [Math.round(xArray[0] * factor) / factor]
   for (let i = 0; i < maxNoXLabels - 2; ++i) {
      labels.push(Math.round((labels[labels.length - 1] + valueBetweenLabels) * factor) / factor)
   }
   // labels.push(Math.round(xArray[xArray.length - 1] * factor)/factor)
   // calculate the position of the x-label ticks
   const tickPositions = labels.map(value => Math.round((value - xArray[0]) / (xArray[xArray.length - 1] - xArray[0]) * widthXaxis))

   let tickString = [...new Array(reservedYLegendWidth)].join(" ") + [...new Array(widthXaxis)].map((v, i) => tickPositions.indexOf(i) > -1 ? "┬" : "─").join("")

   const tickLabelStartPosition = tickPositions.map((pos, i) => pos - Math.floor(labels[i].toString().length / 2))

   const reservedWhitespace = [...new Array(reservedYLegendWidth - 1)].map((v, i) => {
      if ((i - reservedYLegendWidth + 1) == tickLabelStartPosition[0]) return labels[0]
      else return " "
   }).join("")

   const startIndex = reservedWhitespace.length + 1 - reservedYLegendWidth
   const tickLabels = []
   for (let i = startIndex; i < widthXaxis; ++i) {
      if (tickLabelStartPosition.indexOf(i) > -1) {
         tickLabels.push(labels[tickLabelStartPosition.indexOf(i)])
         i = startIndex + tickLabels.join("").length - 1
      }
      else tickLabels.push(" ")
   }

   return `${'\n' + p + '\n' + tickString + '\n' + reservedWhitespace + tickLabels.join("")}`
}

function countDecimals(value) {
   try {
      if ((value % 1) != 0)
         return value.toString().split(".")[1].length;
   } catch {

   }
   return 0;
};


export function plot(series, cfg = undefined) {
   // this function takes both one array and array of arrays
   // if an array of numbers is passed it is transformed to
   // an array of exactly one array with numbers
   if (typeof (series[0]) == "number") {
      series = [series]
   }

   cfg = (typeof cfg !== 'undefined') ? cfg : {}

   let min = (typeof cfg.min !== 'undefined') ? cfg.min : series[0][0]
   let max = (typeof cfg.max !== 'undefined') ? cfg.max : series[0][0]

   for (let j = 0; j < series.length; j++) {
      for (let i = 0; i < series[j].length; i++) {
         min = Math.min(min, series[j][i])
         max = Math.max(max, series[j][i])
      }
   }

   let defaultSymbols = ['┼', '┤', '╶', '╴', '─', '╰', '╭', '╮', '╯', '│']
   let range = Math.abs(max - min)
   let offset = (typeof cfg.offset !== 'undefined') ? cfg.offset : 3
   let padding = (typeof cfg.padding !== 'undefined') ? cfg.padding : '       '
   let height = (typeof cfg.height !== 'undefined') ? cfg.height : range
   let colors = (typeof cfg.colors !== 'undefined') ? cfg.colors : []
   let ratio = range !== 0 ? height / range : 1;
   let min2 = Math.round(min * ratio)
   let max2 = Math.round(max * ratio)
   let rows = Math.abs(max2 - min2)
   let width = 0
   for (let i = 0; i < series.length; i++) {
      width = Math.max(width, series[i].length)
   }
   width = width + offset
   let symbols = (typeof cfg.symbols !== 'undefined') ? cfg.symbols : defaultSymbols
   let format = (typeof cfg.format !== 'undefined') ? cfg.format : function (x) {
      return (padding + x.toFixed(2)).slice(-padding.length)
   }

   let result = new Array(rows + 1) // empty space
   for (let i = 0; i <= rows; i++) {
      result[i] = new Array(width)
      for (let j = 0; j < width; j++) {
         result[i][j] = ' '
      }
   }
   for (let y = min2; y <= max2; ++y) { // axis + labels
      let label = format(rows > 0 ? max - (y - min2) * range / rows : y, y - min2)
      result[y - min2][Math.max(offset - label.length, 0)] = label
      result[y - min2][offset - 1] = (y == 0) ? symbols[0] : symbols[1]
   }

   for (let j = 0; j < series.length; j++) {
      let currentColor = colors[j % colors.length]
      let y0 = Math.round(series[j][0] * ratio) - min2
      result[rows - y0][offset - 1] = colored(symbols[0], currentColor) // first value

      for (let x = 0; x < series[j].length - 1; x++) { // plot the line
         let y0 = Math.round(series[j][x + 0] * ratio) - min2
         let y1 = Math.round(series[j][x + 1] * ratio) - min2
         if (y0 == y1) {
            result[rows - y0][x + offset] = colored(symbols[4], currentColor)
         } else {
            result[rows - y1][x + offset] = colored((y0 > y1) ? symbols[5] : symbols[6], currentColor)
            result[rows - y0][x + offset] = colored((y0 > y1) ? symbols[7] : symbols[8], currentColor)
            let from = Math.min(y0, y1)
            let to = Math.max(y0, y1)
            for (let y = from + 1; y < to; y++) {
               result[rows - y][x + offset] = colored(symbols[9], currentColor)
            }
         }
      }
   }
   return result.map(function (x) { return x.join('') }).join('\n')
}
