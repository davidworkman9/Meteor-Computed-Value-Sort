Orders = new Meteor.Collection('Orders');

Number.prototype.toTwoDecimals = function () {
  return Number(this.toFixed(2));
};

if (Meteor.isClient) {
  ComputedTotals = new Meteor.Collection(null);

  Deps.autorun(function () {
    ComputedTotals.remove({}); // remove all temporary orders
    _.each(Orders.find().fetch(), function (order) {
      var total = 0;
      _.each(order.products, function (product) {
        total += product.cost;
      });
      ComputedTotals.insert({ orderID: order._id, total: total.toTwoDecimals() });
    });
  });

  Template.orders.orders = function () {
    return ComputedTotals.find({}, {sort: { total:-1 } }).fetch();
  };

  Template.orders.events({
    'mouseleave .order': function () {
      Session.set('orderID');
    },
    'mouseover .order': function (e) {
      Session.set('orderID', [this.orderID, e.y, e.x ]);
    }
  });

  Template.hoverDetails.helpers({
    numProducts: function () {
      if(this.products)
        return this.products.length;
    }
  });

  Template.hoverDetails.rendered = function () {
    var ord = Session.get('orderID');
    if(ord) {
      $('.hoverDetails').css({
        top: ord[1],
        left: ord[2]
      });
    }
  };

  Template.hoverDetails.order = function () {
    var orderID = Session.get('orderID');
    if(orderID)
      return Orders.findOne({ _id: orderID[0] });
  };

  Template.orders.helpers({
    total: function () {
      return '$ ' + this.total.toFixed(2);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Orders.remove({});
    var i;
    for (i = 0; i < 15; ++i) {
      var x,
        order = { products: [] };
      for(x = 0; x < 5; ++x) {
        order.products.push({
          product: 'widget ' + x,
          cost: (Math.random()*100).toTwoDecimals()
        });
      }

      Orders.insert(order);
    }
  });
}