sap.ui.define(["sap/ui/core/Theming"], function (Theming) {
  "use strict";
  const KEY = "drivemanager.prefs";
  const DEFAULTS = { theme: "sap_horizon", pageSize: 50 };

  return {
    DEFAULTS: DEFAULTS,
    load: function () {
      try {
        return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || "{}"));
      } catch (e) {
        return Object.assign({}, DEFAULTS);
      }
    },
    save: function (oPrefs) {
      try { localStorage.setItem(KEY, JSON.stringify(oPrefs)); } catch (e) { /* ignoré */ }
    },
    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignoré */ }
    },
    applyTheme: function (sTheme) {
      Theming.setTheme(sTheme);
    }
  };
});