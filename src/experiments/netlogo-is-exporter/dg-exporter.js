/*jshint eqnull: true */
/*global console: true */

if (typeof ISNetLogo === 'undefined') ISNetLogo = {};

if (typeof console === 'undefined') console = { log: function() {} };

ISNetLogo.DGExporter = {

  gameName: 'NetLogo',

  init: function(dimensions) {
    this.width = dimensions.width;
    this.height = dimensions.height;
  },

  mockDGController: {
    doCommand: function(obj) {
      console.log("action: ", obj.action);
      console.log("args: ", obj.args);
      return { caseID: 0 };
    }
  },

  getDGGameController: function() {
    if (!(window.parent) || (!window.parent.DG)) {
      return this.mockDGController;
    }
    return window.parent.DG.currGameController;
  },

  doCommand: function(name, args) {
    var controller = this.getDGGameController();

    return controller.doCommand({
      action: name,
      args: args
    });
  },

  exportData: function(exportedData) {
    var parentCollectionName = exportedData.collection_name,
        mainCase = exportedData.cases[0],
        contents = mainCase.contents,
        childCollectionName = contents.collection_name,
        childCases = contents.cases,

        dgCase,

        attributes = [],
        childAttributes = [],
        data = [],
        child = {},
        childKey = '',
        childName = '',
        firstChildCase,
        theCase,
        values;

    $.each(mainCase, function(key, value) {
      if (typeof value === 'object') {
        child = value;
        childKey = key;
        childName = value.collection_name;
        childCases = value.cases;
        firstChildCase = childCases[0];
        $.each(firstChildCase, function(key2, value2) {
          childAttributes.push({ name: key2 });
        });
      } else {
        attributes.push({ name: key});
      }
    });

    // extract data from child cases
    for(var i = 0; i < childCases.length; i++) {
      theCase = childCases[i];
      values = $.map(theCase, function(value) { return value; });
      data.push(values);
    }

    // Step 1. Tell DG we're a "game".
    this.doCommand('initGame', {
      name: this.gameName,
      dimensions: { width: this.width, height: this.height }
    });

    // Step 2. Create a parent collection with the main attributes
    this.doCommand('createCollection', {
      name: parentCollectionName,
      attrs: attributes,
      childAttrName: childKey
    });

    // Step 3. Create a collection to be the child of the parent collection;
    // each row of the child has a singl.
    this.doCommand('createCollection', {
      name: childName,
      attrs: childAttributes
    });

    // Step 4. Open a case in the parent collection. This will contain the individual sensor readings
    // as children.
    dgCase = this.doCommand('openCase', {
      collection: this.parentCollectionName,
      values: attributes
    });

    // Step 5. Create cases in the child collection for each data point. Using 'createCases' we can
    // do this inline, so we don't need to call openCase, closeCase for each one.
    this.doCommand('createCases', {
      collection: this.childCollectionName,
      values: data,
      parent: dgCase.caseID,
      log: false
    });

    // Step 6. Close the case.
    this.doCommand('closeCase', {
      collection: this.parentCollectionName,
      values: attributes,
      caseID: dgCase.caseID
    });

    // Step 7. Create Table.
    this.doCommand('createComponent', {
      type: DG.TableView,
      log: false
    });
  }
};
