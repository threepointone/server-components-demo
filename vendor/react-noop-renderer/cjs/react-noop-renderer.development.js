/** @license React vundefined
 * react-noop-renderer.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var ReactFiberReconciler = require('react-reconciler');
var React = require('react');
var _assign = require('object-assign');
var Scheduler = require('scheduler/unstable_mock');
var ReactRootTags = require('react-reconciler/src/ReactRootTags');

var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

function error(format) {
  {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    printWarning('error', format, args);
  }
}

function printWarning(level, format, args) {
  // When changing this logic, you might want to also
  // update consoleWithStackDev.www.js as well.
  {
    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
    var stack = ReactDebugCurrentFrame.getStackAddendum();

    if (stack !== '') {
      format += '%s';
      args = args.concat([stack]);
    }

    var argsWithFormat = args.map(function (item) {
      return '' + item;
    }); // Careful: RN currently depends on this prefix

    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
    // breaks IE9: https://github.com/facebook/react/issues/13610
    // eslint-disable-next-line react-internal/no-production-logging

    Function.prototype.apply.call(console[level], console, argsWithFormat);
  }
}

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var REACT_ELEMENT_TYPE = 0xeac7;
var REACT_PORTAL_TYPE = 0xeaca;
var REACT_FRAGMENT_TYPE = 0xeacb;
var REACT_STRICT_MODE_TYPE = 0xeacc;
var REACT_PROFILER_TYPE = 0xead2;
var REACT_PROVIDER_TYPE = 0xeacd;
var REACT_CONTEXT_TYPE = 0xeace;
var REACT_FORWARD_REF_TYPE = 0xead0;
var REACT_SUSPENSE_TYPE = 0xead1;
var REACT_SUSPENSE_LIST_TYPE = 0xead8;
var REACT_MEMO_TYPE = 0xead3;
var REACT_LAZY_TYPE = 0xead4;
var REACT_SCOPE_TYPE = 0xead7;
var REACT_OPAQUE_ID_TYPE = 0xeae0;
var REACT_DEBUG_TRACING_MODE_TYPE = 0xeae1;
var REACT_OFFSCREEN_TYPE = 0xeae2;
var REACT_LEGACY_HIDDEN_TYPE = 0xeae3;
var REACT_CACHE_TYPE = 0xeae4;

if (typeof Symbol === 'function' && Symbol.for) {
  var symbolFor = Symbol.for;
  REACT_ELEMENT_TYPE = symbolFor('react.element');
  REACT_PORTAL_TYPE = symbolFor('react.portal');
  REACT_FRAGMENT_TYPE = symbolFor('react.fragment');
  REACT_STRICT_MODE_TYPE = symbolFor('react.strict_mode');
  REACT_PROFILER_TYPE = symbolFor('react.profiler');
  REACT_PROVIDER_TYPE = symbolFor('react.provider');
  REACT_CONTEXT_TYPE = symbolFor('react.context');
  REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
  REACT_SUSPENSE_TYPE = symbolFor('react.suspense');
  REACT_SUSPENSE_LIST_TYPE = symbolFor('react.suspense_list');
  REACT_MEMO_TYPE = symbolFor('react.memo');
  REACT_LAZY_TYPE = symbolFor('react.lazy');
  REACT_SCOPE_TYPE = symbolFor('react.scope');
  REACT_OPAQUE_ID_TYPE = symbolFor('react.opaque.id');
  REACT_DEBUG_TRACING_MODE_TYPE = symbolFor('react.debug_trace_mode');
  REACT_OFFSCREEN_TYPE = symbolFor('react.offscreen');
  REACT_LEGACY_HIDDEN_TYPE = symbolFor('react.legacy_hidden');
  REACT_CACHE_TYPE = symbolFor('react.cache');
}

var didWarnAboutMessageChannel = false;
var enqueueTaskImpl = null;
function enqueueTask(task) {
  if (enqueueTaskImpl === null) {
    try {
      // read require off the module object to get around the bundlers.
      // we don't want them to detect a require and bundle a Node polyfill.
      var requireString = ('require' + Math.random()).slice(0, 7);
      var nodeRequire = module && module[requireString]; // assuming we're in node, let's try to get node's
      // version of setImmediate, bypassing fake timers if any.

      enqueueTaskImpl = nodeRequire.call(module, 'timers').setImmediate;
    } catch (_err) {
      // we're in a browser
      // we can't use regular timers because they may still be faked
      // so we try MessageChannel+postMessage instead
      enqueueTaskImpl = function (callback) {
        {
          if (didWarnAboutMessageChannel === false) {
            didWarnAboutMessageChannel = true;

            if (typeof MessageChannel === 'undefined') {
              error('This browser does not have a MessageChannel implementation, ' + 'so enqueuing tasks via await act(async () => ...) will fail. ' + 'Please file an issue at https://github.com/facebook/react/issues ' + 'if you encounter this warning.');
            }
          }
        }

        var channel = new MessageChannel();
        channel.port1.onmessage = callback;
        channel.port2.postMessage(undefined);
      };
    }
  }

  return enqueueTaskImpl(task);
}

var IsSomeRendererActing = ReactSharedInternals.IsSomeRendererActing; // TODO: Publish public entry point that exports the event priority constants

var DefaultEventPriority = 8;
var NO_CONTEXT = {};
var UPPERCASE_CONTEXT = {};
var UPDATE_SIGNAL = {};

{
  Object.freeze(NO_CONTEXT);
  Object.freeze(UPDATE_SIGNAL);
}

function createReactNoop(reconciler, useMutation) {
  var instanceCounter = 0;
  var hostDiffCounter = 0;
  var hostUpdateCounter = 0;
  var hostCloneCounter = 0;

  function appendChildToContainerOrInstance(parentInstance, child) {
    var index = parentInstance.children.indexOf(child);

    if (index !== -1) {
      parentInstance.children.splice(index, 1);
    }

    parentInstance.children.push(child);
  }

  function appendChildToContainer(parentInstance, child) {
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('appendChildToContainer() first argument is not a container.');
    }

    appendChildToContainerOrInstance(parentInstance, child);
  }

  function appendChild(parentInstance, child) {
    if (typeof parentInstance.rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('appendChild() first argument is not an instance.');
    }

    appendChildToContainerOrInstance(parentInstance, child);
  }

  function insertInContainerOrInstanceBefore(parentInstance, child, beforeChild) {
    var index = parentInstance.children.indexOf(child);

    if (index !== -1) {
      parentInstance.children.splice(index, 1);
    }

    var beforeIndex = parentInstance.children.indexOf(beforeChild);

    if (beforeIndex === -1) {
      throw new Error('This child does not exist.');
    }

    parentInstance.children.splice(beforeIndex, 0, child);
  }

  function insertInContainerBefore(parentInstance, child, beforeChild) {
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('insertInContainerBefore() first argument is not a container.');
    }

    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  }

  function insertBefore(parentInstance, child, beforeChild) {
    if (typeof parentInstance.rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('insertBefore() first argument is not an instance.');
    }

    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  }

  function clearContainer(container) {
    container.children.splice(0);
  }

  function removeChildFromContainerOrInstance(parentInstance, child) {
    var index = parentInstance.children.indexOf(child);

    if (index === -1) {
      throw new Error('This child does not exist.');
    }

    parentInstance.children.splice(index, 1);
  }

  function removeChildFromContainer(parentInstance, child) {
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('removeChildFromContainer() first argument is not a container.');
    }

    removeChildFromContainerOrInstance(parentInstance, child);
  }

  function removeChild(parentInstance, child) {
    if (typeof parentInstance.rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('removeChild() first argument is not an instance.');
    }

    removeChildFromContainerOrInstance(parentInstance, child);
  }

  function cloneInstance(instance, updatePayload, type, oldProps, newProps, internalInstanceHandle, keepChildren, recyclableInstance) {
    var clone = {
      id: instance.id,
      type: type,
      children: keepChildren ? instance.children : [],
      text: shouldSetTextContent(type, newProps) ? computeText(newProps.children + '', instance.context) : null,
      prop: newProps.prop,
      hidden: !!newProps.hidden,
      context: instance.context
    };
    Object.defineProperty(clone, 'id', {
      value: clone.id,
      enumerable: false
    });
    Object.defineProperty(clone, 'text', {
      value: clone.text,
      enumerable: false
    });
    Object.defineProperty(clone, 'context', {
      value: clone.context,
      enumerable: false
    });
    hostCloneCounter++;
    return clone;
  }

  function shouldSetTextContent(type, props) {
    if (type === 'errorInBeginPhase') {
      throw new Error('Error in host config.');
    }

    return typeof props.children === 'string' || typeof props.children === 'number';
  }

  function computeText(rawText, hostContext) {
    return hostContext === UPPERCASE_CONTEXT ? rawText.toUpperCase() : rawText;
  }

  var sharedHostConfig = {
    getRootHostContext: function () {
      return NO_CONTEXT;
    },
    getChildHostContext: function (parentHostContext, type, rootcontainerInstance) {
      if (type === 'uppercase') {
        return UPPERCASE_CONTEXT;
      }

      return NO_CONTEXT;
    },
    getPublicInstance: function (instance) {
      return instance;
    },
    createInstance: function (type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
      if (type === 'errorInCompletePhase') {
        throw new Error('Error in host config.');
      }

      var inst = {
        id: instanceCounter++,
        type: type,
        children: [],
        text: shouldSetTextContent(type, props) ? computeText(props.children + '', hostContext) : null,
        prop: props.prop,
        hidden: !!props.hidden,
        context: hostContext
      }; // Hide from unit tests

      Object.defineProperty(inst, 'id', {
        value: inst.id,
        enumerable: false
      });
      Object.defineProperty(inst, 'text', {
        value: inst.text,
        enumerable: false
      });
      Object.defineProperty(inst, 'context', {
        value: inst.context,
        enumerable: false
      });
      Object.defineProperty(inst, 'fiber', {
        value: internalInstanceHandle,
        enumerable: false
      });
      return inst;
    },
    appendInitialChild: function (parentInstance, child) {
      parentInstance.children.push(child);
    },
    finalizeInitialChildren: function (domElement, type, props) {
      return false;
    },
    prepareUpdate: function (instance, type, oldProps, newProps) {
      if (type === 'errorInCompletePhase') {
        throw new Error('Error in host config.');
      }

      if (oldProps === null) {
        throw new Error('Should have old props');
      }

      if (newProps === null) {
        throw new Error('Should have new props');
      }

      hostDiffCounter++;
      return UPDATE_SIGNAL;
    },
    shouldSetTextContent: shouldSetTextContent,
    createTextInstance: function (text, rootContainerInstance, hostContext, internalInstanceHandle) {
      if (hostContext === UPPERCASE_CONTEXT) {
        text = text.toUpperCase();
      }

      var inst = {
        text: text,
        id: instanceCounter++,
        hidden: false,
        context: hostContext
      }; // Hide from unit tests

      Object.defineProperty(inst, 'id', {
        value: inst.id,
        enumerable: false
      });
      Object.defineProperty(inst, 'context', {
        value: inst.context,
        enumerable: false
      });
      return inst;
    },
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,
    supportsMicrotasks: true,
    scheduleMicrotask: typeof queueMicrotask === 'function' ? queueMicrotask : typeof Promise !== 'undefined' ? function (callback) {
      return Promise.resolve(null).then(callback).catch(function (error) {
        setTimeout(function () {
          throw error;
        });
      });
    } : setTimeout,
    prepareForCommit: function () {
      return null;
    },
    resetAfterCommit: function () {},
    getCurrentEventPriority: function () {
      return currentEventPriority;
    },
    now: Scheduler.unstable_now,
    isPrimaryRenderer: true,
    warnsIfNotActing: true,
    supportsHydration: false,
    getInstanceFromNode: function () {
      throw new Error('Not yet implemented.');
    },
    beforeActiveInstanceBlur: function () {// NO-OP
    },
    afterActiveInstanceBlur: function () {// NO-OP
    },
    preparePortalMount: function () {// NO-OP
    },
    prepareScopeUpdate: function () {},
    getInstanceFromScope: function () {
      throw new Error('Not yet implemented.');
    },
    detachDeletedInstance: function () {}
  };
  var hostConfig = useMutation ? _assign({}, sharedHostConfig, {
    supportsMutation: true,
    supportsPersistence: false,
    commitMount: function (instance, type, newProps) {// Noop
    },
    commitUpdate: function (instance, updatePayload, type, oldProps, newProps) {
      if (oldProps === null) {
        throw new Error('Should have old props');
      }

      hostUpdateCounter++;
      instance.prop = newProps.prop;
      instance.hidden = !!newProps.hidden;

      if (shouldSetTextContent(type, newProps)) {
        instance.text = computeText(newProps.children + '', instance.context);
      }
    },
    commitTextUpdate: function (textInstance, oldText, newText) {
      hostUpdateCounter++;
      textInstance.text = computeText(newText, textInstance.context);
    },
    appendChild: appendChild,
    appendChildToContainer: appendChildToContainer,
    insertBefore: insertBefore,
    insertInContainerBefore: insertInContainerBefore,
    removeChild: removeChild,
    removeChildFromContainer: removeChildFromContainer,
    clearContainer: clearContainer,
    hideInstance: function (instance) {
      instance.hidden = true;
    },
    hideTextInstance: function (textInstance) {
      textInstance.hidden = true;
    },
    unhideInstance: function (instance, props) {
      if (!props.hidden) {
        instance.hidden = false;
      }
    },
    unhideTextInstance: function (textInstance, text) {
      textInstance.hidden = false;
    },
    resetTextContent: function (instance) {
      instance.text = null;
    }
  }) : _assign({}, sharedHostConfig, {
    supportsMutation: false,
    supportsPersistence: true,
    cloneInstance: cloneInstance,
    clearContainer: clearContainer,
    createContainerChildSet: function (container) {
      return [];
    },
    appendChildToContainerChildSet: function (childSet, child) {
      childSet.push(child);
    },
    finalizeContainerChildren: function (container, newChildren) {
      container.pendingChildren = newChildren;

      if (newChildren.length === 1 && newChildren[0].text === 'Error when completing root') {
        // Trigger an error for testing purposes
        throw Error('Error when completing root');
      }
    },
    replaceContainerChildren: function (container, newChildren) {
      container.children = newChildren;
    },
    cloneHiddenInstance: function (instance, type, props, internalInstanceHandle) {
      var clone = cloneInstance(instance, null, type, props, props, internalInstanceHandle, true);
      clone.hidden = true;
      return clone;
    },
    cloneHiddenTextInstance: function (instance, text, internalInstanceHandle) {
      var clone = {
        text: instance.text,
        id: instanceCounter++,
        hidden: true,
        context: instance.context
      }; // Hide from unit tests

      Object.defineProperty(clone, 'id', {
        value: clone.id,
        enumerable: false
      });
      Object.defineProperty(clone, 'context', {
        value: clone.context,
        enumerable: false
      });
      return clone;
    }
  });
  var NoopRenderer = reconciler(hostConfig);
  var rootContainers = new Map();
  var roots = new Map();
  var DEFAULT_ROOT_ID = '<default>';
  var currentEventPriority = DefaultEventPriority;

  function childToJSX(child, text) {
    if (text !== null) {
      return text;
    }

    if (child === null) {
      return null;
    }

    if (typeof child === 'string') {
      return child;
    }

    if (Array.isArray(child)) {
      if (child.length === 0) {
        return null;
      }

      if (child.length === 1) {
        return childToJSX(child[0], null);
      } // $FlowFixMe


      var children = child.map(function (c) {
        return childToJSX(c, null);
      });

      if (children.every(function (c) {
        return typeof c === 'string' || typeof c === 'number';
      })) {
        return children.join('');
      }

      return children;
    }

    if (Array.isArray(child.children)) {
      // This is an instance.
      var instance = child;

      var _children = childToJSX(instance.children, instance.text);

      var props = {
        prop: instance.prop
      };

      if (instance.hidden) {
        props.hidden = true;
      }

      if (_children !== null) {
        props.children = _children;
      }

      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: instance.type,
        key: null,
        ref: null,
        props: props,
        _owner: null,
        _store:  {} 
      };
    } // This is a text instance


    var textInstance = child;

    if (textInstance.hidden) {
      return '';
    }

    return textInstance.text;
  }

  function getChildren(root) {
    if (root) {
      return root.children;
    } else {
      return null;
    }
  }

  function getPendingChildren(root) {
    if (root) {
      return root.pendingChildren;
    } else {
      return null;
    }
  }

  function getChildrenAsJSX(root) {
    var children = childToJSX(getChildren(root), null);

    if (children === null) {
      return null;
    }

    if (Array.isArray(children)) {
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: REACT_FRAGMENT_TYPE,
        key: null,
        ref: null,
        props: {
          children: children
        },
        _owner: null,
        _store:  {} 
      };
    }

    return children;
  }

  function getPendingChildrenAsJSX(root) {
    var children = childToJSX(getChildren(root), null);

    if (children === null) {
      return null;
    }

    if (Array.isArray(children)) {
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: REACT_FRAGMENT_TYPE,
        key: null,
        ref: null,
        props: {
          children: children
        },
        _owner: null,
        _store:  {} 
      };
    }

    return children;
  }

  var idCounter = 0;
  var ReactNoop = {
    _Scheduler: Scheduler,
    getChildren: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var container = rootContainers.get(rootID);
      return getChildren(container);
    },
    getPendingChildren: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var container = rootContainers.get(rootID);
      return getPendingChildren(container);
    },
    getOrCreateRootContainer: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var tag = arguments.length > 1 ? arguments[1] : undefined;
      var root = roots.get(rootID);

      if (!root) {
        var container = {
          rootID: rootID,
          pendingChildren: [],
          children: []
        };
        rootContainers.set(rootID, container);
        root = NoopRenderer.createContainer(container, tag, false, null, null);
        roots.set(rootID, root);
      }

      return root.current.stateNode.containerInfo;
    },
    // TODO: Replace ReactNoop.render with createRoot + root.render
    createRoot: function () {
      var container = {
        rootID: '' + idCounter++,
        pendingChildren: [],
        children: []
      };
      var fiberRoot = NoopRenderer.createContainer(container, ReactRootTags.ConcurrentRoot, false, null, null);
      return {
        _Scheduler: Scheduler,
        render: function (children) {
          NoopRenderer.updateContainer(children, fiberRoot, null, null);
        },
        getChildren: function () {
          return getChildren(container);
        },
        getChildrenAsJSX: function () {
          return getChildrenAsJSX(container);
        }
      };
    },
    createLegacyRoot: function () {
      var container = {
        rootID: '' + idCounter++,
        pendingChildren: [],
        children: []
      };
      var fiberRoot = NoopRenderer.createContainer(container, ReactRootTags.LegacyRoot, false, null, null);
      return {
        _Scheduler: Scheduler,
        render: function (children) {
          NoopRenderer.updateContainer(children, fiberRoot, null, null);
        },
        getChildren: function () {
          return getChildren(container);
        },
        getChildrenAsJSX: function () {
          return getChildrenAsJSX(container);
        }
      };
    },
    getChildrenAsJSX: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var container = rootContainers.get(rootID);
      return getChildrenAsJSX(container);
    },
    getPendingChildrenAsJSX: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var container = rootContainers.get(rootID);
      return getPendingChildrenAsJSX(container);
    },
    createPortal: function (children, container) {
      var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      return NoopRenderer.createPortal(children, container, null, key);
    },
    // Shortcut for testing a single root
    render: function (element, callback) {
      ReactNoop.renderToRootWithID(element, DEFAULT_ROOT_ID, callback);
    },
    renderLegacySyncRoot: function (element, callback) {
      var rootID = DEFAULT_ROOT_ID;
      var container = ReactNoop.getOrCreateRootContainer(rootID, ReactRootTags.LegacyRoot);
      var root = roots.get(container.rootID);
      NoopRenderer.updateContainer(element, root, null, callback);
    },
    renderToRootWithID: function (element, rootID, callback) {
      var container = ReactNoop.getOrCreateRootContainer(rootID, ReactRootTags.ConcurrentRoot);
      var root = roots.get(container.rootID);
      NoopRenderer.updateContainer(element, root, null, callback);
    },
    unmountRootWithID: function (rootID) {
      var root = roots.get(rootID);

      if (root) {
        NoopRenderer.updateContainer(null, root, null, function () {
          roots.delete(rootID);
          rootContainers.delete(rootID);
        });
      }
    },
    findInstance: function (componentOrElement) {
      if (componentOrElement == null) {
        return null;
      } // Unsound duck typing.


      var component = componentOrElement;

      if (typeof component.id === 'number') {
        return component;
      }

      {
        return NoopRenderer.findHostInstanceWithWarning(component, 'findInstance');
      }
    },
    flushNextYield: function () {
      Scheduler.unstable_flushNumberOfYields(1);
      return Scheduler.unstable_clearYields();
    },
    flushWithHostCounters: function (fn) {
      hostDiffCounter = 0;
      hostUpdateCounter = 0;
      hostCloneCounter = 0;

      try {
        Scheduler.unstable_flushAll();
        return useMutation ? {
          hostDiffCounter: hostDiffCounter,
          hostUpdateCounter: hostUpdateCounter
        } : {
          hostDiffCounter: hostDiffCounter,
          hostCloneCounter: hostCloneCounter
        };
      } finally {
        hostDiffCounter = 0;
        hostUpdateCounter = 0;
        hostCloneCounter = 0;
      }
    },
    expire: Scheduler.unstable_advanceTime,
    flushExpired: function () {
      return Scheduler.unstable_flushExpired();
    },
    unstable_runWithPriority: NoopRenderer.runWithPriority,
    batchedUpdates: NoopRenderer.batchedUpdates,
    deferredUpdates: NoopRenderer.deferredUpdates,
    unbatchedUpdates: NoopRenderer.unbatchedUpdates,
    discreteUpdates: NoopRenderer.discreteUpdates,
    idleUpdates: function (fn) {
      var prevEventPriority = currentEventPriority;
      currentEventPriority = NoopRenderer.IdleEventPriority;

      try {
        fn();
      } finally {
        currentEventPriority = prevEventPriority;
      }
    },
    flushDiscreteUpdates: NoopRenderer.flushDiscreteUpdates,
    flushSync: function (fn) {
      NoopRenderer.flushSync(fn);
    },
    flushPassiveEffects: NoopRenderer.flushPassiveEffects,
    act: noopAct,
    // Logs the current state of the tree.
    dumpTree: function () {
      var _console;

      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var root = roots.get(rootID);
      var rootContainer = rootContainers.get(rootID);

      if (!root || !rootContainer) {
        // eslint-disable-next-line react-internal/no-production-logging
        console.log('Nothing rendered yet.');
        return;
      }

      var bufferedLog = [];

      function log() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        bufferedLog.push.apply(bufferedLog, args.concat(['\n']));
      }

      function logHostInstances(children, depth) {
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var indent = '  '.repeat(depth);

          if (typeof child.text === 'string') {
            log(indent + '- ' + child.text);
          } else {
            // $FlowFixMe - The child should've been refined now.
            log(indent + '- ' + child.type + '#' + child.id); // $FlowFixMe - The child should've been refined now.

            logHostInstances(child.children, depth + 1);
          }
        }
      }

      function logContainer(container, depth) {
        log('  '.repeat(depth) + '- [root#' + container.rootID + ']');
        logHostInstances(container.children, depth + 1);
      }

      function logUpdateQueue(updateQueue, depth) {
        log('  '.repeat(depth + 1) + 'QUEUED UPDATES');
        var first = updateQueue.firstBaseUpdate;
        var update = first;

        if (update !== null) {
          do {
            log('  '.repeat(depth + 1) + '~', '[' + update.expirationTime + ']');
          } while (update !== null);
        }

        var lastPending = updateQueue.shared.pending;

        if (lastPending !== null) {
          var firstPending = lastPending.next;
          var pendingUpdate = firstPending;

          if (pendingUpdate !== null) {
            do {
              log('  '.repeat(depth + 1) + '~', '[' + pendingUpdate.expirationTime + ']');
            } while (pendingUpdate !== null && pendingUpdate !== firstPending);
          }
        }
      }

      function logFiber(fiber, depth) {
        log('  '.repeat(depth) + '- ' + ( // need to explicitly coerce Symbol to a string
        fiber.type ? fiber.type.name || fiber.type.toString() : '[root]'), '[' + fiber.childExpirationTime + (fiber.pendingProps ? '*' : '') + ']');

        if (fiber.updateQueue) {
          logUpdateQueue(fiber.updateQueue, depth);
        } // const childInProgress = fiber.progressedChild;
        // if (childInProgress && childInProgress !== fiber.child) {
        //   log(
        //     '  '.repeat(depth + 1) + 'IN PROGRESS: ' + fiber.pendingWorkPriority,
        //   );
        //   logFiber(childInProgress, depth + 1);
        //   if (fiber.child) {
        //     log('  '.repeat(depth + 1) + 'CURRENT');
        //   }
        // } else if (fiber.child && fiber.updateQueue) {
        //   log('  '.repeat(depth + 1) + 'CHILDREN');
        // }


        if (fiber.child) {
          logFiber(fiber.child, depth + 1);
        }

        if (fiber.sibling) {
          logFiber(fiber.sibling, depth);
        }
      }

      log('HOST INSTANCES:');
      logContainer(rootContainer, 0);
      log('FIBERS:');
      logFiber(root.current, 0); // eslint-disable-next-line react-internal/no-production-logging

      (_console = console).log.apply(_console, bufferedLog);
    },
    getRoot: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      return roots.get(rootID);
    }
  }; // This version of `act` is only used by our tests. Unlike the public version
  // of `act`, it's designed to work identically in both production and
  // development. It may have slightly different behavior from the public
  // version, too, since our constraints in our test suite are not the same as
  // those of developers using React — we're testing React itself, as opposed to
  // building an app with React.

  var batchedUpdates = NoopRenderer.batchedUpdates,
      IsThisRendererActing = NoopRenderer.IsThisRendererActing;
  var actingUpdatesScopeDepth = 0;

  function noopAct(scope) {
    if (Scheduler.unstable_flushAllWithoutAsserting === undefined) {
      throw Error('This version of `act` requires a special mock build of Scheduler.');
    }

    if (setTimeout._isMockFunction !== true) {
      throw Error("This version of `act` requires Jest's timer mocks " + '(i.e. jest.useFakeTimers).');
    }

    var previousActingUpdatesScopeDepth = actingUpdatesScopeDepth;
    var previousIsSomeRendererActing = IsSomeRendererActing.current;
    var previousIsThisRendererActing = IsThisRendererActing.current;
    IsSomeRendererActing.current = true;
    IsThisRendererActing.current = true;
    actingUpdatesScopeDepth++;

    var unwind = function () {
      actingUpdatesScopeDepth--;
      IsSomeRendererActing.current = previousIsSomeRendererActing;
      IsThisRendererActing.current = previousIsThisRendererActing;

      {
        if (actingUpdatesScopeDepth > previousActingUpdatesScopeDepth) {
          // if it's _less than_ previousActingUpdatesScopeDepth, then we can
          // assume the 'other' one has warned
          error('You seem to have overlapping act() calls, this is not supported. ' + 'Be sure to await previous act() calls before making a new one. ');
        }
      }
    }; // TODO: This would be way simpler if 1) we required a promise to be
    // returned and 2) we could use async/await. Since it's only our used in
    // our test suite, we should be able to.


    try {
      var thenable = batchedUpdates(scope);

      if (typeof thenable === 'object' && thenable !== null && typeof thenable.then === 'function') {
        return {
          then: function (resolve, reject) {
            thenable.then(function () {
              flushActWork(function () {
                unwind();
                resolve();
              }, function (error) {
                unwind();
                reject(error);
              });
            }, function (error) {
              unwind();
              reject(error);
            });
          }
        };
      } else {
        try {
          // TODO: Let's not support non-async scopes at all in our tests. Need to
          // migrate existing tests.
          var didFlushWork;

          do {
            didFlushWork = Scheduler.unstable_flushAllWithoutAsserting();
          } while (didFlushWork);
        } finally {
          unwind();
        }
      }
    } catch (error) {
      unwind();
      throw error;
    }
  }

  function flushActWork(resolve, reject) {
    // Flush suspended fallbacks
    // $FlowFixMe: Flow doesn't know about global Jest object
    jest.runOnlyPendingTimers();
    enqueueTask(function () {
      try {
        var didFlushWork = Scheduler.unstable_flushAllWithoutAsserting();

        if (didFlushWork) {
          flushActWork(resolve, reject);
        } else {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  return ReactNoop;
}

/**
 * This is a renderer of React that doesn't have a render target output.
 * It is useful to demonstrate the internals of the reconciler in isolation
 * and for testing semantics of reconciliation separate from the host
 * environment.
 */

var _createReactNoop = createReactNoop(ReactFiberReconciler, // reconciler
true // useMutation
),
    _Scheduler = _createReactNoop._Scheduler,
    getChildren = _createReactNoop.getChildren,
    getPendingChildren = _createReactNoop.getPendingChildren,
    getOrCreateRootContainer = _createReactNoop.getOrCreateRootContainer,
    createRoot = _createReactNoop.createRoot,
    createLegacyRoot = _createReactNoop.createLegacyRoot,
    getChildrenAsJSX = _createReactNoop.getChildrenAsJSX,
    getPendingChildrenAsJSX = _createReactNoop.getPendingChildrenAsJSX,
    createPortal = _createReactNoop.createPortal,
    render = _createReactNoop.render,
    renderLegacySyncRoot = _createReactNoop.renderLegacySyncRoot,
    renderToRootWithID = _createReactNoop.renderToRootWithID,
    unmountRootWithID = _createReactNoop.unmountRootWithID,
    findInstance = _createReactNoop.findInstance,
    flushNextYield = _createReactNoop.flushNextYield,
    flushWithHostCounters = _createReactNoop.flushWithHostCounters,
    expire = _createReactNoop.expire,
    flushExpired = _createReactNoop.flushExpired,
    batchedUpdates = _createReactNoop.batchedUpdates,
    deferredUpdates = _createReactNoop.deferredUpdates,
    unbatchedUpdates = _createReactNoop.unbatchedUpdates,
    discreteUpdates = _createReactNoop.discreteUpdates,
    idleUpdates = _createReactNoop.idleUpdates,
    flushDiscreteUpdates = _createReactNoop.flushDiscreteUpdates,
    flushSync = _createReactNoop.flushSync,
    flushPassiveEffects = _createReactNoop.flushPassiveEffects,
    act = _createReactNoop.act,
    dumpTree = _createReactNoop.dumpTree,
    getRoot = _createReactNoop.getRoot,
    unstable_runWithPriority = _createReactNoop.unstable_runWithPriority;

exports._Scheduler = _Scheduler;
exports.act = act;
exports.batchedUpdates = batchedUpdates;
exports.createLegacyRoot = createLegacyRoot;
exports.createPortal = createPortal;
exports.createRoot = createRoot;
exports.deferredUpdates = deferredUpdates;
exports.discreteUpdates = discreteUpdates;
exports.dumpTree = dumpTree;
exports.expire = expire;
exports.findInstance = findInstance;
exports.flushDiscreteUpdates = flushDiscreteUpdates;
exports.flushExpired = flushExpired;
exports.flushNextYield = flushNextYield;
exports.flushPassiveEffects = flushPassiveEffects;
exports.flushSync = flushSync;
exports.flushWithHostCounters = flushWithHostCounters;
exports.getChildren = getChildren;
exports.getChildrenAsJSX = getChildrenAsJSX;
exports.getOrCreateRootContainer = getOrCreateRootContainer;
exports.getPendingChildren = getPendingChildren;
exports.getPendingChildrenAsJSX = getPendingChildrenAsJSX;
exports.getRoot = getRoot;
exports.idleUpdates = idleUpdates;
exports.render = render;
exports.renderLegacySyncRoot = renderLegacySyncRoot;
exports.renderToRootWithID = renderToRootWithID;
exports.unbatchedUpdates = unbatchedUpdates;
exports.unmountRootWithID = unmountRootWithID;
exports.unstable_runWithPriority = unstable_runWithPriority;
  })();
}
