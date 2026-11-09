/*
Technitium DNS Server — modern web console helpers
Adds sidebar icons, toggles the app shell, and keeps Chart.js in sync with the active theme.
Licensed under GPL-3.0-or-later, same as the upstream project.
*/

(function () {
    "use strict";

    var NAV_ICONS = {
        "#mainPanelTabPaneDashboard": "fa-tachometer",
        "#mainPanelTabPaneZones": "fa-globe",
        "#mainPanelTabPaneCachedZones": "fa-database",
        "#mainPanelTabPaneAllowedZones": "fa-check-circle-o",
        "#mainPanelTabPaneBlockedZones": "fa-ban",
        "#mainPanelTabPaneApps": "fa-puzzle-piece",
        "#mainPanelTabPaneDnsClient": "fa-search",
        "#mainPanelTabPaneSettings": "fa-sliders",
        "#mainPanelTabPaneDhcp": "fa-sitemap",
        "#mainPanelTabPaneAdmin": "fa-users",
        "#mainPanelTabPaneLogs": "fa-list-alt",
        "#mainPanelTabPaneAbout": "fa-info-circle"
    };

    function addNavIcons() {
        var links = document.querySelectorAll("ul.main-nav > li > a");
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            if (a.querySelector(".nav-icon"))
                continue;

            var icon = NAV_ICONS[a.getAttribute("href")] || "fa-circle-o";
            var el = document.createElement("i");
            el.className = "fa " + icon + " nav-icon";
            el.setAttribute("aria-hidden", "true");
            a.insertBefore(el, a.firstChild);
            a.setAttribute("title", a.textContent.trim());
        }
    }

    function syncShell() {
        var main = document.getElementById("pageMain");
        var visible = !!main && main.style.display !== "none" && getComputedStyle(main).display !== "none";
        document.body.classList.toggle("has-sidebar", visible);
    }

    function cssVar(name) {
        return getComputedStyle(document.body).getPropertyValue(name).trim();
    }

    function applyChartTheme() {
        if (typeof Chart === "undefined" || !Chart.defaults || !Chart.defaults.global)
            return;

        var text = cssVar("--muted") || "#6b7384";
        var grid = cssVar("--chart-grid") || "rgba(0,0,0,0.07)";
        var font = cssVar("--font") || "sans-serif";

        Chart.defaults.global.defaultFontFamily = font;
        Chart.defaults.global.defaultFontColor = text;
        if (Chart.defaults.scale && Chart.defaults.scale.gridLines) {
            Chart.defaults.scale.gridLines.color = grid;
            Chart.defaults.scale.gridLines.zeroLineColor = grid;
        }

        var charts = [window.chartDashboardMain, window.chartDashboardPie, window.chartDashboardPie2, window.chartDashboardPie3];
        for (var i = 0; i < charts.length; i++) {
            var c = charts[i];
            if (!c || !c.options)
                continue;

            if (c.options.legend && c.options.legend.labels)
                c.options.legend.labels.fontColor = text;

            if (c.options.title)
                c.options.title.fontColor = text;

            if (c.options.scales) {
                ["xAxes", "yAxes"].forEach(function (k) {
                    (c.options.scales[k] || []).forEach(function (axis) {
                        if (axis.ticks) axis.ticks.fontColor = text;
                        if (axis.gridLines) { axis.gridLines.color = grid; axis.gridLines.zeroLineColor = grid; }
                    });
                });
            }

            try { c.update(); } catch (e) { /* chart may be mid-destroy */ }
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        addNavIcons();
        syncShell();
        applyChartTheme();

        var main = document.getElementById("pageMain");
        if (main)
            new MutationObserver(syncShell).observe(main, { attributes: true, attributeFilter: ["style", "class"] });

        new MutationObserver(applyChartTheme).observe(document.body, { attributes: true, attributeFilter: ["class"] });

        // charts are (re)created on every dashboard refresh; re-apply once they exist
        var lastMain = null;
        setInterval(function () {
            if (window.chartDashboardMain && window.chartDashboardMain !== lastMain) {
                lastMain = window.chartDashboardMain;
                applyChartTheme();
            }
        }, 500);
    });
})();
