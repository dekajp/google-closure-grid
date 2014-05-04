

var item = ['Xbox','Kindle DX','Kindle Fire','iPhone','Galaxy S3','Galaxy S4','Google Chromecast','PS3','Apple TV','Wii-u'];
var unitprice = [179.89,199.00,150.00,699.00,499.00,399.00,34.95,209.80,95.00,234.99];


function demoDataset1GetColumns(){
  var columns = [
    new pear.data.Column("Order No",'orderno','orderno',75,pear.data.Column.DataType.NUMBER),
    new pear.data.Column("Item",'item','item',115,pear.data.Column.DataType.TEXT),
    new pear.data.Column("Unit Price",'unitprice','unitprice',75,pear.data.Column.DataType.NUMBER),
    new pear.data.Column("Quantity",'quantity','quantity',75,pear.data.Column.DataType.NUMBER),
    new pear.data.Column("Total",'total','total',75,pear.data.Column.DataType.NUMBER,pear.data.Column.Align.RIGHT),
    new pear.data.Column("Created On",'created','created',95,pear.data.Column.DataType.DATETIME),
    new pear.data.Column("Processed",'processed','processed',95,pear.data.Column.DataType.BOOLEAN)
  ];

  return columns;
}

function demoDataSet1GetRows(noOfRows){
  var data = [];
  var limit = noOfRows || 500;
  for (var i = 0; i < parseInt(limit,10); i++) {
      data[i] = {
        orderno:  i +1
      };
      temp = Math.round(Math.random() * 9);
     
      data[i].item = item[temp];
      data[i].unitprice = unitprice[temp];
      data[i].quantity = Math.round(Math.random() * 10);
      data[i].total = data[i].unitprice * data[i].quantity;
      data[i].processed= (i % 5 === 0);
      data[i].created = '11/21/2013';
  }

  return data;
}

