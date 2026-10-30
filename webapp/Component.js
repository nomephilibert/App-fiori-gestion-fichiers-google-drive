sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "com/poc/drivemanager/util/Prefs"
], function (UIComponent, JSONModel, Prefs) {
  "use strict";

  return UIComponent.extend("com.poc.drivemanager.Component", {
    metadata: { manifest: "json" },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      const oPrefs = Prefs.load();
      this.setModel(new JSONModel(oPrefs), "prefs");
      Prefs.applyTheme(oPrefs.theme);

      this.getRouter().initialize();
    }
  });
});