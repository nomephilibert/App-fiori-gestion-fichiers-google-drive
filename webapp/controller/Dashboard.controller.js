sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
  "use strict";

  function typeLabel(m) {
    m = m || "";
    if (m === "application/pdf") { return "PDF"; }
    if (m === "application/vnd.google-apps.spreadsheet") { return "Google Sheets"; }
    if (m === "application/vnd.google-apps.document") { return "Google Docs"; }
    if (m === "application/vnd.google-apps.presentation") { return "Google Slides"; }
    if (m === "application/vnd.google-apps.folder") { return "Dossier"; }
    if (m.startsWith("video/")) { return "Vidéo"; }
    if (m.startsWith("image/")) { return "Image"; }
    if (m.includes("wordprocessingml")) { return "Word"; }
    if (m.includes("spreadsheetml")) { return "Excel"; }
    return "Autre";
  }

  return Controller.extend("com.poc.drivemanager.controller.Dashboard", {
    onInit: function () {
      this.getView().setModel(new JSONModel({ total: 0, types: [] }), "dash");
      this.getOwnerComponent().getRouter().getRoute("dashboard")
        .attachPatternMatched(this._load, this);
    },
    _load: async function () {
      try {
        const res = await fetch("/manage/file/gd/v1/list", { headers: { Accept: "application/json" } });
        if (!res.ok) { throw new Error("HTTP " + res.status); }
        const aFiles = (await res.json()).files || [];
        const mCount = {};
        aFiles.forEach(f => {
          const s = typeLabel(f.mimeType);
          mCount[s] = (mCount[s] || 0) + 1;
        });
        const aTypes = Object.keys(mCount)
          .map(s => ({
            label: s,
            count: mCount[s],
            percent: Math.round(mCount[s] * 100 / aFiles.length)
          }))
          .sort((a, b) => b.count - a.count);
        const aTiles = [{ label: "Nombre total de fichiers", count: aFiles.length, kind: "total" }]
  .concat(aTypes.map(t => ({ label: t.label, count: t.count, kind: "type" })));
this.getView().getModel("dash").setData({ total: aFiles.length, types: aTypes, tiles: aTiles });
      } catch (e) {
        MessageToast.show("Erreur de chargement : " + e.message);
      }
    }
  });
});