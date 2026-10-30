sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";
  return Controller.extend("com.poc.drivemanager.controller.Home", {
    onNavigate: function (oEvent) {
      const sTarget = oEvent.getSource().data("target");
      this.getOwnerComponent().getRouter().navTo(sTarget);
    }
  });
});