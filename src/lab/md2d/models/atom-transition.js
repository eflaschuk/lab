/*global define */

define(function (require) {

  var inherit            = require("common/inherit"),
      PropertyTransition = require("common/models/property-transition");

  function AtomTransition(model) {
    // Call super constructor.
    PropertyTransition.call(this);
    this._model = model;
  }
  inherit(AtomTransition, PropertyTransition);


  AtomTransition.prototype.setObjectProperties = function(id, props) {
    this._model.atoms.set(id, props);
  };

  AtomTransition.prototype.getObjectProperties = function (id) {
    return this._model.atoms.get(id);
  };

  return AtomTransition;
});
