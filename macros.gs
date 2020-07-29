/** @OnlyCurrentDoc */
/*
function Test() {
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('C3').activate();
  spreadsheet.getCurrentCell().setValue('mean');
  spreadsheet.getRange('D3').activate();
  spreadsheet.getCurrentCell().setFormula('=average(A2:A7)');
  spreadsheet.getRange('C4').activate();
  spreadsheet.getCurrentCell().setValue('min');
  spreadsheet.getRange('D4').activate();
  spreadsheet.getCurrentCell().setFormula('=min(A2:A7)');
  spreadsheet.getRange('C5').activate();
  spreadsheet.getCurrentCell().setValue('max');
  spreadsheet.getRange('D5').activate();
  spreadsheet.getCurrentCell().setFormula('=max(A2:A7)');
  spreadsheet.getRange('C6').activate();
  spreadsheet.getCurrentCell().setValue('stdev');
  spreadsheet.getRange('D6').activate();
  spreadsheet.getCurrentCell().setFormula('=stdev(A2:A7)');
  spreadsheet.getRange('C7').activate();
  spreadsheet.getCurrentCell().setValue('median');
  spreadsheet.getRange('D7').activate();
  spreadsheet.getCurrentCell().setFormula('=median(A2:A7)');
  spreadsheet.getRange('C8').activate();
};
*/


// assumes a Google Sheet with cell A1 = "Enter numberical data in column A" 
// and values to be analyzed entered in rows 2 and onward, all in column A
function Macro1()
{
  var sh = SpreadsheetApp.getActive();
/*
  sh.getRange('A1').activate();
  var s = sh.getCurrentCell().getValue();
  Logger.log(s);
*/
  var lastCol = sh.getLastColumn();
  var lastRow = sh.getLastRow();
  var myRange = "B1:" + lastCol + lastRow;
  sh.getRange(myRange).clearContent();
  sh.getRange(myRange).setNumberFormat("general");
  
  var dataRange = sh.getRange("A:A");
  var lastRowA = dataRange.getLastRow();
  //sh.getRange("A2:A" + lastRowA).setNumberFormat("general");
  
  var n = 0;
  var val = 0;
  for (var i = 2; i <= lastRowA; i++)
  {
    var cell = dataRange.getCell(i, 1)
    val = cell.getValue();
    if (val == "")
    {
      break;
    }
    n++;
  }
  
  s = "for " + n + " data points,";
  sh.getRange('C2').activate();
  sh.getCurrentCell().setValue(s);
  sh.getRange('E2').activate();
  sh.getCurrentCell().setValue("live stats");  
  
  sh.getRange("C3:C7").setHorizontalAlignment("right");
  sh.getRange('C3').activate();
  sh.getCurrentCell().setValue('maximum:');
  sh.getRange('C4').activate();
  sh.getCurrentCell().setValue('minimum:');
  sh.getRange('C5').activate();
  sh.getCurrentCell().setValue('mean (average):');

  //myRange = sh.getRange(2, 1, 10, 1);  // this doesn't work for some reason
  myRange = "A2:A" + (n + 1);
  Logger.log(myRange);
  var values = sh.getRange(myRange).getValues();
  var dValues = [];
 
  //var t = "";
  for (var i = 0; i < n; i++)
  {
    //t = t + values[i] + ", ";
    dValues[i] = parseFloat(values[i]);
  }
  //Logger.log(t);

  var ds = new Dataset(dValues);
  var minmax = ds.ComputeExtremes();
  var mean = ds.ComputeMean();

  sh.getRange('D3').activate();
  sh.getCurrentCell().setValue(minmax[1]);
  sh.getRange('E3').activate();
  s = "=max(" + myRange + ")";
  sh.getCurrentCell().setFormula(s);
  sh.getRange('D4').activate();
  sh.getCurrentCell().setValue(minmax[0]);
  sh.getRange('E4').activate();
  s = "=min(" + myRange + ")";
  sh.getCurrentCell().setFormula(s);  
  sh.getRange('D5').activate();
  sh.getCurrentCell().setValue(mean);
  sh.getRange('E5').activate();
  s = "=average(" + myRange + ")";
  sh.getCurrentCell().setFormula(s);
  
  if (n > 1)
  {
    sh.getRange('C6').activate();
    sh.getCurrentCell().setValue('stdev:');
    sh.getRange('C7').activate();
    sh.getCurrentCell().setValue('median:');
    var stdev = ds.ComputeStdev();
    var median = ds.ComputeMedian();
    sh.getRange('D6').activate();
    sh.getCurrentCell().setValue(stdev);
    sh.getRange('E6').activate();
    s = "=stdev(" + myRange + ")";
    sh.getCurrentCell().setFormula(s);
    sh.getRange('D7').activate();
    sh.getCurrentCell().setValue(median);
    sh.getRange('E7').activate();
    s = "=median(" + myRange + ")";
    sh.getCurrentCell().setFormula(s);
  }
  else
  {
    sh.getRange("C6:E7").clearContent();
  }
  sh.getRange('A1').activate();
}


class Dataset {
  constructor(dArr)
  {
    this.dArr = dArr;
    this.numPts = this.dArr.length;
  }
  
  GetNumPts()
  {
    this.numPts = this.dArr.length;
    return this.numPts;
  }
  
  ClearArray()
  {
    this.dArr = [];
    this.numPts = 0;
  }
  
  AddArray(inArr)
  {
    this.dArr = inArr;
    this.numPts = this.dArr.length;
  }
  
  GetArray()
  {
    return this.dArr;
  }
  
  AddPoint(x)
  {
    var n = this.dArr.length;
    this.dArr[n] = x;
  }
  
  GetPoint(i)
  {
    var x = 0.0;
    var n = this.dArr.length;
    if (i >= 0 && i < n)
    {
      x = this.dArr[i];
    }
    
    return x;
  }
  
  ComputeExtremes()
  {
    var max = -Infinity, min = Infinity;
    var n = this.dArr.length;
    for (var i = 0; i < n; i++)
    {
      if (this.dArr[i] > max)
      {
        max = this.dArr[i];
      }
      if (this.dArr[i] < min)
      {
        min = this.dArr[i];
      }
    }
    
    return [min, max];
  }
  
  ComputeMean()
  {
    var sum = 0.0;
    this.mean = 0.0;
    var n = this.dArr.length;
    
    if (n > 0)  // mean only defined if n > 0
    {
      for (var i = 0; i < n; i++)
      {
        sum += this.dArr[i];
      }
      this.mean = sum / n;
    }
    
    return this.mean;  // returns 0 if n < 1
  }
  
  ComputeStdev()
  {
    var sum = 0.0, stdev = 0.0;
    var m = this.dArr.length;
    var avg = this.mean;
    
    if (m > 1) // stdev only defined if m > 1
    {
      for (var i = 0; i < m; i++)
      {
        var term = this.dArr[i] - avg;
        sum += term * term;
      }
      stdev = Math.sqrt((sum / (m - 1)));
    }
    
    return stdev;  // returns 0 if m < 2
  }
  
  ComputeMedian()
  {
    var median = 0.0;
    var n = this.dArr.length;
    if (n > 1)  // median only defined if n > 1
    {
      this.dArr.sort((a, b) => a - b);
      
      var m = Math.floor(n / 2);
      if (n % 2 == 0)  // if even number of pts, take average of the middle two
      { 
        return (this.dArr[m - 1] + this.dArr[m]) / 2.0;
      }
      else  // if odd number of pts, take the middle one
      {
        return this.dArr[m];
      }
    }
    
    return median;  // returns 0 if n < 2
  }
  
}  // end of class Dataset


