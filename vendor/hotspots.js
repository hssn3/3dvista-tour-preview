/* Hotspot overlay for the tour editor and exported tours.
 *
 * Pannellum 2.5.6 creates its own hotspot DOM nodes, but their painting depends
 * on its internal world transform; we draw our own layer instead so the marker
 * is always visible, styleable and testable.
 *
 *   TDVHotspots.attach(viewer, hotspots, onActivate)
 *
 * hotspots: [{yaw, pitch, label, target}]
 * onActivate: function(hotspot) - called on click
 */
(function () {
  "use strict";

  function norm(deg) {
    while (deg > 180) deg -= 360;
    while (deg < -180) deg += 360;
    return deg;
  }

  function attach(viewer, hotspots, onActivate) {
    var container = viewer.getContainer();
    if (!container) return null;

    var layer = container.querySelector(".tdv-hs-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "tdv-hs-layer";
      layer.style.cssText =
        "position:absolute;inset:0;pointer-events:none;z-index:4;overflow:hidden";
      container.appendChild(layer);
    }
    layer.innerHTML = "";

    var dots = hotspots.map(function (hs, i) {
      var el = document.createElement("div");
      el.className = "tdv-hs";
      el.style.cssText =
        "position:absolute;pointer-events:auto;cursor:pointer;transform:translate(-50%,-50%);" +
        "background:#4aa3ff;color:#04121f;border:2px solid #fff;border-radius:14px;" +
        "height:26px;min-width:26px;display:flex;align-items:center;justify-content:center;" +
        "font:600 11px/1 Tahoma,Arial,sans-serif;padding:0 8px;box-shadow:0 2px 8px rgba(0,0,0,.45);" +
        "white-space:nowrap;user-select:none";
      el.textContent = hs.label || "↗";
      el.title = hs.label || "";
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        if (onActivate) onActivate(hs);
      });
      layer.appendChild(el);
      return el;
    });

    function render() {
      var w = container.clientWidth || 1;
      var h = container.clientHeight || 1;
      var hfov = viewer.getHfov();
      var vy = viewer.getYaw();
      var vp = viewer.getPitch();
      var vfov = (2 * Math.atan(Math.tan((hfov * Math.PI) / 360) * (h / w)) * 180) / Math.PI;

      for (var i = 0; i < dots.length; i++) {
        var hs = hotspots[i];
        var dy = norm(hs.yaw - vy);
        var dp = hs.pitch - vp;
        var visible = Math.abs(dy) < hfov * 0.62 && Math.abs(dp) < vfov * 0.62;
        var el = dots[i];
        if (!visible) {
          el.style.display = "none";
          continue;
        }
        el.style.display = "flex";
        var x = w * (0.5 + dy / hfov);
        var y = h * (0.5 - dp / vfov);
        el.style.left = x.toFixed(1) + "px";
        el.style.top = y.toFixed(1) + "px";
      }
      window.requestAnimationFrame(render);
    }

    render();
    return layer;
  }

  window.TDVHotspots = { attach: attach };
})();
