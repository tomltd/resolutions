Resolutions = new Mongo.Collection('resolutions');

if (Meteor.isClient) {
  Meteor.subscribe("resolutions");

  Template.body.helpers({
    resolutions: function() {
      if (Session.get('hideFinished')) {
        return Resolutions.find({checked: {$ne: true}});
      } else {
        return Resolutions.find();
      }
    },
    hideFinished: function() {
      return Session.get('hideFinished');
    }
  });
  Template.body.events({
    'submit .new-resolution' : function(event) {
      var title = event.target.title.value;

    Meteor.call("addResolution", title);

      event.target.title.value = ""; //clears value from field
      return false; // make sure page does not refresh
    },
    'change .hide-finished': function(event) {
      Session.set('hideFinished', event.target.checked);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });


} //end client side

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish("resolutions", function() {
    return Resolutions.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });

}

Meteor.methods({
  addResolution: function(title) {
    Resolutions.insert({
      title: title,
      createdAt: new Date(),
      owner: Meteor.userId()
    });
  },
  updateResolution: function(id, checked) {
    var res = Resolutions.findOne(id);

    if(res.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorised');
    }
    Resolutions.update(id, {$set: {checked: checked}})
  },
  deleteResolution: function(id) {
    var res = Resolutions.findOne(id);

    if(res.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorised');
    }
    Resolutions.remove(id);
  },
  setPrivate: function(id, private) {
    var res = Resolutions.findOne(id);

    if(res.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorised');
    }
    Resolutions.update(id, {$set: {private: private}})


  }
});
