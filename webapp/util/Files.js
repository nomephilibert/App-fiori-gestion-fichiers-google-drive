sap.ui.define([], function () {
  "use strict";
  return {
    // Garde uniquement le premier fichier de chaque nom
    uniqueByName: function (aFiles) {
      const oSeen = new Set();
      return (aFiles || []).filter(function (oFile) {
        if (oSeen.has(oFile.name)) { return false; }
        oSeen.add(oFile.name);
        return true;
      });
    }
  };
});