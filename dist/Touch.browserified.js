(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.reactDndTouchBackend = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))

},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TouchBackend = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = createTouchBackend;

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getEventClientTouchOffset(e) {
    if (e.targetTouches.length === 1) {
        return getEventClientOffset(e.targetTouches[0]);
    }
}

function getEventClientOffset(e) {
    if (e.targetTouches) {
        return getEventClientTouchOffset(e);
    } else {
        return {
            x: e.clientX,
            y: e.clientY
        };
    }
}

// Used for MouseEvent.buttons (note the s on the end).
var MouseButtons = {
    Left: 1,
    Right: 2,
    Center: 4

    // Used for e.button (note the lack of an s on the end).
};var MouseButton = {
    Left: 0,
    Center: 1,
    Right: 2

    /**
     * Only touch events and mouse events where the left button is pressed should initiate a drag.
     * @param {MouseEvent | TouchEvent} e The event
     */
};function eventShouldStartDrag(e) {
    // For touch events, button will be undefined. If e.button is defined,
    // then it should be MouseButton.Left.
    return e.button === undefined || e.button === MouseButton.Left;
}

/**
 * Only touch events and mouse events where the left mouse button is no longer held should end a drag.
 * It's possible the user mouse downs with the left mouse button, then mouse down and ups with the right mouse button.
 * We don't want releasing the right mouse button to end the drag.
 * @param {MouseEvent | TouchEvent} e The event
 */
function eventShouldEndDrag(e) {
    // Touch events will have buttons be undefined, while mouse events will have e.buttons's left button
    // bit field unset if the left mouse button has been released
    return e.buttons === undefined || (e.buttons & MouseButtons.Left) === 0;
}

// Polyfill for document.elementsFromPoint
var elementsFromPoint = (typeof document !== 'undefined' && document.elementsFromPoint || function (x, y) {

    if (document.msElementsFromPoint) {
        // msElementsFromPoint is much faster but returns a node-list, so convert it to an array
        var msElements = document.msElementsFromPoint(x, y);
        return msElements && Array.prototype.slice.call(msElements, 0);
    }

    var elements = [],
        previousPointerEvents = [],
        current,
        i,
        d;

    // get all elements via elementFromPoint, and remove them from hit-testing in order
    while ((current = document.elementFromPoint(x, y)) && elements.indexOf(current) === -1 && current !== null) {

        // push the element and its current style
        elements.push(current);
        previousPointerEvents.push({
            value: current.style.getPropertyValue('pointer-events'),
            priority: current.style.getPropertyPriority('pointer-events')
        });

        // add "pointer-events: none", to get to the underlying element
        current.style.setProperty('pointer-events', 'none', 'important');
    }

    // restore the previous pointer-events values
    for (i = previousPointerEvents.length; d = previousPointerEvents[--i];) {
        elements[i].style.setProperty('pointer-events', d.value ? d.value : '', d.priority);
    }

    // return our results
    return elements;
}).bind(typeof document !== 'undefined' ? document : null);

var supportsPassive = function () {
    // simular to jQuery's test
    var supported = false;
    try {
        addEventListener('test', null, Object.defineProperty({}, 'passive', {
            get: function get() {
                supported = true;
            }
        }));
    } catch (e) {}
    return supported;
}();

var ELEMENT_NODE = 1;
function getNodeClientOffset(node) {
    var el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;

    if (!el) {
        return null;
    }

    var _el$getBoundingClient = el.getBoundingClientRect(),
        top = _el$getBoundingClient.top,
        left = _el$getBoundingClient.left;

    return { x: left, y: top };
}

var eventNames = {
    mouse: {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup',
        contextmenu: 'contextmenu'
    },
    touch: {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend'
    },
    keyboard: {
        keydown: 'keydown'
    }
};

var TouchBackend = exports.TouchBackend = function () {
    function TouchBackend(manager) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, TouchBackend);

        options.delayTouchStart = options.delayTouchStart || options.delay;

        options = _extends({
            enableTouchEvents: true,
            enableMouseEvents: false,
            enableKeyboardEvents: false,
            ignoreContextMenu: false,
            delayTouchStart: 0,
            delayMouseStart: 0,
            touchSlop: 0,
            scrollAngleRanges: undefined
        }, options);

        this.actions = manager.getActions();
        this.monitor = manager.getMonitor();
        this.registry = manager.getRegistry();

        this.enableKeyboardEvents = options.enableKeyboardEvents;
        this.enableMouseEvents = options.enableMouseEvents;
        this.delayTouchStart = options.delayTouchStart;
        this.delayMouseStart = options.delayMouseStart;
        this.ignoreContextMenu = options.ignoreContextMenu;
        this.touchSlop = options.touchSlop;
        this.scrollAngleRanges = options.scrollAngleRanges;
        this.sourceNodes = {};
        this.sourceNodeOptions = {};
        this.sourcePreviewNodes = {};
        this.sourcePreviewNodeOptions = {};
        this.targetNodes = {};
        this.targetNodeOptions = {};
        this.listenerTypes = [];
        this._mouseClientOffset = {};
        this._isScrolling = false;

        if (options.enableMouseEvents) {
            this.listenerTypes.push('mouse');
        }

        if (options.enableTouchEvents) {
            this.listenerTypes.push('touch');
        }

        if (options.enableKeyboardEvents) {
            this.listenerTypes.push('keyboard');
        }

        if (options.getDropTargetElementsAtPoint) {
            this.getDropTargetElementsAtPoint = options.getDropTargetElementsAtPoint;
        }

        this.getSourceClientOffset = this.getSourceClientOffset.bind(this);
        this.handleTopMoveStart = this.handleTopMoveStart.bind(this);
        this.handleTopMoveStartDelay = this.handleTopMoveStartDelay.bind(this);
        this.handleTopMoveStartCapture = this.handleTopMoveStartCapture.bind(this);
        this.handleTopMoveCapture = this.handleTopMoveCapture.bind(this);
        this.handleTopMove = this.handleTopMove.bind(this);
        this.handleTopMoveEndCapture = this.handleTopMoveEndCapture.bind(this);
        this.handleCancelOnEscape = this.handleCancelOnEscape.bind(this);
    }

    _createClass(TouchBackend, [{
        key: 'setup',
        value: function setup() {
            if (typeof window === 'undefined') {
                return;
            }

            (0, _invariant2.default)(!this.constructor.isSetUp, 'Cannot have two Touch backends at the same time.');
            this.constructor.isSetUp = true;

            this.addEventListener(window, 'start', this.getTopMoveStartHandler());
            this.addEventListener(window, 'start', this.handleTopMoveStartCapture, true);
            this.addEventListener(window, 'move', this.handleTopMove);
            this.addEventListener(window, 'move', this.handleTopMoveCapture, true);
            this.addEventListener(window, 'end', this.handleTopMoveEndCapture, true);

            if (this.enableMouseEvents && !this.ignoreContextMenu) {
                this.addEventListener(window, 'contextmenu', this.handleTopMoveEndCapture);
            }

            if (this.enableKeyboardEvents) {
                this.addEventListener(window, 'keydown', this.handleCancelOnEscape, true);
            }
        }
    }, {
        key: 'teardown',
        value: function teardown() {
            if (typeof window === 'undefined') {
                return;
            }

            this.constructor.isSetUp = false;
            this._mouseClientOffset = {};

            this.removeEventListener(window, 'start', this.handleTopMoveStartCapture, true);
            this.removeEventListener(window, 'start', this.handleTopMoveStart);
            this.removeEventListener(window, 'move', this.handleTopMoveCapture, true);
            this.removeEventListener(window, 'move', this.handleTopMove);
            this.removeEventListener(window, 'end', this.handleTopMoveEndCapture, true);

            if (this.enableMouseEvents && !this.ignoreContextMenu) {
                this.removeEventListener(window, 'contextmenu', this.handleTopMoveEndCapture);
            }

            if (this.enableKeyboardEvents) {
                this.removeEventListener(window, 'keydown', this.handleCancelOnEscape, true);
            }

            this.uninstallSourceNodeRemovalObserver();
        }
    }, {
        key: 'addEventListener',
        value: function addEventListener(subject, event, handler, capture) {
            var options = supportsPassive ? { capture: capture, passive: false } : capture;

            this.listenerTypes.forEach(function (listenerType) {
                var evt = eventNames[listenerType][event];

                if (evt) {
                    subject.addEventListener(evt, handler, options);
                }
            });
        }
    }, {
        key: 'removeEventListener',
        value: function removeEventListener(subject, event, handler, capture) {
            var options = supportsPassive ? { capture: capture, passive: false } : capture;

            this.listenerTypes.forEach(function (listenerType) {
                var evt = eventNames[listenerType][event];

                if (evt) {
                    subject.removeEventListener(evt, handler, options);
                }
            });
        }
    }, {
        key: 'connectDragSource',
        value: function connectDragSource(sourceId, node, options) {
            var _this = this;

            var handleMoveStart = this.handleMoveStart.bind(this, sourceId);
            this.sourceNodes[sourceId] = node;

            this.addEventListener(node, 'start', handleMoveStart);

            return function () {
                delete _this.sourceNodes[sourceId];
                _this.removeEventListener(node, 'start', handleMoveStart);
            };
        }
    }, {
        key: 'connectDragPreview',
        value: function connectDragPreview(sourceId, node, options) {
            var _this2 = this;

            this.sourcePreviewNodeOptions[sourceId] = options;
            this.sourcePreviewNodes[sourceId] = node;

            return function () {
                delete _this2.sourcePreviewNodes[sourceId];
                delete _this2.sourcePreviewNodeOptions[sourceId];
            };
        }
    }, {
        key: 'connectDropTarget',
        value: function connectDropTarget(targetId, node) {
            var _this3 = this;

            var handleMove = function handleMove(e) {
                var coords = void 0;

                if (!_this3.monitor.isDragging()) {
                    return;
                }

                /**
                 * Grab the coordinates for the current mouse/touch position
                 */
                switch (e.type) {
                    case eventNames.mouse.move:
                        coords = { x: e.clientX, y: e.clientY };
                        break;

                    case eventNames.touch.move:
                        coords = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                        break;
                }

                /**
                 * Use the coordinates to grab the element the drag ended on.
                 * If the element is the same as the target node (or any of it's children) then we have hit a drop target and can handle the move.
                 */
                var droppedOn = document.elementFromPoint(coords.x, coords.y);
                var childMatch = node.contains(droppedOn);

                if (droppedOn === node || childMatch) {
                    return _this3.handleMove(e, targetId);
                }
            };

            /**
             * Attaching the event listener to the body so that touchmove will work while dragging over multiple target elements.
             */
            this.addEventListener(document.querySelector('body'), 'move', handleMove);
            this.targetNodes[targetId] = node;

            return function () {
                delete _this3.targetNodes[targetId];
                _this3.removeEventListener(document.querySelector('body'), 'move', handleMove);
            };
        }
    }, {
        key: 'getSourceClientOffset',
        value: function getSourceClientOffset(sourceId) {
            return getNodeClientOffset(this.sourceNodes[sourceId]);
        }
    }, {
        key: 'handleTopMoveStartCapture',
        value: function handleTopMoveStartCapture(e) {
            if (!eventShouldStartDrag(e)) {
                return;
            }

            this.moveStartSourceIds = [];
        }
    }, {
        key: 'handleMoveStart',
        value: function handleMoveStart(sourceId) {
            // Just because we received an event doesn't necessarily mean we need to collect drag sources.
            // We only collect start collecting drag sources on touch and left mouse events.
            if (Array.isArray(this.moveStartSourceIds)) {
                this.moveStartSourceIds.unshift(sourceId);
            }
        }
    }, {
        key: 'getTopMoveStartHandler',
        value: function getTopMoveStartHandler() {
            if (!this.delayTouchStart && !this.delayMouseStart) {
                return this.handleTopMoveStart;
            }

            return this.handleTopMoveStartDelay;
        }
    }, {
        key: 'handleTopMoveStart',
        value: function handleTopMoveStart(e) {
            if (!eventShouldStartDrag(e)) {
                return;
            }

            // Don't prematurely preventDefault() here since it might:
            // 1. Mess up scrolling
            // 2. Mess up long tap (which brings up context menu)
            // 3. If there's an anchor link as a child, tap won't be triggered on link

            var clientOffset = getEventClientOffset(e);
            if (clientOffset) {
                this._mouseClientOffset = clientOffset;
            }
            this.waitingForDelay = false;
        }
    }, {
        key: 'handleTopMoveStartDelay',
        value: function handleTopMoveStartDelay(e) {
            if (!eventShouldStartDrag(e)) {
                return;
            }

            var delay = e.type === eventNames.touch.start ? this.delayTouchStart : this.delayMouseStart;
            this.timeout = setTimeout(this.handleTopMoveStart.bind(this, e), delay);
            this.waitingForDelay = true;
        }
    }, {
        key: 'handleTopMoveCapture',
        value: function handleTopMoveCapture(e) {
            this.dragOverTargetIds = [];
        }
    }, {
        key: 'handleMove',
        value: function handleMove(e, targetId) {
            this.dragOverTargetIds.unshift(targetId);
        }
    }, {
        key: 'handleTopMove',
        value: function handleTopMove(e) {
            var _this4 = this;

            clearTimeout(this.timeout);
            if (this.waitingForDelay) {
                return;
            }

            var moveStartSourceIds = this.moveStartSourceIds,
                dragOverTargetIds = this.dragOverTargetIds;

            var clientOffset = getEventClientOffset(e);

            if (!clientOffset) {
                return;
            }

            // If the touch move started as a scroll, or is is between the scroll angles
            if (this._isScrolling || !this.monitor.isDragging() && inAngleRanges(this._mouseClientOffset.x, this._mouseClientOffset.y, clientOffset.x, clientOffset.y, this.scrollAngleRanges)) {
                this._isScrolling = true;
                return;
            }

            // If we're not dragging and we've moved a little, that counts as a drag start
            if (!this.monitor.isDragging() && this._mouseClientOffset.hasOwnProperty('x') && moveStartSourceIds && distance(this._mouseClientOffset.x, this._mouseClientOffset.y, clientOffset.x, clientOffset.y) > (this.touchSlop ? this.touchSlop : 0)) {
                this.moveStartSourceIds = null;
                this.actions.beginDrag(moveStartSourceIds, {
                    clientOffset: this._mouseClientOffset,
                    getSourceClientOffset: this.getSourceClientOffset,
                    publishSource: false
                });
            }

            if (!this.monitor.isDragging()) {
                return;
            }

            var sourceNode = this.sourceNodes[this.monitor.getSourceId()];
            this.installSourceNodeRemovalObserver(sourceNode);
            this.actions.publishDragSource();

            e.preventDefault();

            // Get the node elements of the hovered DropTargets
            var dragOverTargetNodes = dragOverTargetIds.map(function (key) {
                return _this4.targetNodes[key];
            });
            // Get the a ordered list of nodes that are touched by
            var elementsAtPoint = this.getDropTargetElementsAtPoint ? this.getDropTargetElementsAtPoint(clientOffset.x, clientOffset.y, dragOverTargetNodes) : elementsFromPoint(clientOffset.x, clientOffset.y);
            // Extend list with SVG parents that are not receiving elementsFromPoint events (svg groups)
            var elementsAtPointExtended = [];
            for (var nodeId in elementsAtPoint) {
                var currentNode = elementsAtPoint[nodeId];
                elementsAtPointExtended.push(currentNode);
                // Is currentNode an SVG element
                while (currentNode && currentNode.ownerSVGElement) {
                    currentNode = currentNode.parentElement;
                    if (!elementsAtPointExtended.includes(currentNode)) elementsAtPointExtended.push(currentNode);
                }
            }
            var orderedDragOverTargetIds = elementsAtPointExtended
            // Filter off nodes that arent a hovered DropTargets nodes
            .filter(function (node) {
                return dragOverTargetNodes.indexOf(node) > -1;
            })
            // Map back the nodes elements to targetIds
            .map(function (node) {
                for (var targetId in _this4.targetNodes) {
                    if (node === _this4.targetNodes[targetId]) return targetId;
                }
                return null;
            })
            // Filter off possible null rows
            .filter(function (node) {
                return !!node;
            }).filter(function (id, index, ids) {
                return ids.indexOf(id) === index;
            });

            // Reverse order because dnd-core reverse it before calling the DropTarget drop methods
            orderedDragOverTargetIds.reverse();

            this.actions.hover(orderedDragOverTargetIds, {
                clientOffset: clientOffset
            });
        }
    }, {
        key: 'handleTopMoveEndCapture',
        value: function handleTopMoveEndCapture(e) {
            this._isScrolling = false;

            if (!eventShouldEndDrag(e)) {
                return;
            }

            if (!this.monitor.isDragging() || this.monitor.didDrop()) {
                this.moveStartSourceIds = null;
                return;
            }

            e.preventDefault();

            this._mouseClientOffset = {};

            this.uninstallSourceNodeRemovalObserver();
            this.actions.drop();
            this.actions.endDrag();
        }
    }, {
        key: 'handleCancelOnEscape',
        value: function handleCancelOnEscape(e) {
            if (e.key === 'Escape') {
                this._mouseClientOffset = {};

                this.uninstallSourceNodeRemovalObserver();
                this.actions.endDrag();
            }
        }
    }, {
        key: 'handleOnContextMenu',
        value: function handleOnContextMenu() {
            this.moveStartSourceIds = null;
        }
    }, {
        key: 'installSourceNodeRemovalObserver',
        value: function installSourceNodeRemovalObserver(node) {
            var _this5 = this;

            this.uninstallSourceNodeRemovalObserver();

            this.draggedSourceNode = node;
            this.draggedSourceNodeRemovalObserver = new window.MutationObserver(function () {
                if (!node.parentElement) {
                    _this5.resurrectSourceNode();
                    _this5.uninstallSourceNodeRemovalObserver();
                }
            });

            if (!node || !node.parentElement) {
                return;
            }

            this.draggedSourceNodeRemovalObserver.observe(node.parentElement, { childList: true });
        }
    }, {
        key: 'resurrectSourceNode',
        value: function resurrectSourceNode() {
            this.draggedSourceNode.style.display = 'none';
            this.draggedSourceNode.removeAttribute('data-reactid');
            document.body.appendChild(this.draggedSourceNode);
        }
    }, {
        key: 'uninstallSourceNodeRemovalObserver',
        value: function uninstallSourceNodeRemovalObserver() {
            if (this.draggedSourceNodeRemovalObserver) {
                this.draggedSourceNodeRemovalObserver.disconnect();
            }

            this.draggedSourceNodeRemovalObserver = null;
            this.draggedSourceNode = null;
        }
    }]);

    return TouchBackend;
}();

function createTouchBackend() {
    var optionsOrManager = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var touchBackendFactory = function touchBackendFactory(manager) {
        return new TouchBackend(manager, optionsOrManager);
    };

    if (optionsOrManager.getMonitor) {
        return touchBackendFactory(optionsOrManager);
    } else {
        return touchBackendFactory;
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2));
}

function inAngleRanges(x1, y1, x2, y2, angleRanges) {
    if (angleRanges == null) {
        return false;
    }

    var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 180;

    for (var i = 0; i < angleRanges.length; ++i) {
        if ((angleRanges[i].start == null || angle >= angleRanges[i].start) && (angleRanges[i].end == null || angle <= angleRanges[i].end)) {
            return true;
        }
    }

    return false;
}

},{"invariant":1}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaW52YXJpYW50L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL1RvdWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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OztBQUVELFdBQU8sS0FBUDtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVc2UgaW52YXJpYW50KCkgdG8gYXNzZXJ0IHN0YXRlIHdoaWNoIHlvdXIgcHJvZ3JhbSBhc3N1bWVzIHRvIGJlIHRydWUuXG4gKlxuICogUHJvdmlkZSBzcHJpbnRmLXN0eWxlIGZvcm1hdCAob25seSAlcyBpcyBzdXBwb3J0ZWQpIGFuZCBhcmd1bWVudHNcbiAqIHRvIHByb3ZpZGUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBicm9rZSBhbmQgd2hhdCB5b3Ugd2VyZVxuICogZXhwZWN0aW5nLlxuICpcbiAqIFRoZSBpbnZhcmlhbnQgbWVzc2FnZSB3aWxsIGJlIHN0cmlwcGVkIGluIHByb2R1Y3Rpb24sIGJ1dCB0aGUgaW52YXJpYW50XG4gKiB3aWxsIHJlbWFpbiB0byBlbnN1cmUgbG9naWMgZG9lcyBub3QgZGlmZmVyIGluIHByb2R1Y3Rpb24uXG4gKi9cblxudmFyIGludmFyaWFudCA9IGZ1bmN0aW9uKGNvbmRpdGlvbiwgZm9ybWF0LCBhLCBiLCBjLCBkLCBlLCBmKSB7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFyaWFudCByZXF1aXJlcyBhbiBlcnJvciBtZXNzYWdlIGFyZ3VtZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgZm9ybWF0LnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJnc1thcmdJbmRleCsrXTsgfSlcbiAgICAgICk7XG4gICAgICBlcnJvci5uYW1lID0gJ0ludmFyaWFudCBWaW9sYXRpb24nO1xuICAgIH1cblxuICAgIGVycm9yLmZyYW1lc1RvUG9wID0gMTsgLy8gd2UgZG9uJ3QgY2FyZSBhYm91dCBpbnZhcmlhbnQncyBvd24gZnJhbWVcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnZhcmlhbnQ7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSwgWWFob28gSW5jLlxuICogQ29weXJpZ2h0cyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdpbnZhcmlhbnQnO1xuXG5mdW5jdGlvbiBnZXRFdmVudENsaWVudFRvdWNoT2Zmc2V0IChlKSB7XG4gICAgaWYgKGUudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGdldEV2ZW50Q2xpZW50T2Zmc2V0KGUudGFyZ2V0VG91Y2hlc1swXSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRFdmVudENsaWVudE9mZnNldCAoZSkge1xuICAgIGlmIChlLnRhcmdldFRvdWNoZXMpIHtcbiAgICAgICAgcmV0dXJuIGdldEV2ZW50Q2xpZW50VG91Y2hPZmZzZXQoZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgIHk6IGUuY2xpZW50WVxuICAgICAgICB9O1xuICAgIH1cbn1cblxuLy8gVXNlZCBmb3IgTW91c2VFdmVudC5idXR0b25zIChub3RlIHRoZSBzIG9uIHRoZSBlbmQpLlxuY29uc3QgTW91c2VCdXR0b25zID0ge1xuICAgIExlZnQ6IDEsXG4gICAgUmlnaHQ6IDIsXG4gICAgQ2VudGVyOiA0XG59XG5cbi8vIFVzZWQgZm9yIGUuYnV0dG9uIChub3RlIHRoZSBsYWNrIG9mIGFuIHMgb24gdGhlIGVuZCkuXG5jb25zdCBNb3VzZUJ1dHRvbiA9IHtcbiAgICBMZWZ0OiAwLFxuICAgIENlbnRlcjogMSxcbiAgICBSaWdodDogMlxufVxuXG4vKipcbiAqIE9ubHkgdG91Y2ggZXZlbnRzIGFuZCBtb3VzZSBldmVudHMgd2hlcmUgdGhlIGxlZnQgYnV0dG9uIGlzIHByZXNzZWQgc2hvdWxkIGluaXRpYXRlIGEgZHJhZy5cbiAqIEBwYXJhbSB7TW91c2VFdmVudCB8IFRvdWNoRXZlbnR9IGUgVGhlIGV2ZW50XG4gKi9cbmZ1bmN0aW9uIGV2ZW50U2hvdWxkU3RhcnREcmFnKGUpIHtcbiAgICAvLyBGb3IgdG91Y2ggZXZlbnRzLCBidXR0b24gd2lsbCBiZSB1bmRlZmluZWQuIElmIGUuYnV0dG9uIGlzIGRlZmluZWQsXG4gICAgLy8gdGhlbiBpdCBzaG91bGQgYmUgTW91c2VCdXR0b24uTGVmdC5cbiAgICByZXR1cm4gZS5idXR0b24gPT09IHVuZGVmaW5lZCB8fCBlLmJ1dHRvbiA9PT0gTW91c2VCdXR0b24uTGVmdDtcbn1cblxuLyoqXG4gKiBPbmx5IHRvdWNoIGV2ZW50cyBhbmQgbW91c2UgZXZlbnRzIHdoZXJlIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBpcyBubyBsb25nZXIgaGVsZCBzaG91bGQgZW5kIGEgZHJhZy5cbiAqIEl0J3MgcG9zc2libGUgdGhlIHVzZXIgbW91c2UgZG93bnMgd2l0aCB0aGUgbGVmdCBtb3VzZSBidXR0b24sIHRoZW4gbW91c2UgZG93biBhbmQgdXBzIHdpdGggdGhlIHJpZ2h0IG1vdXNlIGJ1dHRvbi5cbiAqIFdlIGRvbid0IHdhbnQgcmVsZWFzaW5nIHRoZSByaWdodCBtb3VzZSBidXR0b24gdG8gZW5kIHRoZSBkcmFnLlxuICogQHBhcmFtIHtNb3VzZUV2ZW50IHwgVG91Y2hFdmVudH0gZSBUaGUgZXZlbnRcbiAqL1xuZnVuY3Rpb24gZXZlbnRTaG91bGRFbmREcmFnKGUpIHtcbiAgICAvLyBUb3VjaCBldmVudHMgd2lsbCBoYXZlIGJ1dHRvbnMgYmUgdW5kZWZpbmVkLCB3aGlsZSBtb3VzZSBldmVudHMgd2lsbCBoYXZlIGUuYnV0dG9ucydzIGxlZnQgYnV0dG9uXG4gICAgLy8gYml0IGZpZWxkIHVuc2V0IGlmIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBoYXMgYmVlbiByZWxlYXNlZFxuICAgIHJldHVybiBlLmJ1dHRvbnMgPT09IHVuZGVmaW5lZCB8fCAoZS5idXR0b25zICYgTW91c2VCdXR0b25zLkxlZnQpID09PSAwO1xufVxuXG4vLyBQb2x5ZmlsbCBmb3IgZG9jdW1lbnQuZWxlbWVudHNGcm9tUG9pbnRcbmNvbnN0IGVsZW1lbnRzRnJvbVBvaW50ID0gKCh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmVsZW1lbnRzRnJvbVBvaW50KSB8fCBmdW5jdGlvbiAoeCx5KSB7XG5cbiAgICBpZiAoZG9jdW1lbnQubXNFbGVtZW50c0Zyb21Qb2ludCkge1xuICAgICAgICAvLyBtc0VsZW1lbnRzRnJvbVBvaW50IGlzIG11Y2ggZmFzdGVyIGJ1dCByZXR1cm5zIGEgbm9kZS1saXN0LCBzbyBjb252ZXJ0IGl0IHRvIGFuIGFycmF5XG4gICAgICAgIGNvbnN0IG1zRWxlbWVudHMgPSBkb2N1bWVudC5tc0VsZW1lbnRzRnJvbVBvaW50KHgsIHkpO1xuICAgICAgICByZXR1cm4gbXNFbGVtZW50cyAmJiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChtc0VsZW1lbnRzLCAwKTtcbiAgICB9XG5cbiAgICB2YXIgZWxlbWVudHMgPSBbXSwgcHJldmlvdXNQb2ludGVyRXZlbnRzID0gW10sIGN1cnJlbnQsIGksIGQ7XG5cbiAgICAvLyBnZXQgYWxsIGVsZW1lbnRzIHZpYSBlbGVtZW50RnJvbVBvaW50LCBhbmQgcmVtb3ZlIHRoZW0gZnJvbSBoaXQtdGVzdGluZyBpbiBvcmRlclxuICAgIHdoaWxlICgoY3VycmVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCx5KSkgJiYgZWxlbWVudHMuaW5kZXhPZihjdXJyZW50KSA9PT0gLTEgJiYgY3VycmVudCAhPT0gbnVsbCkge1xuXG4gICAgICAvLyBwdXNoIHRoZSBlbGVtZW50IGFuZCBpdHMgY3VycmVudCBzdHlsZVxuICAgIFx0ZWxlbWVudHMucHVzaChjdXJyZW50KTtcbiAgICBcdHByZXZpb3VzUG9pbnRlckV2ZW50cy5wdXNoKHtcbiAgICAgICAgICB2YWx1ZTogY3VycmVudC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwb2ludGVyLWV2ZW50cycpLFxuICAgICAgICAgIHByaW9yaXR5OiBjdXJyZW50LnN0eWxlLmdldFByb3BlcnR5UHJpb3JpdHkoJ3BvaW50ZXItZXZlbnRzJylcbiAgICAgIH0pO1xuXG4gICAgICAvLyBhZGQgXCJwb2ludGVyLWV2ZW50czogbm9uZVwiLCB0byBnZXQgdG8gdGhlIHVuZGVybHlpbmcgZWxlbWVudFxuICAgIFx0Y3VycmVudC5zdHlsZS5zZXRQcm9wZXJ0eSgncG9pbnRlci1ldmVudHMnLCAnbm9uZScsICdpbXBvcnRhbnQnKTtcbiAgICB9XG5cbiAgICAvLyByZXN0b3JlIHRoZSBwcmV2aW91cyBwb2ludGVyLWV2ZW50cyB2YWx1ZXNcbiAgICBmb3IoaSA9IHByZXZpb3VzUG9pbnRlckV2ZW50cy5sZW5ndGg7IGQ9cHJldmlvdXNQb2ludGVyRXZlbnRzWy0taV07ICkge1xuICAgIFx0ZWxlbWVudHNbaV0uc3R5bGUuc2V0UHJvcGVydHkoJ3BvaW50ZXItZXZlbnRzJywgZC52YWx1ZSA/IGQudmFsdWU6ICcnLCBkLnByaW9yaXR5KTtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gb3VyIHJlc3VsdHNcbiAgICByZXR1cm4gZWxlbWVudHM7XG5cbn0pLmJpbmQodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyA/IGRvY3VtZW50IDogbnVsbCk7XG5cbmNvbnN0IHN1cHBvcnRzUGFzc2l2ZSA9ICgoKSA9PiB7XG4gICAgLy8gc2ltdWxhciB0byBqUXVlcnkncyB0ZXN0XG4gICAgbGV0IHN1cHBvcnRlZCA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBudWxsLCBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge2dldCAoKSB7IHN1cHBvcnRlZCA9IHRydWU7IH19KSk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICByZXR1cm4gc3VwcG9ydGVkO1xufSkoKTtcblxuXG5jb25zdCBFTEVNRU5UX05PREUgPSAxO1xuZnVuY3Rpb24gZ2V0Tm9kZUNsaWVudE9mZnNldCAobm9kZSkge1xuICAgIGNvbnN0IGVsID0gbm9kZS5ub2RlVHlwZSA9PT0gRUxFTUVOVF9OT0RFXG4gICAgICAgID8gbm9kZVxuICAgICAgICA6IG5vZGUucGFyZW50RWxlbWVudDtcblxuICAgIGlmICghZWwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgeyB0b3AsIGxlZnQgfSA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiB7IHg6IGxlZnQsIHk6IHRvcCB9O1xufVxuXG5jb25zdCBldmVudE5hbWVzID0ge1xuICAgIG1vdXNlOiB7XG4gICAgICAgIHN0YXJ0OiAnbW91c2Vkb3duJyxcbiAgICAgICAgbW92ZTogJ21vdXNlbW92ZScsXG4gICAgICAgIGVuZDogJ21vdXNldXAnLFxuICAgICAgICBjb250ZXh0bWVudTogJ2NvbnRleHRtZW51J1xuICAgIH0sXG4gICAgdG91Y2g6IHtcbiAgICAgICAgc3RhcnQ6ICd0b3VjaHN0YXJ0JyxcbiAgICAgICAgbW92ZTogJ3RvdWNobW92ZScsXG4gICAgICAgIGVuZDogJ3RvdWNoZW5kJ1xuICAgIH0sXG4gICAga2V5Ym9hcmQ6IHtcbiAgICAgICAga2V5ZG93bjogJ2tleWRvd24nXG4gICAgfVxufTtcblxuZXhwb3J0IGNsYXNzIFRvdWNoQmFja2VuZCB7XG4gICAgY29uc3RydWN0b3IgKG1hbmFnZXIsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBvcHRpb25zLmRlbGF5VG91Y2hTdGFydCA9IG9wdGlvbnMuZGVsYXlUb3VjaFN0YXJ0IHx8IG9wdGlvbnMuZGVsYXk7XG5cbiAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGVuYWJsZVRvdWNoRXZlbnRzOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlTW91c2VFdmVudHM6IGZhbHNlLFxuICAgICAgICAgICAgZW5hYmxlS2V5Ym9hcmRFdmVudHM6IGZhbHNlLFxuICAgICAgICAgICAgaWdub3JlQ29udGV4dE1lbnU6IGZhbHNlLFxuICAgICAgICAgICAgZGVsYXlUb3VjaFN0YXJ0OiAwLFxuICAgICAgICAgICAgZGVsYXlNb3VzZVN0YXJ0OiAwLFxuICAgICAgICAgICAgdG91Y2hTbG9wOiAwLFxuICAgICAgICAgICAgc2Nyb2xsQW5nbGVSYW5nZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC4uLm9wdGlvbnNcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFjdGlvbnMgPSBtYW5hZ2VyLmdldEFjdGlvbnMoKTtcbiAgICAgICAgdGhpcy5tb25pdG9yID0gbWFuYWdlci5nZXRNb25pdG9yKCk7XG4gICAgICAgIHRoaXMucmVnaXN0cnkgPSBtYW5hZ2VyLmdldFJlZ2lzdHJ5KCk7XG5cbiAgICAgICAgdGhpcy5lbmFibGVLZXlib2FyZEV2ZW50cyA9IG9wdGlvbnMuZW5hYmxlS2V5Ym9hcmRFdmVudHM7XG4gICAgICAgIHRoaXMuZW5hYmxlTW91c2VFdmVudHMgPSBvcHRpb25zLmVuYWJsZU1vdXNlRXZlbnRzO1xuICAgICAgICB0aGlzLmRlbGF5VG91Y2hTdGFydCA9IG9wdGlvbnMuZGVsYXlUb3VjaFN0YXJ0O1xuICAgICAgICB0aGlzLmRlbGF5TW91c2VTdGFydCA9IG9wdGlvbnMuZGVsYXlNb3VzZVN0YXJ0O1xuICAgICAgICB0aGlzLmlnbm9yZUNvbnRleHRNZW51ID0gb3B0aW9ucy5pZ25vcmVDb250ZXh0TWVudTtcbiAgICAgICAgdGhpcy50b3VjaFNsb3AgPSBvcHRpb25zLnRvdWNoU2xvcDtcbiAgICAgICAgdGhpcy5zY3JvbGxBbmdsZVJhbmdlcyA9IG9wdGlvbnMuc2Nyb2xsQW5nbGVSYW5nZXM7XG4gICAgICAgIHRoaXMuc291cmNlTm9kZXMgPSB7fTtcbiAgICAgICAgdGhpcy5zb3VyY2VOb2RlT3B0aW9ucyA9IHt9O1xuICAgICAgICB0aGlzLnNvdXJjZVByZXZpZXdOb2RlcyA9IHt9O1xuICAgICAgICB0aGlzLnNvdXJjZVByZXZpZXdOb2RlT3B0aW9ucyA9IHt9O1xuICAgICAgICB0aGlzLnRhcmdldE5vZGVzID0ge307XG4gICAgICAgIHRoaXMudGFyZ2V0Tm9kZU9wdGlvbnMgPSB7fTtcbiAgICAgICAgdGhpcy5saXN0ZW5lclR5cGVzID0gW107XG4gICAgICAgIHRoaXMuX21vdXNlQ2xpZW50T2Zmc2V0ID0ge307XG4gICAgICAgIHRoaXMuX2lzU2Nyb2xsaW5nID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZW5hYmxlTW91c2VFdmVudHMpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJUeXBlcy5wdXNoKCdtb3VzZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZW5hYmxlVG91Y2hFdmVudHMpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJUeXBlcy5wdXNoKCd0b3VjaCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZW5hYmxlS2V5Ym9hcmRFdmVudHMpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJUeXBlcy5wdXNoKCdrZXlib2FyZCcpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5nZXREcm9wVGFyZ2V0RWxlbWVudHNBdFBvaW50KSB7XG4gICAgICAgICAgICB0aGlzLmdldERyb3BUYXJnZXRFbGVtZW50c0F0UG9pbnQgPSBvcHRpb25zLmdldERyb3BUYXJnZXRFbGVtZW50c0F0UG9pbnQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdldFNvdXJjZUNsaWVudE9mZnNldCA9IHRoaXMuZ2V0U291cmNlQ2xpZW50T2Zmc2V0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0ID0gdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnREZWxheSA9IHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0RGVsYXkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnRDYXB0dXJlID0gdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnRDYXB0dXJlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZUNhcHR1cmUgPSB0aGlzLmhhbmRsZVRvcE1vdmVDYXB0dXJlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZSA9IHRoaXMuaGFuZGxlVG9wTW92ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRsZVRvcE1vdmVFbmRDYXB0dXJlID0gdGhpcy5oYW5kbGVUb3BNb3ZlRW5kQ2FwdHVyZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRsZUNhbmNlbE9uRXNjYXBlID0gdGhpcy5oYW5kbGVDYW5jZWxPbkVzY2FwZS5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIHNldHVwICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpbnZhcmlhbnQoIXRoaXMuY29uc3RydWN0b3IuaXNTZXRVcCwgJ0Nhbm5vdCBoYXZlIHR3byBUb3VjaCBiYWNrZW5kcyBhdCB0aGUgc2FtZSB0aW1lLicpO1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmlzU2V0VXAgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3csICdzdGFydCcsICAgICAgdGhpcy5nZXRUb3BNb3ZlU3RhcnRIYW5kbGVyKCkpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAnc3RhcnQnLCAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0Q2FwdHVyZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3csICdtb3ZlJywgICAgICAgdGhpcy5oYW5kbGVUb3BNb3ZlKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHdpbmRvdywgJ21vdmUnLCAgICAgICB0aGlzLmhhbmRsZVRvcE1vdmVDYXB0dXJlLCB0cnVlKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHdpbmRvdywgJ2VuZCcsICAgICAgICB0aGlzLmhhbmRsZVRvcE1vdmVFbmRDYXB0dXJlLCB0cnVlKTtcblxuICAgICAgICBpZiAodGhpcy5lbmFibGVNb3VzZUV2ZW50cyAmJiAhdGhpcy5pZ25vcmVDb250ZXh0TWVudSkge1xuICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHdpbmRvdywgJ2NvbnRleHRtZW51JywgdGhpcy5oYW5kbGVUb3BNb3ZlRW5kQ2FwdHVyZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5lbmFibGVLZXlib2FyZEV2ZW50cyl7XG4gICAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAna2V5ZG93bicsIHRoaXMuaGFuZGxlQ2FuY2VsT25Fc2NhcGUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGVhcmRvd24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuaXNTZXRVcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9tb3VzZUNsaWVudE9mZnNldCA9IHt9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3csICdzdGFydCcsIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0Q2FwdHVyZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3csICdzdGFydCcsIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0KTtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHdpbmRvdywgJ21vdmUnLCAgdGhpcy5oYW5kbGVUb3BNb3ZlQ2FwdHVyZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3csICdtb3ZlJywgIHRoaXMuaGFuZGxlVG9wTW92ZSk7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3csICdlbmQnLCAgIHRoaXMuaGFuZGxlVG9wTW92ZUVuZENhcHR1cmUsIHRydWUpO1xuXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZU1vdXNlRXZlbnRzICYmICF0aGlzLmlnbm9yZUNvbnRleHRNZW51KSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIod2luZG93LCAnY29udGV4dG1lbnUnLCB0aGlzLmhhbmRsZVRvcE1vdmVFbmRDYXB0dXJlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZUtleWJvYXJkRXZlbnRzKXtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3csICdrZXlkb3duJywgdGhpcy5oYW5kbGVDYW5jZWxPbkVzY2FwZSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVuaW5zdGFsbFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIoKTtcbiAgICB9XG5cbiAgICBhZGRFdmVudExpc3RlbmVyIChzdWJqZWN0LCBldmVudCwgaGFuZGxlciwgY2FwdHVyZSkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gc3VwcG9ydHNQYXNzaXZlID8ge2NhcHR1cmUsIHBhc3NpdmU6IGZhbHNlfSA6IGNhcHR1cmU7XG5cbiAgICAgICAgdGhpcy5saXN0ZW5lclR5cGVzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyVHlwZSkge1xuICAgICAgICAgICAgY29uc3QgZXZ0ID0gZXZlbnROYW1lc1tsaXN0ZW5lclR5cGVdW2V2ZW50XTtcblxuICAgICAgICAgICAgaWYgKGV2dCkge1xuICAgICAgICAgICAgICAgIHN1YmplY3QuYWRkRXZlbnRMaXN0ZW5lcihldnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW1vdmVFdmVudExpc3RlbmVyIChzdWJqZWN0LCBldmVudCwgaGFuZGxlciwgY2FwdHVyZSkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gc3VwcG9ydHNQYXNzaXZlID8ge2NhcHR1cmUsIHBhc3NpdmU6IGZhbHNlfSA6IGNhcHR1cmU7XG5cbiAgICAgICAgdGhpcy5saXN0ZW5lclR5cGVzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyVHlwZSkge1xuICAgICAgICAgICAgY29uc3QgZXZ0ID0gZXZlbnROYW1lc1tsaXN0ZW5lclR5cGVdW2V2ZW50XTtcblxuICAgICAgICAgICAgaWYgKGV2dCkge1xuICAgICAgICAgICAgICAgIHN1YmplY3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihldnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25uZWN0RHJhZ1NvdXJjZSAoc291cmNlSWQsIG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlTW92ZVN0YXJ0ID0gdGhpcy5oYW5kbGVNb3ZlU3RhcnQuYmluZCh0aGlzLCBzb3VyY2VJZCk7XG4gICAgICAgIHRoaXMuc291cmNlTm9kZXNbc291cmNlSWRdID0gbm9kZTtcblxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIobm9kZSwgJ3N0YXJ0JywgaGFuZGxlTW92ZVN0YXJ0KTtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuc291cmNlTm9kZXNbc291cmNlSWRdO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG5vZGUsICdzdGFydCcsIGhhbmRsZU1vdmVTdGFydCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29ubmVjdERyYWdQcmV2aWV3IChzb3VyY2VJZCwgbm9kZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLnNvdXJjZVByZXZpZXdOb2RlT3B0aW9uc1tzb3VyY2VJZF0gPSBvcHRpb25zO1xuICAgICAgICB0aGlzLnNvdXJjZVByZXZpZXdOb2Rlc1tzb3VyY2VJZF0gPSBub2RlO1xuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zb3VyY2VQcmV2aWV3Tm9kZXNbc291cmNlSWRdO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuc291cmNlUHJldmlld05vZGVPcHRpb25zW3NvdXJjZUlkXTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25uZWN0RHJvcFRhcmdldCAodGFyZ2V0SWQsIG5vZGUpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlTW92ZSA9IChlKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29vcmRzO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMubW9uaXRvci5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR3JhYiB0aGUgY29vcmRpbmF0ZXMgZm9yIHRoZSBjdXJyZW50IG1vdXNlL3RvdWNoIHBvc2l0aW9uXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHN3aXRjaCAoZS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIGV2ZW50TmFtZXMubW91c2UubW92ZTpcbiAgICAgICAgICAgICAgICBjb29yZHMgPSB7IHg6IGUuY2xpZW50WCwgeTogZS5jbGllbnRZIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgZXZlbnROYW1lcy50b3VjaC5tb3ZlOlxuICAgICAgICAgICAgICAgIGNvb3JkcyA9IHsgeDogZS50b3VjaGVzWzBdLmNsaWVudFgsIHk6IGUudG91Y2hlc1swXS5jbGllbnRZIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVXNlIHRoZSBjb29yZGluYXRlcyB0byBncmFiIHRoZSBlbGVtZW50IHRoZSBkcmFnIGVuZGVkIG9uLlxuICAgICAgICAgICAgICogSWYgdGhlIGVsZW1lbnQgaXMgdGhlIHNhbWUgYXMgdGhlIHRhcmdldCBub2RlIChvciBhbnkgb2YgaXQncyBjaGlsZHJlbikgdGhlbiB3ZSBoYXZlIGhpdCBhIGRyb3AgdGFyZ2V0IGFuZCBjYW4gaGFuZGxlIHRoZSBtb3ZlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBsZXQgZHJvcHBlZE9uID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChjb29yZHMueCwgY29vcmRzLnkpO1xuICAgICAgICAgICAgbGV0IGNoaWxkTWF0Y2ggPSBub2RlLmNvbnRhaW5zKGRyb3BwZWRPbik7XG5cbiAgICAgICAgICAgIGlmIChkcm9wcGVkT24gPT09IG5vZGUgfHwgY2hpbGRNYXRjaCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZU1vdmUoZSwgdGFyZ2V0SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBdHRhY2hpbmcgdGhlIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBib2R5IHNvIHRoYXQgdG91Y2htb3ZlIHdpbGwgd29yayB3aGlsZSBkcmFnZ2luZyBvdmVyIG11bHRpcGxlIHRhcmdldCBlbGVtZW50cy5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JyksICdtb3ZlJywgaGFuZGxlTW92ZSk7XG4gICAgICAgIHRoaXMudGFyZ2V0Tm9kZXNbdGFyZ2V0SWRdID0gbm9kZTtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMudGFyZ2V0Tm9kZXNbdGFyZ2V0SWRdO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSwgJ21vdmUnLCBoYW5kbGVNb3ZlKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRTb3VyY2VDbGllbnRPZmZzZXQgKHNvdXJjZUlkKSB7XG4gICAgICAgIHJldHVybiBnZXROb2RlQ2xpZW50T2Zmc2V0KHRoaXMuc291cmNlTm9kZXNbc291cmNlSWRdKTtcbiAgICB9XG5cbiAgICBoYW5kbGVUb3BNb3ZlU3RhcnRDYXB0dXJlIChlKSB7XG4gICAgICAgIGlmICghZXZlbnRTaG91bGRTdGFydERyYWcoZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubW92ZVN0YXJ0U291cmNlSWRzID0gW107XG4gICAgfVxuXG4gICAgaGFuZGxlTW92ZVN0YXJ0IChzb3VyY2VJZCkge1xuICAgICAgICAvLyBKdXN0IGJlY2F1c2Ugd2UgcmVjZWl2ZWQgYW4gZXZlbnQgZG9lc24ndCBuZWNlc3NhcmlseSBtZWFuIHdlIG5lZWQgdG8gY29sbGVjdCBkcmFnIHNvdXJjZXMuXG4gICAgICAgIC8vIFdlIG9ubHkgY29sbGVjdCBzdGFydCBjb2xsZWN0aW5nIGRyYWcgc291cmNlcyBvbiB0b3VjaCBhbmQgbGVmdCBtb3VzZSBldmVudHMuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMubW92ZVN0YXJ0U291cmNlSWRzKSkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlU3RhcnRTb3VyY2VJZHMudW5zaGlmdChzb3VyY2VJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRUb3BNb3ZlU3RhcnRIYW5kbGVyICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRlbGF5VG91Y2hTdGFydCAmJiAhdGhpcy5kZWxheU1vdXNlU3RhcnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVRvcE1vdmVTdGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVRvcE1vdmVTdGFydERlbGF5O1xuICAgIH1cblxuICAgIGhhbmRsZVRvcE1vdmVTdGFydCAoZSkge1xuICAgICAgICBpZiAoIWV2ZW50U2hvdWxkU3RhcnREcmFnKGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEb24ndCBwcmVtYXR1cmVseSBwcmV2ZW50RGVmYXVsdCgpIGhlcmUgc2luY2UgaXQgbWlnaHQ6XG4gICAgICAgIC8vIDEuIE1lc3MgdXAgc2Nyb2xsaW5nXG4gICAgICAgIC8vIDIuIE1lc3MgdXAgbG9uZyB0YXAgKHdoaWNoIGJyaW5ncyB1cCBjb250ZXh0IG1lbnUpXG4gICAgICAgIC8vIDMuIElmIHRoZXJlJ3MgYW4gYW5jaG9yIGxpbmsgYXMgYSBjaGlsZCwgdGFwIHdvbid0IGJlIHRyaWdnZXJlZCBvbiBsaW5rXG5cbiAgICAgICAgY29uc3QgY2xpZW50T2Zmc2V0ID0gZ2V0RXZlbnRDbGllbnRPZmZzZXQoZSk7XG4gICAgICAgIGlmIChjbGllbnRPZmZzZXQpIHtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlQ2xpZW50T2Zmc2V0ID0gY2xpZW50T2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud2FpdGluZ0ZvckRlbGF5ID0gZmFsc2VcbiAgICB9XG5cbiAgICBoYW5kbGVUb3BNb3ZlU3RhcnREZWxheSAoZSkge1xuICAgICAgICBpZiAoIWV2ZW50U2hvdWxkU3RhcnREcmFnKGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWxheSA9IChlLnR5cGUgPT09IGV2ZW50TmFtZXMudG91Y2guc3RhcnQpXG4gICAgICAgICAgICA/IHRoaXMuZGVsYXlUb3VjaFN0YXJ0XG4gICAgICAgICAgICA6IHRoaXMuZGVsYXlNb3VzZVN0YXJ0O1xuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0LmJpbmQodGhpcywgZSksIGRlbGF5KTtcbiAgICAgICAgdGhpcy53YWl0aW5nRm9yRGVsYXkgPSB0cnVlXG4gICAgfVxuXG4gICAgaGFuZGxlVG9wTW92ZUNhcHR1cmUgKGUpIHtcbiAgICAgICAgdGhpcy5kcmFnT3ZlclRhcmdldElkcyA9IFtdO1xuICAgIH1cblxuICAgIGhhbmRsZU1vdmUoIGUsIHRhcmdldElkICkge1xuICAgICAgICB0aGlzLmRyYWdPdmVyVGFyZ2V0SWRzLnVuc2hpZnQoIHRhcmdldElkICk7XG4gICAgfVxuXG4gICAgaGFuZGxlVG9wTW92ZSAoZSkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgaWYgKHRoaXMud2FpdGluZ0ZvckRlbGF5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IG1vdmVTdGFydFNvdXJjZUlkcywgZHJhZ092ZXJUYXJnZXRJZHMgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGNsaWVudE9mZnNldCA9IGdldEV2ZW50Q2xpZW50T2Zmc2V0KGUpO1xuXG4gICAgICAgIGlmICghY2xpZW50T2Zmc2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgdG91Y2ggbW92ZSBzdGFydGVkIGFzIGEgc2Nyb2xsLCBvciBpcyBpcyBiZXR3ZWVuIHRoZSBzY3JvbGwgYW5nbGVzXG4gICAgICAgIGlmICh0aGlzLl9pc1Njcm9sbGluZyB8fCAoIXRoaXMubW9uaXRvci5pc0RyYWdnaW5nKCkgJiZcbiAgICAgICAgICAgIGluQW5nbGVSYW5nZXModGhpcy5fbW91c2VDbGllbnRPZmZzZXQueCwgdGhpcy5fbW91c2VDbGllbnRPZmZzZXQueSwgY2xpZW50T2Zmc2V0LngsIGNsaWVudE9mZnNldC55LFxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsQW5nbGVSYW5nZXMpKSkge1xuICAgICAgICAgICAgdGhpcy5faXNTY3JvbGxpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2UncmUgbm90IGRyYWdnaW5nIGFuZCB3ZSd2ZSBtb3ZlZCBhIGxpdHRsZSwgdGhhdCBjb3VudHMgYXMgYSBkcmFnIHN0YXJ0XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICF0aGlzLm1vbml0b3IuaXNEcmFnZ2luZygpICYmXG4gICAgICAgICAgICB0aGlzLl9tb3VzZUNsaWVudE9mZnNldC5oYXNPd25Qcm9wZXJ0eSgneCcpICYmXG4gICAgICAgICAgICBtb3ZlU3RhcnRTb3VyY2VJZHMgJiYgXG4gICAgICAgICAgICBkaXN0YW5jZSh0aGlzLl9tb3VzZUNsaWVudE9mZnNldC54LCB0aGlzLl9tb3VzZUNsaWVudE9mZnNldC55LCBjbGllbnRPZmZzZXQueCwgY2xpZW50T2Zmc2V0LnkpID5cbiAgICAgICAgICAgICAgICAodGhpcy50b3VjaFNsb3AgPyB0aGlzLnRvdWNoU2xvcCA6IDApKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVTdGFydFNvdXJjZUlkcyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmFjdGlvbnMuYmVnaW5EcmFnKG1vdmVTdGFydFNvdXJjZUlkcywge1xuICAgICAgICAgICAgICAgIGNsaWVudE9mZnNldDogdGhpcy5fbW91c2VDbGllbnRPZmZzZXQsXG4gICAgICAgICAgICAgICAgZ2V0U291cmNlQ2xpZW50T2Zmc2V0OiB0aGlzLmdldFNvdXJjZUNsaWVudE9mZnNldCxcbiAgICAgICAgICAgICAgICBwdWJsaXNoU291cmNlOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMubW9uaXRvci5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNvdXJjZU5vZGUgPSB0aGlzLnNvdXJjZU5vZGVzW3RoaXMubW9uaXRvci5nZXRTb3VyY2VJZCgpXTtcbiAgICAgICAgdGhpcy5pbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlcihzb3VyY2VOb2RlKTtcbiAgICAgICAgdGhpcy5hY3Rpb25zLnB1Ymxpc2hEcmFnU291cmNlKCk7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIC8vIEdldCB0aGUgbm9kZSBlbGVtZW50cyBvZiB0aGUgaG92ZXJlZCBEcm9wVGFyZ2V0c1xuICAgICAgICBjb25zdCBkcmFnT3ZlclRhcmdldE5vZGVzID0gZHJhZ092ZXJUYXJnZXRJZHMubWFwKGtleSA9PiB0aGlzLnRhcmdldE5vZGVzW2tleV0pO1xuICAgICAgICAvLyBHZXQgdGhlIGEgb3JkZXJlZCBsaXN0IG9mIG5vZGVzIHRoYXQgYXJlIHRvdWNoZWQgYnlcbiAgICAgICAgbGV0IGVsZW1lbnRzQXRQb2ludCA9IHRoaXMuZ2V0RHJvcFRhcmdldEVsZW1lbnRzQXRQb2ludFxuICAgICAgICAgID8gdGhpcy5nZXREcm9wVGFyZ2V0RWxlbWVudHNBdFBvaW50KGNsaWVudE9mZnNldC54LCBjbGllbnRPZmZzZXQueSwgZHJhZ092ZXJUYXJnZXROb2RlcylcbiAgICAgICAgICA6IGVsZW1lbnRzRnJvbVBvaW50KGNsaWVudE9mZnNldC54LCBjbGllbnRPZmZzZXQueSk7XG4gICAgICAgIC8vIEV4dGVuZCBsaXN0IHdpdGggU1ZHIHBhcmVudHMgdGhhdCBhcmUgbm90IHJlY2VpdmluZyBlbGVtZW50c0Zyb21Qb2ludCBldmVudHMgKHN2ZyBncm91cHMpXG4gICAgICAgIGxldCBlbGVtZW50c0F0UG9pbnRFeHRlbmRlZCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBub2RlSWQgaW4gZWxlbWVudHNBdFBvaW50KXtcbiAgICAgICAgICAgIGxldCBjdXJyZW50Tm9kZSA9IGVsZW1lbnRzQXRQb2ludFtub2RlSWRdO1xuICAgICAgICAgICAgZWxlbWVudHNBdFBvaW50RXh0ZW5kZWQucHVzaChjdXJyZW50Tm9kZSk7XG4gICAgICAgICAgICAvLyBJcyBjdXJyZW50Tm9kZSBhbiBTVkcgZWxlbWVudFxuICAgICAgICAgICAgd2hpbGUoY3VycmVudE5vZGUgJiYgY3VycmVudE5vZGUub3duZXJTVkdFbGVtZW50KXtcbiAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYoICFlbGVtZW50c0F0UG9pbnRFeHRlbmRlZC5pbmNsdWRlcyhjdXJyZW50Tm9kZSkgKSBlbGVtZW50c0F0UG9pbnRFeHRlbmRlZC5wdXNoKGN1cnJlbnROb2RlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCBvcmRlcmVkRHJhZ092ZXJUYXJnZXRJZHMgPSBlbGVtZW50c0F0UG9pbnRFeHRlbmRlZFxuICAgICAgICAgIC8vIEZpbHRlciBvZmYgbm9kZXMgdGhhdCBhcmVudCBhIGhvdmVyZWQgRHJvcFRhcmdldHMgbm9kZXNcbiAgICAgICAgICAuZmlsdGVyKG5vZGUgPT4gZHJhZ092ZXJUYXJnZXROb2Rlcy5pbmRleE9mKG5vZGUpID4gLTEpXG4gICAgICAgICAgLy8gTWFwIGJhY2sgdGhlIG5vZGVzIGVsZW1lbnRzIHRvIHRhcmdldElkc1xuICAgICAgICAgIC5tYXAobm9kZSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCB0YXJnZXRJZCBpbiB0aGlzLnRhcmdldE5vZGVzKSB7XG4gICAgICAgICAgICAgIGlmIChub2RlID09PSB0aGlzLnRhcmdldE5vZGVzW3RhcmdldElkXSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0SWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vIEZpbHRlciBvZmYgcG9zc2libGUgbnVsbCByb3dzXG4gICAgICAgICAgLmZpbHRlcihub2RlID0+ICEhbm9kZSlcbiAgICAgICAgICAuZmlsdGVyKChpZCwgaW5kZXgsIGlkcykgPT4gaWRzLmluZGV4T2YoaWQpID09PSBpbmRleCk7XG5cbiAgICAgICAgLy8gUmV2ZXJzZSBvcmRlciBiZWNhdXNlIGRuZC1jb3JlIHJldmVyc2UgaXQgYmVmb3JlIGNhbGxpbmcgdGhlIERyb3BUYXJnZXQgZHJvcCBtZXRob2RzXG4gICAgICAgIG9yZGVyZWREcmFnT3ZlclRhcmdldElkcy5yZXZlcnNlKCk7XG5cbiAgICAgICAgdGhpcy5hY3Rpb25zLmhvdmVyKG9yZGVyZWREcmFnT3ZlclRhcmdldElkcywge1xuICAgICAgICAgICAgY2xpZW50T2Zmc2V0OiBjbGllbnRPZmZzZXRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaGFuZGxlVG9wTW92ZUVuZENhcHR1cmUgKGUpIHtcbiAgICAgICAgdGhpcy5faXNTY3JvbGxpbmcgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIWV2ZW50U2hvdWxkRW5kRHJhZyhlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLm1vbml0b3IuaXNEcmFnZ2luZygpIHx8IHRoaXMubW9uaXRvci5kaWREcm9wKCkpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZVN0YXJ0U291cmNlSWRzID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0aGlzLl9tb3VzZUNsaWVudE9mZnNldCA9IHt9O1xuXG4gICAgICAgIHRoaXMudW5pbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlcigpO1xuICAgICAgICB0aGlzLmFjdGlvbnMuZHJvcCgpO1xuICAgICAgICB0aGlzLmFjdGlvbnMuZW5kRHJhZygpO1xuICAgIH1cblxuICAgIGhhbmRsZUNhbmNlbE9uRXNjYXBlIChlKSB7XG4gICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpe1xuICAgICAgICAgICAgdGhpcy5fbW91c2VDbGllbnRPZmZzZXQgPSB7fTtcblxuICAgICAgICAgICAgdGhpcy51bmluc3RhbGxTb3VyY2VOb2RlUmVtb3ZhbE9ic2VydmVyKCk7XG4gICAgICAgICAgICB0aGlzLmFjdGlvbnMuZW5kRHJhZygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlT25Db250ZXh0TWVudSAoKSB7XG4gICAgICAgIHRoaXMubW92ZVN0YXJ0U291cmNlSWRzID0gbnVsbDtcbiAgICB9XG5cbiAgICBpbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlciAobm9kZSkge1xuICAgICAgICB0aGlzLnVuaW5zdGFsbFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIoKTtcblxuICAgICAgICB0aGlzLmRyYWdnZWRTb3VyY2VOb2RlID0gbm9kZTtcbiAgICAgICAgdGhpcy5kcmFnZ2VkU291cmNlTm9kZVJlbW92YWxPYnNlcnZlciA9IG5ldyB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIW5vZGUucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdXJyZWN0U291cmNlTm9kZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMudW5pbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcmFnZ2VkU291cmNlTm9kZVJlbW92YWxPYnNlcnZlci5vYnNlcnZlKFxuICAgICAgICAgICAgbm9kZS5wYXJlbnRFbGVtZW50LFxuICAgICAgICAgICAgeyBjaGlsZExpc3Q6IHRydWUgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlc3VycmVjdFNvdXJjZU5vZGUgKCkge1xuICAgICAgICB0aGlzLmRyYWdnZWRTb3VyY2VOb2RlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGUucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXJlYWN0aWQnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRyYWdnZWRTb3VyY2VOb2RlKTtcbiAgICB9XG5cbiAgICB1bmluc3RhbGxTb3VyY2VOb2RlUmVtb3ZhbE9ic2VydmVyICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcmFnZ2VkU291cmNlTm9kZVJlbW92YWxPYnNlcnZlciA9IG51bGw7XG4gICAgICAgIHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGUgPSBudWxsO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlVG91Y2hCYWNrZW5kIChvcHRpb25zT3JNYW5hZ2VyID0ge30pIHtcbiAgICBjb25zdCB0b3VjaEJhY2tlbmRGYWN0b3J5ID0gZnVuY3Rpb24gKG1hbmFnZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUb3VjaEJhY2tlbmQobWFuYWdlciwgb3B0aW9uc09yTWFuYWdlcik7XG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zT3JNYW5hZ2VyLmdldE1vbml0b3IpIHtcbiAgICAgICAgcmV0dXJuIHRvdWNoQmFja2VuZEZhY3Rvcnkob3B0aW9uc09yTWFuYWdlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRvdWNoQmFja2VuZEZhY3Rvcnk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkaXN0YW5jZSh4MSwgeTEsIHgyLCB5Mikge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coTWF0aC5hYnMoeDIgLSB4MSksIDIpICsgTWF0aC5wb3coTWF0aC5hYnMoeTIgLSB5MSksIDIpKTtcbn1cblxuZnVuY3Rpb24gaW5BbmdsZVJhbmdlcyh4MSwgeTEsIHgyLCB5MiwgYW5nbGVSYW5nZXMpIHtcbiAgICBpZiAoYW5nbGVSYW5nZXMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKHkyIC0geTEsIHgyIC0geDEpICogMTgwIC8gTWF0aC5QSSArIDE4MDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYW5nbGVSYW5nZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgKGFuZ2xlUmFuZ2VzW2ldLnN0YXJ0ID09IG51bGwgfHwgYW5nbGUgPj0gYW5nbGVSYW5nZXNbaV0uc3RhcnQpICYmXG4gICAgICAgICAgICAoYW5nbGVSYW5nZXNbaV0uZW5kID09IG51bGwgfHwgYW5nbGUgPD0gYW5nbGVSYW5nZXNbaV0uZW5kKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuIl19
