sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/core/BusyIndicator",
  "sap/ui/core/Fragment"
], function (Controller, JSONModel, MessageBox, MessageToast, BusyIndicator, Fragment) {
  "use strict";
  return Controller.extend("com.poc.drivemanager.controller.Detail", {
    onInit: function () {
      this.getOwnerComponent().getRouter().getRoute("detail")
        .attachPatternMatched(this._onMatched, this);
    },
    _onMatched: function (oEvent) {
      this._sId = oEvent.getParameter("arguments").fileId;
      const oModel = this.getOwnerComponent().getModel("files");
      if (!oModel) { this.onNavBack(); return; } // page rechargée : retour à la liste
      const oFile = (oModel.getProperty("/files") || []).find(f => f.id === this._sId);
      this.getView().setModel(new JSONModel(oFile || {}), "file");
    },
    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("list", {}, true);
    },
    onUpdatePress: async function () {
  if (!this._oUpdateDialog) {
    this._oUpdateDialog = await Fragment.load({
      id: this.getView().getId(),
      name: "com.poc.drivemanager.view.UpdateDialog",
      controller: this
    });
    this.getView().addDependent(this._oUpdateDialog);
  }
  this._oFile = null;
  this.byId("updateUploader").clear();
  this._oUpdateDialog.open();
},
onFileChange: function (oEvent) {
  const aFiles = oEvent.getParameter("files");
  this._oFile = aFiles && aFiles[0];
},
onUpdateConfirm: async function () {
  if (!this._oFile) { MessageToast.show("Choisis d'abord un fichier"); return; }
  const oForm = new FormData();
  oForm.append("file", this._oFile, this._oFile.name);
  oForm.append("fileId", this._sId);
  BusyIndicator.show(0);
  try {
    const res = await fetch("/manage/file/gd/v1/update", { method: "PATCH", body: oForm });
    if (!res.ok) { throw new Error("HTTP " + res.status); }
    MessageToast.show("Fichier mis à jour");
    this._oUpdateDialog.close();
    this.onNavBack();
  } catch (e) {
    MessageBox.error("Modification impossible : " + e.message);
  } finally {
    BusyIndicator.hide();
  }
},
onUpdateCancel: function () {
  this._oUpdateDialog.close();
},
    onDelete: function () {
      const sName = this.getView().getModel("file").getProperty("/name");
      MessageBox.confirm("Supprimer « " + sName + " » de Google Drive ?", {
        actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
        emphasizedAction: MessageBox.Action.DELETE,
        onClose: async (sAction) => {
          if (sAction !== MessageBox.Action.DELETE) { return; }
          BusyIndicator.show(0);
          try {
            const res = await fetch("/manage/file/gd/v1/delete", {
              method: "DELETE",
              headers: { fileId: this._sId }
            });
            if (!res.ok) { throw new Error("HTTP " + res.status); }
            MessageToast.show("Fichier supprimé");
            this.onNavBack();
          } catch (e) {
            MessageBox.error("Suppression impossible : " + e.message);
          } finally {
            BusyIndicator.hide();
          }
        }
      });
    }
  });
});