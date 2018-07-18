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

        this.useAllTargetNodes = options.useAllTargetNodes;

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
            if (!this.useAllTargetNodes) {
                this.addEventListener(window, 'move', this.handleTopMoveCapture, true);
            }
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
            if (!this.useAllTargetNodes) {
                this.removeEventListener(window, 'move', this.handleTopMoveCapture, true);
            }
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
                // the purpose is to add the targetId to dragOverTargetIds when the
                // current touch point is in the node or its children
                // this is inefficient since it gets called for every drop target,
                // and elementFromPoint is inefficient and returns the same
                // note: dragOverTargetIds gets emptied by the topMoveCaptureHandler
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
            if (!this.useAllTargetNodes) {
                this.addEventListener(document.querySelector('body'), 'move', handleMove);
            }
            this.targetNodes[targetId] = node;

            return function () {
                delete _this3.targetNodes[targetId];
                if (!_this3.useAllTargetNodes) {
                    _this3.removeEventListener(document.querySelector('body'), 'move', handleMove);
                }
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
            var dragOverTargetNodes = this.useAllTargetNodes ? Object.values(this.targetNodes) : dragOverTargetIds.map(function (key) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaW52YXJpYW50L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL1RvdWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QTFDLEdBQStDLEdBQTdEOztBQUVBLFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxZQUFZLE1BQWhDLEVBQXdDLEVBQUUsQ0FBMUMsRUFBNkM7QUFDekMsWUFDSSxDQUFDLFlBQVksQ0FBWixFQUFlLEtBQWYsSUFBd0IsSUFBeEIsSUFBZ0MsU0FBUyxZQUFZLENBQVosRUFBZSxLQUF6RCxNQUNDLFlBQVksQ0FBWixFQUFlLEdBQWYsSUFBc0IsSUFBdEIsSUFBOEIsU0FBUyxZQUFZLENBQVosRUFBZSxHQUR2RCxDQURKLEVBR0U7QUFDRSxtQkFBTyxJQUFQO0FBQ0g7QUFDSjs7QUFFRCxXQUFPLEtBQVA7QUFDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXNlIGludmFyaWFudCgpIHRvIGFzc2VydCBzdGF0ZSB3aGljaCB5b3VyIHByb2dyYW0gYXNzdW1lcyB0byBiZSB0cnVlLlxuICpcbiAqIFByb3ZpZGUgc3ByaW50Zi1zdHlsZSBmb3JtYXQgKG9ubHkgJXMgaXMgc3VwcG9ydGVkKSBhbmQgYXJndW1lbnRzXG4gKiB0byBwcm92aWRlIGluZm9ybWF0aW9uIGFib3V0IHdoYXQgYnJva2UgYW5kIHdoYXQgeW91IHdlcmVcbiAqIGV4cGVjdGluZy5cbiAqXG4gKiBUaGUgaW52YXJpYW50IG1lc3NhZ2Ugd2lsbCBiZSBzdHJpcHBlZCBpbiBwcm9kdWN0aW9uLCBidXQgdGhlIGludmFyaWFudFxuICogd2lsbCByZW1haW4gdG8gZW5zdXJlIGxvZ2ljIGRvZXMgbm90IGRpZmZlciBpbiBwcm9kdWN0aW9uLlxuICovXG5cbnZhciBpbnZhcmlhbnQgPSBmdW5jdGlvbihjb25kaXRpb24sIGZvcm1hdCwgYSwgYiwgYywgZCwgZSwgZikge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhcmlhbnQgcmVxdWlyZXMgYW4gZXJyb3IgbWVzc2FnZSBhcmd1bWVudCcpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgdmFyIGVycm9yO1xuICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICdNaW5pZmllZCBleGNlcHRpb24gb2NjdXJyZWQ7IHVzZSB0aGUgbm9uLW1pbmlmaWVkIGRldiBlbnZpcm9ubWVudCAnICtcbiAgICAgICAgJ2ZvciB0aGUgZnVsbCBlcnJvciBtZXNzYWdlIGFuZCBhZGRpdGlvbmFsIGhlbHBmdWwgd2FybmluZ3MuJ1xuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFyZ3MgPSBbYSwgYiwgYywgZCwgZSwgZl07XG4gICAgICB2YXIgYXJnSW5kZXggPSAwO1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgIGZvcm1hdC5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3NbYXJnSW5kZXgrK107IH0pXG4gICAgICApO1xuICAgICAgZXJyb3IubmFtZSA9ICdJbnZhcmlhbnQgVmlvbGF0aW9uJztcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTUsIFlhaG9vIEluYy5cbiAqIENvcHlyaWdodHMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgdGhlIGFjY29tcGFueWluZyBMSUNFTlNFIGZpbGUgZm9yIHRlcm1zLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnaW52YXJpYW50JztcblxuZnVuY3Rpb24gZ2V0RXZlbnRDbGllbnRUb3VjaE9mZnNldCAoZSkge1xuICAgIGlmIChlLnRhcmdldFRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiBnZXRFdmVudENsaWVudE9mZnNldChlLnRhcmdldFRvdWNoZXNbMF0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnRDbGllbnRPZmZzZXQgKGUpIHtcbiAgICBpZiAoZS50YXJnZXRUb3VjaGVzKSB7XG4gICAgICAgIHJldHVybiBnZXRFdmVudENsaWVudFRvdWNoT2Zmc2V0KGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBlLmNsaWVudFgsXG4gICAgICAgICAgICB5OiBlLmNsaWVudFlcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbi8vIFVzZWQgZm9yIE1vdXNlRXZlbnQuYnV0dG9ucyAobm90ZSB0aGUgcyBvbiB0aGUgZW5kKS5cbmNvbnN0IE1vdXNlQnV0dG9ucyA9IHtcbiAgICBMZWZ0OiAxLFxuICAgIFJpZ2h0OiAyLFxuICAgIENlbnRlcjogNFxufVxuXG4vLyBVc2VkIGZvciBlLmJ1dHRvbiAobm90ZSB0aGUgbGFjayBvZiBhbiBzIG9uIHRoZSBlbmQpLlxuY29uc3QgTW91c2VCdXR0b24gPSB7XG4gICAgTGVmdDogMCxcbiAgICBDZW50ZXI6IDEsXG4gICAgUmlnaHQ6IDJcbn1cblxuLyoqXG4gKiBPbmx5IHRvdWNoIGV2ZW50cyBhbmQgbW91c2UgZXZlbnRzIHdoZXJlIHRoZSBsZWZ0IGJ1dHRvbiBpcyBwcmVzc2VkIHNob3VsZCBpbml0aWF0ZSBhIGRyYWcuXG4gKiBAcGFyYW0ge01vdXNlRXZlbnQgfCBUb3VjaEV2ZW50fSBlIFRoZSBldmVudFxuICovXG5mdW5jdGlvbiBldmVudFNob3VsZFN0YXJ0RHJhZyhlKSB7XG4gICAgLy8gRm9yIHRvdWNoIGV2ZW50cywgYnV0dG9uIHdpbGwgYmUgdW5kZWZpbmVkLiBJZiBlLmJ1dHRvbiBpcyBkZWZpbmVkLFxuICAgIC8vIHRoZW4gaXQgc2hvdWxkIGJlIE1vdXNlQnV0dG9uLkxlZnQuXG4gICAgcmV0dXJuIGUuYnV0dG9uID09PSB1bmRlZmluZWQgfHwgZS5idXR0b24gPT09IE1vdXNlQnV0dG9uLkxlZnQ7XG59XG5cbi8qKlxuICogT25seSB0b3VjaCBldmVudHMgYW5kIG1vdXNlIGV2ZW50cyB3aGVyZSB0aGUgbGVmdCBtb3VzZSBidXR0b24gaXMgbm8gbG9uZ2VyIGhlbGQgc2hvdWxkIGVuZCBhIGRyYWcuXG4gKiBJdCdzIHBvc3NpYmxlIHRoZSB1c2VyIG1vdXNlIGRvd25zIHdpdGggdGhlIGxlZnQgbW91c2UgYnV0dG9uLCB0aGVuIG1vdXNlIGRvd24gYW5kIHVwcyB3aXRoIHRoZSByaWdodCBtb3VzZSBidXR0b24uXG4gKiBXZSBkb24ndCB3YW50IHJlbGVhc2luZyB0aGUgcmlnaHQgbW91c2UgYnV0dG9uIHRvIGVuZCB0aGUgZHJhZy5cbiAqIEBwYXJhbSB7TW91c2VFdmVudCB8IFRvdWNoRXZlbnR9IGUgVGhlIGV2ZW50XG4gKi9cbmZ1bmN0aW9uIGV2ZW50U2hvdWxkRW5kRHJhZyhlKSB7XG4gICAgLy8gVG91Y2ggZXZlbnRzIHdpbGwgaGF2ZSBidXR0b25zIGJlIHVuZGVmaW5lZCwgd2hpbGUgbW91c2UgZXZlbnRzIHdpbGwgaGF2ZSBlLmJ1dHRvbnMncyBsZWZ0IGJ1dHRvblxuICAgIC8vIGJpdCBmaWVsZCB1bnNldCBpZiB0aGUgbGVmdCBtb3VzZSBidXR0b24gaGFzIGJlZW4gcmVsZWFzZWRcbiAgICByZXR1cm4gZS5idXR0b25zID09PSB1bmRlZmluZWQgfHwgKGUuYnV0dG9ucyAmIE1vdXNlQnV0dG9ucy5MZWZ0KSA9PT0gMDtcbn1cblxuLy8gUG9seWZpbGwgZm9yIGRvY3VtZW50LmVsZW1lbnRzRnJvbVBvaW50XG5jb25zdCBlbGVtZW50c0Zyb21Qb2ludCA9ICgodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5lbGVtZW50c0Zyb21Qb2ludCkgfHwgZnVuY3Rpb24gKHgseSkge1xuXG4gICAgaWYgKGRvY3VtZW50Lm1zRWxlbWVudHNGcm9tUG9pbnQpIHtcbiAgICAgICAgLy8gbXNFbGVtZW50c0Zyb21Qb2ludCBpcyBtdWNoIGZhc3RlciBidXQgcmV0dXJucyBhIG5vZGUtbGlzdCwgc28gY29udmVydCBpdCB0byBhbiBhcnJheVxuICAgICAgICBjb25zdCBtc0VsZW1lbnRzID0gZG9jdW1lbnQubXNFbGVtZW50c0Zyb21Qb2ludCh4LCB5KTtcbiAgICAgICAgcmV0dXJuIG1zRWxlbWVudHMgJiYgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobXNFbGVtZW50cywgMCk7XG4gICAgfVxuXG4gICAgdmFyIGVsZW1lbnRzID0gW10sIHByZXZpb3VzUG9pbnRlckV2ZW50cyA9IFtdLCBjdXJyZW50LCBpLCBkO1xuXG4gICAgLy8gZ2V0IGFsbCBlbGVtZW50cyB2aWEgZWxlbWVudEZyb21Qb2ludCwgYW5kIHJlbW92ZSB0aGVtIGZyb20gaGl0LXRlc3RpbmcgaW4gb3JkZXJcbiAgICB3aGlsZSAoKGN1cnJlbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgseSkpICYmIGVsZW1lbnRzLmluZGV4T2YoY3VycmVudCkgPT09IC0xICYmIGN1cnJlbnQgIT09IG51bGwpIHtcblxuICAgICAgLy8gcHVzaCB0aGUgZWxlbWVudCBhbmQgaXRzIGN1cnJlbnQgc3R5bGVcbiAgICBcdGVsZW1lbnRzLnB1c2goY3VycmVudCk7XG4gICAgXHRwcmV2aW91c1BvaW50ZXJFdmVudHMucHVzaCh7XG4gICAgICAgICAgdmFsdWU6IGN1cnJlbnQuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncG9pbnRlci1ldmVudHMnKSxcbiAgICAgICAgICBwcmlvcml0eTogY3VycmVudC5zdHlsZS5nZXRQcm9wZXJ0eVByaW9yaXR5KCdwb2ludGVyLWV2ZW50cycpXG4gICAgICB9KTtcblxuICAgICAgLy8gYWRkIFwicG9pbnRlci1ldmVudHM6IG5vbmVcIiwgdG8gZ2V0IHRvIHRoZSB1bmRlcmx5aW5nIGVsZW1lbnRcbiAgICBcdGN1cnJlbnQuc3R5bGUuc2V0UHJvcGVydHkoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnLCAnaW1wb3J0YW50Jyk7XG4gICAgfVxuXG4gICAgLy8gcmVzdG9yZSB0aGUgcHJldmlvdXMgcG9pbnRlci1ldmVudHMgdmFsdWVzXG4gICAgZm9yKGkgPSBwcmV2aW91c1BvaW50ZXJFdmVudHMubGVuZ3RoOyBkPXByZXZpb3VzUG9pbnRlckV2ZW50c1stLWldOyApIHtcbiAgICBcdGVsZW1lbnRzW2ldLnN0eWxlLnNldFByb3BlcnR5KCdwb2ludGVyLWV2ZW50cycsIGQudmFsdWUgPyBkLnZhbHVlOiAnJywgZC5wcmlvcml0eSk7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIG91ciByZXN1bHRzXG4gICAgcmV0dXJuIGVsZW1lbnRzO1xuXG59KS5iaW5kKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgPyBkb2N1bWVudCA6IG51bGwpO1xuXG5jb25zdCBzdXBwb3J0c1Bhc3NpdmUgPSAoKCkgPT4ge1xuICAgIC8vIHNpbXVsYXIgdG8galF1ZXJ5J3MgdGVzdFxuICAgIGxldCBzdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgbnVsbCwgT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtnZXQgKCkgeyBzdXBwb3J0ZWQgPSB0cnVlOyB9fSkpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgcmV0dXJuIHN1cHBvcnRlZDtcbn0pKCk7XG5cblxuY29uc3QgRUxFTUVOVF9OT0RFID0gMTtcbmZ1bmN0aW9uIGdldE5vZGVDbGllbnRPZmZzZXQgKG5vZGUpIHtcbiAgICBjb25zdCBlbCA9IG5vZGUubm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERVxuICAgICAgICA/IG5vZGVcbiAgICAgICAgOiBub2RlLnBhcmVudEVsZW1lbnQ7XG5cbiAgICBpZiAoIWVsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHsgdG9wLCBsZWZ0IH0gPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4geyB4OiBsZWZ0LCB5OiB0b3AgfTtcbn1cblxuY29uc3QgZXZlbnROYW1lcyA9IHtcbiAgICBtb3VzZToge1xuICAgICAgICBzdGFydDogJ21vdXNlZG93bicsXG4gICAgICAgIG1vdmU6ICdtb3VzZW1vdmUnLFxuICAgICAgICBlbmQ6ICdtb3VzZXVwJyxcbiAgICAgICAgY29udGV4dG1lbnU6ICdjb250ZXh0bWVudSdcbiAgICB9LFxuICAgIHRvdWNoOiB7XG4gICAgICAgIHN0YXJ0OiAndG91Y2hzdGFydCcsXG4gICAgICAgIG1vdmU6ICd0b3VjaG1vdmUnLFxuICAgICAgICBlbmQ6ICd0b3VjaGVuZCdcbiAgICB9LFxuICAgIGtleWJvYXJkOiB7XG4gICAgICAgIGtleWRvd246ICdrZXlkb3duJ1xuICAgIH1cbn07XG5cbmV4cG9ydCBjbGFzcyBUb3VjaEJhY2tlbmQge1xuICAgIGNvbnN0cnVjdG9yIChtYW5hZ2VyLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgb3B0aW9ucy5kZWxheVRvdWNoU3RhcnQgPSBvcHRpb25zLmRlbGF5VG91Y2hTdGFydCB8fCBvcHRpb25zLmRlbGF5O1xuXG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBlbmFibGVUb3VjaEV2ZW50czogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZU1vdXNlRXZlbnRzOiBmYWxzZSxcbiAgICAgICAgICAgIGVuYWJsZUtleWJvYXJkRXZlbnRzOiBmYWxzZSxcbiAgICAgICAgICAgIGlnbm9yZUNvbnRleHRNZW51OiBmYWxzZSxcbiAgICAgICAgICAgIGRlbGF5VG91Y2hTdGFydDogMCxcbiAgICAgICAgICAgIGRlbGF5TW91c2VTdGFydDogMCxcbiAgICAgICAgICAgIHRvdWNoU2xvcDogMCxcbiAgICAgICAgICAgIHNjcm9sbEFuZ2xlUmFuZ2VzOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAuLi5vcHRpb25zXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5hY3Rpb25zID0gbWFuYWdlci5nZXRBY3Rpb25zKCk7XG4gICAgICAgIHRoaXMubW9uaXRvciA9IG1hbmFnZXIuZ2V0TW9uaXRvcigpO1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5ID0gbWFuYWdlci5nZXRSZWdpc3RyeSgpO1xuXG4gICAgICAgIHRoaXMuZW5hYmxlS2V5Ym9hcmRFdmVudHMgPSBvcHRpb25zLmVuYWJsZUtleWJvYXJkRXZlbnRzO1xuICAgICAgICB0aGlzLmVuYWJsZU1vdXNlRXZlbnRzID0gb3B0aW9ucy5lbmFibGVNb3VzZUV2ZW50cztcbiAgICAgICAgdGhpcy5kZWxheVRvdWNoU3RhcnQgPSBvcHRpb25zLmRlbGF5VG91Y2hTdGFydDtcbiAgICAgICAgdGhpcy5kZWxheU1vdXNlU3RhcnQgPSBvcHRpb25zLmRlbGF5TW91c2VTdGFydDtcbiAgICAgICAgdGhpcy5pZ25vcmVDb250ZXh0TWVudSA9IG9wdGlvbnMuaWdub3JlQ29udGV4dE1lbnU7XG4gICAgICAgIHRoaXMudG91Y2hTbG9wID0gb3B0aW9ucy50b3VjaFNsb3A7XG4gICAgICAgIHRoaXMuc2Nyb2xsQW5nbGVSYW5nZXMgPSBvcHRpb25zLnNjcm9sbEFuZ2xlUmFuZ2VzO1xuICAgICAgICB0aGlzLnNvdXJjZU5vZGVzID0ge307XG4gICAgICAgIHRoaXMuc291cmNlTm9kZU9wdGlvbnMgPSB7fTtcbiAgICAgICAgdGhpcy5zb3VyY2VQcmV2aWV3Tm9kZXMgPSB7fTtcbiAgICAgICAgdGhpcy5zb3VyY2VQcmV2aWV3Tm9kZU9wdGlvbnMgPSB7fTtcbiAgICAgICAgdGhpcy50YXJnZXROb2RlcyA9IHt9O1xuICAgICAgICB0aGlzLnRhcmdldE5vZGVPcHRpb25zID0ge307XG4gICAgICAgIHRoaXMubGlzdGVuZXJUeXBlcyA9IFtdO1xuICAgICAgICB0aGlzLl9tb3VzZUNsaWVudE9mZnNldCA9IHt9O1xuICAgICAgICB0aGlzLl9pc1Njcm9sbGluZyA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmVuYWJsZU1vdXNlRXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyVHlwZXMucHVzaCgnbW91c2UnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLmVuYWJsZVRvdWNoRXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyVHlwZXMucHVzaCgndG91Y2gnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLmVuYWJsZUtleWJvYXJkRXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyVHlwZXMucHVzaCgna2V5Ym9hcmQnKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZ2V0RHJvcFRhcmdldEVsZW1lbnRzQXRQb2ludCkge1xuICAgICAgICAgICAgdGhpcy5nZXREcm9wVGFyZ2V0RWxlbWVudHNBdFBvaW50ID0gb3B0aW9ucy5nZXREcm9wVGFyZ2V0RWxlbWVudHNBdFBvaW50O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51c2VBbGxUYXJnZXROb2RlcyA9IG9wdGlvbnMudXNlQWxsVGFyZ2V0Tm9kZXM7XG5cbiAgICAgICAgdGhpcy5nZXRTb3VyY2VDbGllbnRPZmZzZXQgPSB0aGlzLmdldFNvdXJjZUNsaWVudE9mZnNldC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRsZVRvcE1vdmVTdGFydCA9IHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0RGVsYXkgPSB0aGlzLmhhbmRsZVRvcE1vdmVTdGFydERlbGF5LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0Q2FwdHVyZSA9IHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0Q2FwdHVyZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRsZVRvcE1vdmVDYXB0dXJlID0gdGhpcy5oYW5kbGVUb3BNb3ZlQ2FwdHVyZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRsZVRvcE1vdmUgPSB0aGlzLmhhbmRsZVRvcE1vdmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYW5kbGVUb3BNb3ZlRW5kQ2FwdHVyZSA9IHRoaXMuaGFuZGxlVG9wTW92ZUVuZENhcHR1cmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYW5kbGVDYW5jZWxPbkVzY2FwZSA9IHRoaXMuaGFuZGxlQ2FuY2VsT25Fc2NhcGUuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBzZXR1cCAoKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaW52YXJpYW50KCF0aGlzLmNvbnN0cnVjdG9yLmlzU2V0VXAsICdDYW5ub3QgaGF2ZSB0d28gVG91Y2ggYmFja2VuZHMgYXQgdGhlIHNhbWUgdGltZS4nKTtcbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5pc1NldFVwID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAnc3RhcnQnLCAgICAgIHRoaXMuZ2V0VG9wTW92ZVN0YXJ0SGFuZGxlcigpKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHdpbmRvdywgJ3N0YXJ0JywgICAgICB0aGlzLmhhbmRsZVRvcE1vdmVTdGFydENhcHR1cmUsIHRydWUpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAnbW92ZScsICAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZSk7XG4gICAgICAgIGlmICghdGhpcy51c2VBbGxUYXJnZXROb2Rlcykge1xuICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHdpbmRvdywgJ21vdmUnLCAgICAgICB0aGlzLmhhbmRsZVRvcE1vdmVDYXB0dXJlLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAnZW5kJywgICAgICAgIHRoaXMuaGFuZGxlVG9wTW92ZUVuZENhcHR1cmUsIHRydWUpO1xuXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZU1vdXNlRXZlbnRzICYmICF0aGlzLmlnbm9yZUNvbnRleHRNZW51KSB7XG4gICAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAnY29udGV4dG1lbnUnLCB0aGlzLmhhbmRsZVRvcE1vdmVFbmRDYXB0dXJlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZUtleWJvYXJkRXZlbnRzKXtcbiAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3csICdrZXlkb3duJywgdGhpcy5oYW5kbGVDYW5jZWxPbkVzY2FwZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0ZWFyZG93biAoKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5pc1NldFVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX21vdXNlQ2xpZW50T2Zmc2V0ID0ge307XG5cbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHdpbmRvdywgJ3N0YXJ0JywgdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnRDYXB0dXJlLCB0cnVlKTtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHdpbmRvdywgJ3N0YXJ0JywgdGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnQpO1xuICAgICAgICBpZiAoIXRoaXMudXNlQWxsVGFyZ2V0Tm9kZXMpIHtcbiAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHdpbmRvdywgJ21vdmUnLCAgdGhpcy5oYW5kbGVUb3BNb3ZlQ2FwdHVyZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHdpbmRvdywgJ21vdmUnLCAgdGhpcy5oYW5kbGVUb3BNb3ZlKTtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHdpbmRvdywgJ2VuZCcsICAgdGhpcy5oYW5kbGVUb3BNb3ZlRW5kQ2FwdHVyZSwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlTW91c2VFdmVudHMgJiYgIXRoaXMuaWdub3JlQ29udGV4dE1lbnUpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih3aW5kb3csICdjb250ZXh0bWVudScsIHRoaXMuaGFuZGxlVG9wTW92ZUVuZENhcHR1cmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlS2V5Ym9hcmRFdmVudHMpe1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHdpbmRvdywgJ2tleWRvd24nLCB0aGlzLmhhbmRsZUNhbmNlbE9uRXNjYXBlLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudW5pbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlcigpO1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIgKHN1YmplY3QsIGV2ZW50LCBoYW5kbGVyLCBjYXB0dXJlKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBzdXBwb3J0c1Bhc3NpdmUgPyB7Y2FwdHVyZSwgcGFzc2l2ZTogZmFsc2V9IDogY2FwdHVyZTtcblxuICAgICAgICB0aGlzLmxpc3RlbmVyVHlwZXMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXJUeXBlKSB7XG4gICAgICAgICAgICBjb25zdCBldnQgPSBldmVudE5hbWVzW2xpc3RlbmVyVHlwZV1bZXZlbnRdO1xuXG4gICAgICAgICAgICBpZiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgc3ViamVjdC5hZGRFdmVudExpc3RlbmVyKGV2dCwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIgKHN1YmplY3QsIGV2ZW50LCBoYW5kbGVyLCBjYXB0dXJlKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBzdXBwb3J0c1Bhc3NpdmUgPyB7Y2FwdHVyZSwgcGFzc2l2ZTogZmFsc2V9IDogY2FwdHVyZTtcblxuICAgICAgICB0aGlzLmxpc3RlbmVyVHlwZXMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXJUeXBlKSB7XG4gICAgICAgICAgICBjb25zdCBldnQgPSBldmVudE5hbWVzW2xpc3RlbmVyVHlwZV1bZXZlbnRdO1xuXG4gICAgICAgICAgICBpZiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgc3ViamVjdC5yZW1vdmVFdmVudExpc3RlbmVyKGV2dCwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbm5lY3REcmFnU291cmNlIChzb3VyY2VJZCwgbm9kZSwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBoYW5kbGVNb3ZlU3RhcnQgPSB0aGlzLmhhbmRsZU1vdmVTdGFydC5iaW5kKHRoaXMsIHNvdXJjZUlkKTtcbiAgICAgICAgdGhpcy5zb3VyY2VOb2Rlc1tzb3VyY2VJZF0gPSBub2RlO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihub2RlLCAnc3RhcnQnLCBoYW5kbGVNb3ZlU3RhcnQpO1xuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zb3VyY2VOb2Rlc1tzb3VyY2VJZF07XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIobm9kZSwgJ3N0YXJ0JywgaGFuZGxlTW92ZVN0YXJ0KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25uZWN0RHJhZ1ByZXZpZXcgKHNvdXJjZUlkLCBub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc291cmNlUHJldmlld05vZGVPcHRpb25zW3NvdXJjZUlkXSA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuc291cmNlUHJldmlld05vZGVzW3NvdXJjZUlkXSA9IG5vZGU7XG5cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnNvdXJjZVByZXZpZXdOb2Rlc1tzb3VyY2VJZF07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zb3VyY2VQcmV2aWV3Tm9kZU9wdGlvbnNbc291cmNlSWRdO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbm5lY3REcm9wVGFyZ2V0ICh0YXJnZXRJZCwgbm9kZSkge1xuICAgICAgICBjb25zdCBoYW5kbGVNb3ZlID0gKGUpID0+IHtcbiAgICAgICAgICAgIC8vIHRoZSBwdXJwb3NlIGlzIHRvIGFkZCB0aGUgdGFyZ2V0SWQgdG8gZHJhZ092ZXJUYXJnZXRJZHMgd2hlbiB0aGVcbiAgICAgICAgICAgIC8vIGN1cnJlbnQgdG91Y2ggcG9pbnQgaXMgaW4gdGhlIG5vZGUgb3IgaXRzIGNoaWxkcmVuXG4gICAgICAgICAgICAvLyB0aGlzIGlzIGluZWZmaWNpZW50IHNpbmNlIGl0IGdldHMgY2FsbGVkIGZvciBldmVyeSBkcm9wIHRhcmdldCxcbiAgICAgICAgICAgIC8vIGFuZCBlbGVtZW50RnJvbVBvaW50IGlzIGluZWZmaWNpZW50IGFuZCByZXR1cm5zIHRoZSBzYW1lXG4gICAgICAgICAgICAvLyBub3RlOiBkcmFnT3ZlclRhcmdldElkcyBnZXRzIGVtcHRpZWQgYnkgdGhlIHRvcE1vdmVDYXB0dXJlSGFuZGxlclxuICAgICAgICAgICAgbGV0IGNvb3JkcztcblxuICAgICAgICAgICAgaWYgKCF0aGlzLm1vbml0b3IuaXNEcmFnZ2luZygpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdyYWIgdGhlIGNvb3JkaW5hdGVzIGZvciB0aGUgY3VycmVudCBtb3VzZS90b3VjaCBwb3NpdGlvblxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzd2l0Y2ggKGUudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBldmVudE5hbWVzLm1vdXNlLm1vdmU6XG4gICAgICAgICAgICAgICAgY29vcmRzID0geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIGV2ZW50TmFtZXMudG91Y2gubW92ZTpcbiAgICAgICAgICAgICAgICBjb29yZHMgPSB7IHg6IGUudG91Y2hlc1swXS5jbGllbnRYLCB5OiBlLnRvdWNoZXNbMF0uY2xpZW50WSB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFVzZSB0aGUgY29vcmRpbmF0ZXMgdG8gZ3JhYiB0aGUgZWxlbWVudCB0aGUgZHJhZyBlbmRlZCBvbi5cbiAgICAgICAgICAgICAqIElmIHRoZSBlbGVtZW50IGlzIHRoZSBzYW1lIGFzIHRoZSB0YXJnZXQgbm9kZSAob3IgYW55IG9mIGl0J3MgY2hpbGRyZW4pIHRoZW4gd2UgaGF2ZSBoaXQgYSBkcm9wIHRhcmdldCBhbmQgY2FuIGhhbmRsZSB0aGUgbW92ZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbGV0IGRyb3BwZWRPbiA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoY29vcmRzLngsIGNvb3Jkcy55KTtcbiAgICAgICAgICAgIGxldCBjaGlsZE1hdGNoID0gbm9kZS5jb250YWlucyhkcm9wcGVkT24pO1xuXG4gICAgICAgICAgICBpZiAoZHJvcHBlZE9uID09PSBub2RlIHx8IGNoaWxkTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVNb3ZlKGUsIHRhcmdldElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQXR0YWNoaW5nIHRoZSBldmVudCBsaXN0ZW5lciB0byB0aGUgYm9keSBzbyB0aGF0IHRvdWNobW92ZSB3aWxsIHdvcmsgd2hpbGUgZHJhZ2dpbmcgb3ZlciBtdWx0aXBsZSB0YXJnZXQgZWxlbWVudHMuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoIXRoaXMudXNlQWxsVGFyZ2V0Tm9kZXMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JyksICdtb3ZlJywgaGFuZGxlTW92ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50YXJnZXROb2Rlc1t0YXJnZXRJZF0gPSBub2RlO1xuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy50YXJnZXROb2Rlc1t0YXJnZXRJZF07XG4gICAgICAgICAgICBpZiAoIXRoaXMudXNlQWxsVGFyZ2V0Tm9kZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLCAnbW92ZScsIGhhbmRsZU1vdmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldFNvdXJjZUNsaWVudE9mZnNldCAoc291cmNlSWQpIHtcbiAgICAgICAgcmV0dXJuIGdldE5vZGVDbGllbnRPZmZzZXQodGhpcy5zb3VyY2VOb2Rlc1tzb3VyY2VJZF0pO1xuICAgIH1cblxuICAgIGhhbmRsZVRvcE1vdmVTdGFydENhcHR1cmUgKGUpIHtcbiAgICAgICAgaWYgKCFldmVudFNob3VsZFN0YXJ0RHJhZyhlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tb3ZlU3RhcnRTb3VyY2VJZHMgPSBbXTtcbiAgICB9XG5cbiAgICBoYW5kbGVNb3ZlU3RhcnQgKHNvdXJjZUlkKSB7XG4gICAgICAgIC8vIEp1c3QgYmVjYXVzZSB3ZSByZWNlaXZlZCBhbiBldmVudCBkb2Vzbid0IG5lY2Vzc2FyaWx5IG1lYW4gd2UgbmVlZCB0byBjb2xsZWN0IGRyYWcgc291cmNlcy5cbiAgICAgICAgLy8gV2Ugb25seSBjb2xsZWN0IHN0YXJ0IGNvbGxlY3RpbmcgZHJhZyBzb3VyY2VzIG9uIHRvdWNoIGFuZCBsZWZ0IG1vdXNlIGV2ZW50cy5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5tb3ZlU3RhcnRTb3VyY2VJZHMpKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVTdGFydFNvdXJjZUlkcy51bnNoaWZ0KHNvdXJjZUlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFRvcE1vdmVTdGFydEhhbmRsZXIgKCkge1xuICAgICAgICBpZiAoIXRoaXMuZGVsYXlUb3VjaFN0YXJ0ICYmICF0aGlzLmRlbGF5TW91c2VTdGFydCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlVG9wTW92ZVN0YXJ0RGVsYXk7XG4gICAgfVxuXG4gICAgaGFuZGxlVG9wTW92ZVN0YXJ0IChlKSB7XG4gICAgICAgIGlmICghZXZlbnRTaG91bGRTdGFydERyYWcoZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERvbid0IHByZW1hdHVyZWx5IHByZXZlbnREZWZhdWx0KCkgaGVyZSBzaW5jZSBpdCBtaWdodDpcbiAgICAgICAgLy8gMS4gTWVzcyB1cCBzY3JvbGxpbmdcbiAgICAgICAgLy8gMi4gTWVzcyB1cCBsb25nIHRhcCAod2hpY2ggYnJpbmdzIHVwIGNvbnRleHQgbWVudSlcbiAgICAgICAgLy8gMy4gSWYgdGhlcmUncyBhbiBhbmNob3IgbGluayBhcyBhIGNoaWxkLCB0YXAgd29uJ3QgYmUgdHJpZ2dlcmVkIG9uIGxpbmtcblxuICAgICAgICBjb25zdCBjbGllbnRPZmZzZXQgPSBnZXRFdmVudENsaWVudE9mZnNldChlKTtcbiAgICAgICAgaWYgKGNsaWVudE9mZnNldCkge1xuICAgICAgICAgICAgdGhpcy5fbW91c2VDbGllbnRPZmZzZXQgPSBjbGllbnRPZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53YWl0aW5nRm9yRGVsYXkgPSBmYWxzZVxuICAgIH1cblxuICAgIGhhbmRsZVRvcE1vdmVTdGFydERlbGF5IChlKSB7XG4gICAgICAgIGlmICghZXZlbnRTaG91bGRTdGFydERyYWcoZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlbGF5ID0gKGUudHlwZSA9PT0gZXZlbnROYW1lcy50b3VjaC5zdGFydClcbiAgICAgICAgICAgID8gdGhpcy5kZWxheVRvdWNoU3RhcnRcbiAgICAgICAgICAgIDogdGhpcy5kZWxheU1vdXNlU3RhcnQ7XG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQodGhpcy5oYW5kbGVUb3BNb3ZlU3RhcnQuYmluZCh0aGlzLCBlKSwgZGVsYXkpO1xuICAgICAgICB0aGlzLndhaXRpbmdGb3JEZWxheSA9IHRydWVcbiAgICB9XG5cbiAgICBoYW5kbGVUb3BNb3ZlQ2FwdHVyZSAoZSkge1xuICAgICAgICB0aGlzLmRyYWdPdmVyVGFyZ2V0SWRzID0gW107XG4gICAgfVxuXG4gICAgaGFuZGxlTW92ZSggZSwgdGFyZ2V0SWQgKSB7XG4gICAgICAgIHRoaXMuZHJhZ092ZXJUYXJnZXRJZHMudW5zaGlmdCggdGFyZ2V0SWQgKTtcbiAgICB9XG5cbiAgICBoYW5kbGVUb3BNb3ZlIChlKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICBpZiAodGhpcy53YWl0aW5nRm9yRGVsYXkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgbW92ZVN0YXJ0U291cmNlSWRzLCBkcmFnT3ZlclRhcmdldElkcyB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgY2xpZW50T2Zmc2V0ID0gZ2V0RXZlbnRDbGllbnRPZmZzZXQoZSk7XG5cbiAgICAgICAgaWYgKCFjbGllbnRPZmZzZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSB0b3VjaCBtb3ZlIHN0YXJ0ZWQgYXMgYSBzY3JvbGwsIG9yIGlzIGlzIGJldHdlZW4gdGhlIHNjcm9sbCBhbmdsZXNcbiAgICAgICAgaWYgKHRoaXMuX2lzU2Nyb2xsaW5nIHx8ICghdGhpcy5tb25pdG9yLmlzRHJhZ2dpbmcoKSAmJlxuICAgICAgICAgICAgaW5BbmdsZVJhbmdlcyh0aGlzLl9tb3VzZUNsaWVudE9mZnNldC54LCB0aGlzLl9tb3VzZUNsaWVudE9mZnNldC55LCBjbGllbnRPZmZzZXQueCwgY2xpZW50T2Zmc2V0LnksXG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxBbmdsZVJhbmdlcykpKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1Njcm9sbGluZyA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSdyZSBub3QgZHJhZ2dpbmcgYW5kIHdlJ3ZlIG1vdmVkIGEgbGl0dGxlLCB0aGF0IGNvdW50cyBhcyBhIGRyYWcgc3RhcnRcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIXRoaXMubW9uaXRvci5pc0RyYWdnaW5nKCkgJiZcbiAgICAgICAgICAgIHRoaXMuX21vdXNlQ2xpZW50T2Zmc2V0Lmhhc093blByb3BlcnR5KCd4JykgJiZcbiAgICAgICAgICAgIG1vdmVTdGFydFNvdXJjZUlkcyAmJiBcbiAgICAgICAgICAgIGRpc3RhbmNlKHRoaXMuX21vdXNlQ2xpZW50T2Zmc2V0LngsIHRoaXMuX21vdXNlQ2xpZW50T2Zmc2V0LnksIGNsaWVudE9mZnNldC54LCBjbGllbnRPZmZzZXQueSkgPlxuICAgICAgICAgICAgICAgICh0aGlzLnRvdWNoU2xvcCA/IHRoaXMudG91Y2hTbG9wIDogMCkpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZVN0YXJ0U291cmNlSWRzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuYWN0aW9ucy5iZWdpbkRyYWcobW92ZVN0YXJ0U291cmNlSWRzLCB7XG4gICAgICAgICAgICAgICAgY2xpZW50T2Zmc2V0OiB0aGlzLl9tb3VzZUNsaWVudE9mZnNldCxcbiAgICAgICAgICAgICAgICBnZXRTb3VyY2VDbGllbnRPZmZzZXQ6IHRoaXMuZ2V0U291cmNlQ2xpZW50T2Zmc2V0LFxuICAgICAgICAgICAgICAgIHB1Ymxpc2hTb3VyY2U6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5tb25pdG9yLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc291cmNlTm9kZSA9IHRoaXMuc291cmNlTm9kZXNbdGhpcy5tb25pdG9yLmdldFNvdXJjZUlkKCldO1xuICAgICAgICB0aGlzLmluc3RhbGxTb3VyY2VOb2RlUmVtb3ZhbE9ic2VydmVyKHNvdXJjZU5vZGUpO1xuICAgICAgICB0aGlzLmFjdGlvbnMucHVibGlzaERyYWdTb3VyY2UoKTtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBub2RlIGVsZW1lbnRzIG9mIHRoZSBob3ZlcmVkIERyb3BUYXJnZXRzXG4gICAgICAgIGNvbnN0IGRyYWdPdmVyVGFyZ2V0Tm9kZXMgPSB0aGlzLnVzZUFsbFRhcmdldE5vZGVzID8gT2JqZWN0LnZhbHVlcyh0aGlzLnRhcmdldE5vZGVzKSA6IGRyYWdPdmVyVGFyZ2V0SWRzLm1hcChrZXkgPT4gdGhpcy50YXJnZXROb2Rlc1trZXldKTtcbiAgICAgICAgLy8gR2V0IHRoZSBhIG9yZGVyZWQgbGlzdCBvZiBub2RlcyB0aGF0IGFyZSB0b3VjaGVkIGJ5XG4gICAgICAgIGxldCBlbGVtZW50c0F0UG9pbnQgPSB0aGlzLmdldERyb3BUYXJnZXRFbGVtZW50c0F0UG9pbnRcbiAgICAgICAgICA/IHRoaXMuZ2V0RHJvcFRhcmdldEVsZW1lbnRzQXRQb2ludChjbGllbnRPZmZzZXQueCwgY2xpZW50T2Zmc2V0LnksIGRyYWdPdmVyVGFyZ2V0Tm9kZXMpXG4gICAgICAgICAgOiBlbGVtZW50c0Zyb21Qb2ludChjbGllbnRPZmZzZXQueCwgY2xpZW50T2Zmc2V0LnkpO1xuICAgICAgICAvLyBFeHRlbmQgbGlzdCB3aXRoIFNWRyBwYXJlbnRzIHRoYXQgYXJlIG5vdCByZWNlaXZpbmcgZWxlbWVudHNGcm9tUG9pbnQgZXZlbnRzIChzdmcgZ3JvdXBzKVxuICAgICAgICBsZXQgZWxlbWVudHNBdFBvaW50RXh0ZW5kZWQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgbm9kZUlkIGluIGVsZW1lbnRzQXRQb2ludCl7XG4gICAgICAgICAgICBsZXQgY3VycmVudE5vZGUgPSBlbGVtZW50c0F0UG9pbnRbbm9kZUlkXTtcbiAgICAgICAgICAgIGVsZW1lbnRzQXRQb2ludEV4dGVuZGVkLnB1c2goY3VycmVudE5vZGUpO1xuICAgICAgICAgICAgLy8gSXMgY3VycmVudE5vZGUgYW4gU1ZHIGVsZW1lbnRcbiAgICAgICAgICAgIHdoaWxlKGN1cnJlbnROb2RlICYmIGN1cnJlbnROb2RlLm93bmVyU1ZHRWxlbWVudCl7XG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmKCAhZWxlbWVudHNBdFBvaW50RXh0ZW5kZWQuaW5jbHVkZXMoY3VycmVudE5vZGUpICkgZWxlbWVudHNBdFBvaW50RXh0ZW5kZWQucHVzaChjdXJyZW50Tm9kZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgb3JkZXJlZERyYWdPdmVyVGFyZ2V0SWRzID0gZWxlbWVudHNBdFBvaW50RXh0ZW5kZWRcbiAgICAgICAgICAvLyBGaWx0ZXIgb2ZmIG5vZGVzIHRoYXQgYXJlbnQgYSBob3ZlcmVkIERyb3BUYXJnZXRzIG5vZGVzXG4gICAgICAgICAgLmZpbHRlcihub2RlID0+IGRyYWdPdmVyVGFyZ2V0Tm9kZXMuaW5kZXhPZihub2RlKSA+IC0xKVxuICAgICAgICAgIC8vIE1hcCBiYWNrIHRoZSBub2RlcyBlbGVtZW50cyB0byB0YXJnZXRJZHNcbiAgICAgICAgICAubWFwKG5vZGUgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgdGFyZ2V0SWQgaW4gdGhpcy50YXJnZXROb2Rlcykge1xuICAgICAgICAgICAgICBpZiAobm9kZSA9PT0gdGhpcy50YXJnZXROb2Rlc1t0YXJnZXRJZF0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldElkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAvLyBGaWx0ZXIgb2ZmIHBvc3NpYmxlIG51bGwgcm93c1xuICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiAhIW5vZGUpXG4gICAgICAgICAgLmZpbHRlcigoaWQsIGluZGV4LCBpZHMpID0+IGlkcy5pbmRleE9mKGlkKSA9PT0gaW5kZXgpO1xuXG4gICAgICAgIC8vIFJldmVyc2Ugb3JkZXIgYmVjYXVzZSBkbmQtY29yZSByZXZlcnNlIGl0IGJlZm9yZSBjYWxsaW5nIHRoZSBEcm9wVGFyZ2V0IGRyb3AgbWV0aG9kc1xuICAgICAgICBvcmRlcmVkRHJhZ092ZXJUYXJnZXRJZHMucmV2ZXJzZSgpO1xuXG4gICAgICAgIHRoaXMuYWN0aW9ucy5ob3ZlcihvcmRlcmVkRHJhZ092ZXJUYXJnZXRJZHMsIHtcbiAgICAgICAgICAgIGNsaWVudE9mZnNldDogY2xpZW50T2Zmc2V0XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGhhbmRsZVRvcE1vdmVFbmRDYXB0dXJlIChlKSB7XG4gICAgICAgIHRoaXMuX2lzU2Nyb2xsaW5nID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFldmVudFNob3VsZEVuZERyYWcoZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5tb25pdG9yLmlzRHJhZ2dpbmcoKSB8fCB0aGlzLm1vbml0b3IuZGlkRHJvcCgpKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVTdGFydFNvdXJjZUlkcyA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5fbW91c2VDbGllbnRPZmZzZXQgPSB7fTtcblxuICAgICAgICB0aGlzLnVuaW5zdGFsbFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIoKTtcbiAgICAgICAgdGhpcy5hY3Rpb25zLmRyb3AoKTtcbiAgICAgICAgdGhpcy5hY3Rpb25zLmVuZERyYWcoKTtcbiAgICB9XG5cbiAgICBoYW5kbGVDYW5jZWxPbkVzY2FwZSAoZSkge1xuICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKXtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlQ2xpZW50T2Zmc2V0ID0ge307XG5cbiAgICAgICAgICAgIHRoaXMudW5pbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlcigpO1xuICAgICAgICAgICAgdGhpcy5hY3Rpb25zLmVuZERyYWcoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU9uQ29udGV4dE1lbnUgKCkge1xuICAgICAgICB0aGlzLm1vdmVTdGFydFNvdXJjZUlkcyA9IG51bGw7XG4gICAgfVxuXG4gICAgaW5zdGFsbFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIgKG5vZGUpIHtcbiAgICAgICAgdGhpcy51bmluc3RhbGxTb3VyY2VOb2RlUmVtb3ZhbE9ic2VydmVyKCk7XG5cbiAgICAgICAgdGhpcy5kcmFnZ2VkU291cmNlTm9kZSA9IG5vZGU7XG4gICAgICAgIHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIgPSBuZXcgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFub2RlLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VycmVjdFNvdXJjZU5vZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaW5zdGFsbFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFub2RlIHx8ICFub2RlLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIub2JzZXJ2ZShcbiAgICAgICAgICAgIG5vZGUucGFyZW50RWxlbWVudCxcbiAgICAgICAgICAgIHsgY2hpbGRMaXN0OiB0cnVlIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXN1cnJlY3RTb3VyY2VOb2RlICgpIHtcbiAgICAgICAgdGhpcy5kcmFnZ2VkU291cmNlTm9kZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB0aGlzLmRyYWdnZWRTb3VyY2VOb2RlLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1yZWFjdGlkJyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5kcmFnZ2VkU291cmNlTm9kZSk7XG4gICAgfVxuXG4gICAgdW5pbnN0YWxsU291cmNlTm9kZVJlbW92YWxPYnNlcnZlciAoKSB7XG4gICAgICAgIGlmICh0aGlzLmRyYWdnZWRTb3VyY2VOb2RlUmVtb3ZhbE9ic2VydmVyKSB7XG4gICAgICAgICAgICB0aGlzLmRyYWdnZWRTb3VyY2VOb2RlUmVtb3ZhbE9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJhZ2dlZFNvdXJjZU5vZGVSZW1vdmFsT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmRyYWdnZWRTb3VyY2VOb2RlID0gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVRvdWNoQmFja2VuZCAob3B0aW9uc09yTWFuYWdlciA9IHt9KSB7XG4gICAgY29uc3QgdG91Y2hCYWNrZW5kRmFjdG9yeSA9IGZ1bmN0aW9uIChtYW5hZ2VyKSB7XG4gICAgICAgIHJldHVybiBuZXcgVG91Y2hCYWNrZW5kKG1hbmFnZXIsIG9wdGlvbnNPck1hbmFnZXIpO1xuICAgIH07XG5cbiAgICBpZiAob3B0aW9uc09yTWFuYWdlci5nZXRNb25pdG9yKSB7XG4gICAgICAgIHJldHVybiB0b3VjaEJhY2tlbmRGYWN0b3J5KG9wdGlvbnNPck1hbmFnZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0b3VjaEJhY2tlbmRGYWN0b3J5O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZGlzdGFuY2UoeDEsIHkxLCB4MiwgeTIpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KE1hdGguYWJzKHgyIC0geDEpLCAyKSArIE1hdGgucG93KE1hdGguYWJzKHkyIC0geTEpLCAyKSk7XG59XG5cbmZ1bmN0aW9uIGluQW5nbGVSYW5nZXMoeDEsIHkxLCB4MiwgeTIsIGFuZ2xlUmFuZ2VzKSB7XG4gICAgaWYgKGFuZ2xlUmFuZ2VzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMih5MiAtIHkxLCB4MiAtIHgxKSAqIDE4MCAvIE1hdGguUEkgKyAxODA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFuZ2xlUmFuZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIChhbmdsZVJhbmdlc1tpXS5zdGFydCA9PSBudWxsIHx8IGFuZ2xlID49IGFuZ2xlUmFuZ2VzW2ldLnN0YXJ0KSAmJlxuICAgICAgICAgICAgKGFuZ2xlUmFuZ2VzW2ldLmVuZCA9PSBudWxsIHx8IGFuZ2xlIDw9IGFuZ2xlUmFuZ2VzW2ldLmVuZClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn1cbiJdfQ==
