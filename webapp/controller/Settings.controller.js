sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "com/poc/drivemanager/util/Prefs"
], function (Controller, MessageBox, MessageToast, Prefs) {
  "use strict";
  return Controller.extend("com.poc.drivemanager.controller.Settings", {
    onPrefChange: function () {
      Prefs.save(this.getOwnerComponent().getModel("prefs").getData());
      MessageToast.show("Préférence enregistrée");
    },
    onReset: function () {
      MessageBox.confirm("Réinitialiser le thème et les préférences ?", {
        onClose: (sAction) => {
          if (sAction !== MessageBox.Action.OK) { return; }
          Prefs.reset();
          this.getOwnerComponent().getModel("prefs").setData(Object.assign({}, Prefs.DEFAULTS));
          Prefs.applyTheme(Prefs.DEFAULTS.theme);
          MessageToast.show("Préférences réinitialisées");
        }
      });
    }
  });
});