sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";
  return Controller.extend("com.poc.drivemanager.controller.App", {
    onInit: function () {
      this.getOwnerComponent().getRouter().attachRouteMatched(function (oEvent) {
        let sKey = oEvent.getParameter("name");
        if (sKey === "detail") { sKey = "list"; }

        const oNav = this.byId("sideNav");
        if (oNav) { oNav.setSelectedKey(sKey); }

       // classe "noSide" présente uniquement sur l'accueil
        this.byId("ToolPage").toggleStyleClass("noSide", sKey === "home");
      }, this);
    },
    onItemSelect: function (oEvent) {
      const sKey = oEvent.getParameter("item").getKey();
      this.getOwnerComponent().getRouter().navTo(sKey);
    }
  });
});