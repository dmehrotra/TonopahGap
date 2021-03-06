
var SM = SM || { count: 0 };
SM.inframe = (window.top !== window);

var retries = 3;

function injectNewMaps() {
    var elem = document.getElementById('content-container');
    if (elem) {
        new TonopahMap(elem, ScrollableMap.TYPE_NEWWEB, SM.count++);
    } else if (retries > 0) {
        // Retry a few times because the new map canvas is not installed on DOM load
        retries--;
        setTimeout(injectNewMaps, 1000);
    }
}

function injectFrame() {
    // Don't activate this thing at all if the frame has no map
    var elem = document.getElementById('map');
    elem = elem || document.getElementById('mapDiv');
    if (elem) {
        new TonopahMap(elem, (SM.inframe) ? ScrollableMap.TYPE_IFRAME : ScrollableMap.TYPE_WEB, SM.count++);
    } else if (!SM.inframe) {
        injectNewMaps();
    }
}

window.addEventListener('DOMContentLoaded', injectFrame, false);
