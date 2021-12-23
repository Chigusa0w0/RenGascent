// Expected to run inside Monaco AMD loader
// CommonJS hack
export var monaco = void 0;

Object.defineProperty(exports, "monaco", { 
    get: function() { 
        return window.monaco; 
    }
});
