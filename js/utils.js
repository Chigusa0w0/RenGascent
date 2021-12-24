(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rgUtils = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
var Utils;
(function (Utils) {
    function initResizable() {
        document.addEventListener('DOMContentLoaded', function () {
            var resizable = function (resizer) {
                var direction = resizer.getAttribute('data-direction') || 'vertical';
                var prevSibling = resizer.previousElementSibling;
                var nextSibling = resizer.nextElementSibling;
                var x = 0;
                var y = 0;
                var prevSiblingHeight = 0;
                var prevSiblingWidth = 0;
                var mouseDownHandler = function (e) {
                    x = e.clientX;
                    y = e.clientY;
                    var rect = prevSibling.getBoundingClientRect();
                    prevSiblingHeight = rect.height;
                    prevSiblingWidth = rect.width;
                    document.addEventListener('mousemove', mouseMoveHandler);
                    document.addEventListener('mouseup', mouseUpHandler);
                };
                var mouseMoveHandler = function (e) {
                    var dx = e.clientX - x;
                    var dy = e.clientY - y;
                    switch (direction) {
                        case 'vertical':
                            var h = ((prevSiblingHeight + dy) * 100) /
                                resizer.parentNode.getBoundingClientRect().height;
                            prevSibling.style.height = h + "%";
                            break;
                        case 'horizontal':
                        default:
                            var w = ((prevSiblingWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
                            prevSibling.style.width = w + "%";
                            break;
                    }
                    var cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
                    resizer.style.cursor = cursor;
                    document.body.style.cursor = cursor;
                    prevSibling.style.userSelect = 'none';
                    prevSibling.style.pointerEvents = 'none';
                    nextSibling.style.userSelect = 'none';
                    nextSibling.style.pointerEvents = 'none';
                };
                var mouseUpHandler = function () {
                    resizer.style.removeProperty('cursor');
                    document.body.style.removeProperty('cursor');
                    prevSibling.style.removeProperty('user-select');
                    prevSibling.style.removeProperty('pointer-events');
                    nextSibling.style.removeProperty('user-select');
                    nextSibling.style.removeProperty('pointer-events');
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    document.removeEventListener('mouseup', mouseUpHandler);
                };
                resizer.addEventListener('mousedown', mouseDownHandler);
            };
            document.querySelectorAll('.resizer').forEach(function (ele) {
                resizable(ele);
            });
        });
    }
    Utils.initResizable = initResizable;
    function createChannel() {
        window.messageBuffer = [];
        window.addEventListener("message", function (e) {
            if (window.messageBuffer === null) {
                return;
            }
            if (!e.origin.match(/(?:nga\.cn|ngacn\.cc|nga\.178\.com|nga\.donews\.com|ngabbs.com|bigccq\.cn|127\.0\.0\.1)(?::\d+)?$/)) {
                return;
            }
            var matches = String(e.data).match(/(\w+)\s+(\w+)\s+([^]+)/);
            if (!matches)
                return;
            var method = matches[1];
            var callback = matches[2];
            var value = matches[3];
            if (!method || method === "null")
                return;
            if (callback === "null")
                callback = null;
            if (value === "null")
                value = null;
            if (method) {
                window.messageOrigin = e.origin;
                handleMessage(method, callback, value);
            }
        });
    }
    Utils.createChannel = createChannel;
    function handleMessage(method, callback, value) {
        if (window.messageBuffer !== null) {
            window.messageBuffer.push({ method: method, callback: callback, value: value });
        }
    }
})(Utils = exports.Utils || (exports.Utils = {}));

},{}]},{},[1])(1)
});
