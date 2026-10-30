sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "com/poc/drivemanager/util/Prefs"
], function (Controller, JSONModel, MessageToast, Prefs) {
  "use strict";
  return Controller.extend("com.poc.drivemanager.controller.Themes", {
    onInit: function () {
      this.getView().setModel(new JSONModel({
        list: [
          { key: "sap_horizon",      label: "Morning Horizon",      desc: "Thème clair (par défaut)",  icon: "sap-icon://light-mode" },
          { key: "sap_horizon_dark", label: "Evening Horizon",      desc: "Thème sombre",              icon: "sap-icon://dark-mode" },
          { key: "sap_horizon_hcb",  label: "Contraste élevé noir", desc: "Accessibilité, fond noir",  icon: "sap-icon://accessibility" },
          { key: "sap_horizon_hcw",  label: "Contraste élevé blanc",desc: "Accessibilité, fond blanc", icon: "sap-icon://accessibility" }
        ]
      }), "themes");
    },
    onThemeChange: function (oEvent) {
      const oItem = oEvent.getParameter("listItem");
      const sKey = oItem.getBindingContext("themes").getProperty("key");
      const oPrefs = this.getOwnerComponent().getModel("prefs");
      oPrefs.setProperty("/theme", sKey);
      Prefs.applyTheme(sKey);
      Prefs.save(oPrefs.getData());
      MessageToast.show("Thème appliqué");
    }
  });
});