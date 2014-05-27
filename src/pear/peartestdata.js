var SCROLL_DELAY = 50;

function dispatchScroll(target, newScrollTop) {
  target.scrollTop = newScrollTop;
  var e = document.createEvent('UIEvents');
  // creates a scroll event that bubbles, can be cancelled,
  // and with its view and detail property initialized to window and 1,
  // respectively
  e.initUIEvent('scroll', true, true, window, 1);
  target.dispatchEvent(e);
}


var item = ['Xbox', 'Kindle DX', 'Kindle Fire', 'iPhone', 'Galaxy S3',
  'Galaxy S4', 'Google Chromecast', 'PS3', 'Apple TV', 'Wii-u'];
var unitprice = [179.89, 199.00, 150.00, 699.00, 499.00, 399.00,
                 34.95, 209.80, 95.00, 234.99];


function testData1Columns() {

  var c = [
    new pear.data.Column('Order No', 'orderno', 'orderno',
        75, pear.data.Column.DataType.NUMBER),
    new pear.data.Column('Item', 'item', 'item',
        115, pear.data.Column.DataType.TEXT),
    new pear.data.Column('Unit Price', 'up', 'unitprice',
        75, pear.data.Column.DataType.NUMBER),
    new pear.data.Column('Quantity', 'quantity', 'quantity',
        75, pear.data.Column.DataType.NUMBER, pear.data.Column.Align.RIGHT),
    new pear.data.Column('Total', 'total', 'total',
        75, pear.data.Column.DataType.NUMBER),
    new pear.data.Column('Created On', 'createdon', 'created',
        95, pear.data.Column.DataType.DATETIME),
    new pear.data.Column('Processed', 'processed', 'processed',
        95, pear.data.Column.DataType.BOOLEAN)
  ];

  return c;
}

function testData1Rows(rowlimit) {
  var data = [];
  for (var i = 0; i < parseInt(rowlimit, 10); i++) {
    data[i] = {
      orderno: i + 1
    };
    temp = Math.round(Math.random() * 9);

    data[i].item = item[temp];
    data[i].unitprice = unitprice[temp];
    data[i].quantity = Math.round(Math.random() * 100);
    data[i].total = data[i].unitprice * data[i].quantity;
    data[i].processed = (i % 5 === 0);
    data[i].created = '11/21/2013';
  }
  return data;
}
