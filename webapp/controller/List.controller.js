sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment",
  "sap/ui/core/BusyIndicator",
  "com/poc/drivemanager/util/Files"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, Fragment, BusyIndicator, Files) {
  "use strict";
  return Controller.extend("com.poc.drivemanager.controller.List", {
    onInit: function () {

      this.getView().setModel(new JSONModel({ title: "Fichiers" }), "view");
      // this.onRefresh();
      this.getOwnerComponent().getRouter().getRoute("list").attachPatternMatched(this.onRefresh, this);
    },
    onRefresh: async function () {
      try {
        const res = await fetch("/manage/file/gd/v1/list", { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        // this.getView().setModel(new JSONModel(data));
        
const aFiles = Files.uniqueByName(data.files);
const oModel = new JSONModel({ files: aFiles });
this.getView().setModel(oModel);
this.getOwnerComponent().setModel(oModel, "files");
this.getView().getModel("view").setProperty("/title", "Fichiers (" + (data.files || []).length + ")");
      } catch (e) {
        MessageToast.show("Erreur de chargement : " + e.message);
      }
    },
    onItemPress: function (oEvent) {
      const sId = oEvent.getSource().getBindingContext().getProperty("id");
      this.getOwnerComponent().getRouter().navTo("detail", { fileId: sId });
  },
    onSearch: function (oEvent) {
      const sQuery = oEvent.getParameter("query");
      const aFilters = sQuery ? [new Filter("name", FilterOperator.Contains, sQuery)] : [];
      this.byId("fileTable").getBinding("items").filter(aFilters);
    },
    onUploadPress: async function () {
  if (!this._oUploadDialog) {
    this._oUploadDialog = await Fragment.load({
      id: this.getView().getId(),
      name: "com.poc.drivemanager.view.UploadDialog",
      controller: this
    });
    this.getView().addDependent(this._oUploadDialog);
  }
  this._oFile = null;
  this.byId("fileUploader").clear();
  this._oUploadDialog.open();
},
onFileChange: function (oEvent) {
  const aFiles = oEvent.getParameter("files");
  this._oFile = aFiles && aFiles[0];
},
onUploadConfirm: async function () {
  if (!this._oFile) { MessageToast.show("Choisis d'abord un fichier"); return; }
  const oForm = new FormData();
  oForm.append("file", this._oFile, this._oFile.name);
  BusyIndicator.show(0);
  try {
    const res = await fetch("/manage/file/gd/v1/upload", { method: "POST", body: oForm });
    if (!res.ok) { throw new Error("HTTP " + res.status); }
    MessageToast.show("Fichier envoyé vers Google Drive");
    this._oUploadDialog.close();
    this.onRefresh();
  } catch (e) {
    MessageBox.error("Upload impossible : " + e.message);
  } finally {
    BusyIndicator.hide();
  }
},
onUploadCancel: function () {
  this._oUploadDialog.close();
},
onDownload: async function () {
  const aSelected = this.byId("fileTable").getSelectedItems();
  if (aSelected.length !== 1) {
    MessageToast.show("Coche un seul fichier à télécharger");
    return;
  }
  const oFile = aSelected[0].getBindingContext().getObject();
  if (oFile.mimeType.startsWith("application/vnd.google-apps")) {
    MessageBox.information("Les documents Google (Docs, Sheets, dossiers) ne peuvent pas être téléchargés tels quels.");
    return;
  }
  BusyIndicator.show(0);
  try {
    const res = await fetch("/manage/file/gd/v1/download", { headers: { fileName: oFile.name } });
    if (!res.ok) { throw new Error("HTTP " + res.status); }
    const sUrl = URL.createObjectURL(await res.blob());
    const oLink = document.createElement("a");
    oLink.href = sUrl;
    oLink.download = oFile.name;
    document.body.appendChild(oLink);
    oLink.click();
    oLink.remove();
    URL.revokeObjectURL(sUrl);
  } catch (e) {
    MessageBox.error("Téléchargement impossible : " + e.message);
  } finally {
    BusyIndicator.hide();
  }
},
onRowView: function (oEvent) {
  const sId = oEvent.getSource().getBindingContext().getProperty("id");
  this.getOwnerComponent().getRouter().navTo("detail", { fileId: sId });
},

onRowEdit: async function (oEvent) {
  this._sEditId = oEvent.getSource().getBindingContext().getProperty("id");
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

onUpdateConfirm: async function () {
  if (!this._oFile) { MessageToast.show("Choisis d'abord un fichier"); return; }
  const oForm = new FormData();
  oForm.append("file", this._oFile, this._oFile.name);
  oForm.append("fileId", this._sEditId);
  BusyIndicator.show(0);
  try {
    const res = await fetch("/manage/file/gd/v1/update", { method: "PATCH", body: oForm });
    if (!res.ok) { throw new Error("HTTP " + res.status); }
    MessageToast.show("Fichier mis à jour");
    this._oUpdateDialog.close();
    this.onRefresh();
  } catch (e) {
    MessageBox.error("Modification impossible : " + e.message);
  } finally {
    BusyIndicator.hide();
  }
},

onUpdateCancel: function () {
  this._oUpdateDialog.close();
},

onRowDelete: function (oEvent) {
  const oFile = oEvent.getSource().getBindingContext().getObject();
  MessageBox.confirm("Supprimer « " + oFile.name + " » de Google Drive ?", {
    actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
    emphasizedAction: MessageBox.Action.DELETE,
    onClose: async (sAction) => {
      if (sAction !== MessageBox.Action.DELETE) { return; }
      BusyIndicator.show(0);
      try {
        const res = await fetch("/manage/file/gd/v1/delete", {
          method: "DELETE",
          headers: { fileId: oFile.id }
        });
        if (!res.ok) { throw new Error("HTTP " + res.status); }
        MessageToast.show("Fichier supprimé");
        this.onRefresh();
      } catch (e) {
        MessageBox.error("Suppression impossible : " + e.message);
      } finally {
        BusyIndicator.hide();
      }
    }
  });
},
onSelectionChange: function (oEvent) {
  if (!oEvent.getParameter("selected")) { return; }
  const oTable = oEvent.getSource();
  const oItem = oEvent.getParameter("listItem");
  oTable.removeSelections(true);      // décoche toutes les lignes
  oTable.setSelectedItem(oItem, true); // recoche uniquement celle qui vient d'être cliquée
}
  });
});