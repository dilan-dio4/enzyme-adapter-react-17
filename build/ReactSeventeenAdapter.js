"use strict";

var _object = _interopRequireDefault(require("object.assign"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _server = _interopRequireDefault(require("react-dom/server"));

var _shallow = _interopRequireDefault(require("react-test-renderer/shallow"));

var _testUtils = _interopRequireDefault(require("react-dom/test-utils"));

var _checkPropTypes2 = _interopRequireDefault(require("prop-types/checkPropTypes"));

var _has = _interopRequireDefault(require("has"));

var _reactIs = require("react-is");

var _enzyme = require("enzyme");

var _Utils = require("enzyme/build/Utils");

var _enzymeShallowEqual = _interopRequireDefault(require("enzyme-shallow-equal"));

var _enzymeAdapterUtils = require("@wojtekmaj/enzyme-adapter-utils");

var _findCurrentFiberUsingSlowPath = _interopRequireDefault(require("./findCurrentFiberUsingSlowPath"));

var _detectFiberTags = _interopRequireDefault(require("./detectFiberTags"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Lazily populated if DOM is available.
var FiberTags = null;

function nodeAndSiblingsArray(nodeWithSibling) {
  var array = [];
  var node = nodeWithSibling;

  while (node != null) {
    array.push(node);
    node = node.sibling;
  }

  return array;
}

function flatten(arr) {
  var result = [];
  var stack = [{
    i: 0,
    array: arr
  }];

  while (stack.length) {
    var n = stack.pop();

    while (n.i < n.array.length) {
      var el = n.array[n.i];
      n.i += 1;

      if (Array.isArray(el)) {
        stack.push(n);
        stack.push({
          i: 0,
          array: el
        });
        break;
      }

      result.push(el);
    }
  }

  return result;
}

function nodeTypeFromType(type) {
  if (type === _reactIs.Portal) {
    return 'portal';
  }

  return (0, _enzymeAdapterUtils.nodeTypeFromType)(type);
}

function isMemo(type) {
  return (0, _enzymeAdapterUtils.compareNodeTypeOf)(type, _reactIs.Memo);
}

function isLazy(type) {
  return (0, _enzymeAdapterUtils.compareNodeTypeOf)(type, _reactIs.Lazy);
}

function unmemoType(type) {
  return isMemo(type) ? type.type : type;
}

function checkIsSuspenseAndCloneElement(el, _ref) {
  var suspenseFallback = _ref.suspenseFallback;

  if (!(0, _reactIs.isSuspense)(el)) {
    return el;
  }

  var children = el.props.children;

  if (suspenseFallback) {
    var fallback = el.props.fallback;
    children = replaceLazyWithFallback(children, fallback);
  }

  var FakeSuspenseWrapper = function FakeSuspenseWrapper(props) {
    return /*#__PURE__*/_react["default"].createElement(el.type, _objectSpread(_objectSpread({}, el.props), props), children);
  };

  return /*#__PURE__*/_react["default"].createElement(FakeSuspenseWrapper, null, children);
}

function elementToTree(el) {
  if (!(0, _reactIs.isPortal)(el)) {
    return (0, _enzymeAdapterUtils.elementToTree)(el, elementToTree);
  }

  var children = el.children,
      containerInfo = el.containerInfo;
  var props = {
    children: children,
    containerInfo: containerInfo
  };
  return {
    nodeType: 'portal',
    type: _reactIs.Portal,
    props: props,
    key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(el.key),
    ref: el.ref || null,
    instance: null,
    rendered: elementToTree(el.children)
  };
}

function _toTree(vnode) {
  if (vnode == null) {
    return null;
  } // TODO(lmr): I'm not really sure I understand whether or not this is what
  // i should be doing, or if this is a hack for something i'm doing wrong
  // somewhere else. Should talk to sebastian about this perhaps


  var node = (0, _findCurrentFiberUsingSlowPath["default"])(vnode);

  switch (node.tag) {
    case FiberTags.HostRoot:
      return childrenToTree(node.child);

    case FiberTags.HostPortal:
      {
        var containerInfo = node.stateNode.containerInfo,
            children = node.memoizedProps;
        var props = {
          containerInfo: containerInfo,
          children: children
        };
        return {
          nodeType: 'portal',
          type: _reactIs.Portal,
          props: props,
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: childrenToTree(node.child)
        };
      }

    case FiberTags.ClassComponent:
      return {
        nodeType: 'class',
        type: node.type,
        props: _objectSpread({}, node.memoizedProps),
        key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
        ref: node.ref,
        instance: node.stateNode,
        rendered: childrenToTree(node.child)
      };

    case FiberTags.FunctionalComponent:
      return {
        nodeType: 'function',
        type: node.type,
        props: _objectSpread({}, node.memoizedProps),
        key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
        ref: node.ref,
        instance: null,
        rendered: childrenToTree(node.child)
      };

    case FiberTags.MemoClass:
      return {
        nodeType: 'class',
        type: node.elementType.type,
        props: _objectSpread({}, node.memoizedProps),
        key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
        ref: node.ref,
        instance: node.stateNode,
        rendered: childrenToTree(node.child.child)
      };

    case FiberTags.MemoSFC:
      {
        var renderedNodes = flatten(nodeAndSiblingsArray(node.child).map(_toTree));

        if (renderedNodes.length === 0) {
          renderedNodes = [node.memoizedProps.children];
        }

        return {
          nodeType: 'function',
          type: node.elementType,
          props: _objectSpread({}, node.memoizedProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: renderedNodes
        };
      }

    case FiberTags.HostComponent:
      {
        var _renderedNodes = flatten(nodeAndSiblingsArray(node.child).map(_toTree));

        if (_renderedNodes.length === 0) {
          _renderedNodes = [node.memoizedProps.children];
        }

        return {
          nodeType: 'host',
          type: node.type,
          props: _objectSpread({}, node.memoizedProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: node.stateNode,
          rendered: _renderedNodes
        };
      }

    case FiberTags.HostText:
      return node.memoizedProps;

    case FiberTags.Fragment:
    case FiberTags.Mode:
    case FiberTags.ContextProvider:
    case FiberTags.ContextConsumer:
      return childrenToTree(node.child);

    case FiberTags.Profiler:
    case FiberTags.ForwardRef:
      {
        return {
          nodeType: 'function',
          type: node.type,
          props: _objectSpread({}, node.pendingProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: childrenToTree(node.child)
        };
      }

    case FiberTags.Suspense:
      {
        return {
          nodeType: 'function',
          type: _reactIs.Suspense,
          props: _objectSpread({}, node.memoizedProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: childrenToTree(node.child)
        };
      }

    case FiberTags.Lazy:
      return childrenToTree(node.child);

    case FiberTags.OffscreenComponent:
      return _toTree(node.child);

    default:
      throw new Error("Enzyme Internal Error: unknown node with tag ".concat(node.tag));
  }
}

function childrenToTree(node) {
  if (!node) {
    return null;
  }

  var children = nodeAndSiblingsArray(node);

  if (children.length === 0) {
    return null;
  }

  if (children.length === 1) {
    return _toTree(children[0]);
  }

  return flatten(children.map(_toTree));
}

function _nodeToHostNode(_node) {
  // NOTE(lmr): node could be a function component
  // which wont have an instance prop, but we can get the
  // host node associated with its return value at that point.
  // Although this breaks down if the return value is an array,
  // as is possible with React 16.
  var node = _node;

  while (node && !Array.isArray(node) && node.instance === null) {
    node = node.rendered;
  } // if the SFC returned null effectively, there is no host node.


  if (!node) {
    return null;
  }

  var mapper = function mapper(item) {
    if (item && item.instance) return _reactDom["default"].findDOMNode(item.instance);
    return null;
  };

  if (Array.isArray(node)) {
    return node.map(mapper);
  }

  if (Array.isArray(node.rendered) && node.nodeType === 'class') {
    return node.rendered.map(mapper);
  }

  return mapper(node);
}

function replaceLazyWithFallback(node, fallback) {
  if (!node) {
    return null;
  }

  if (Array.isArray(node)) {
    return node.map(function (el) {
      return replaceLazyWithFallback(el, fallback);
    });
  }

  if (isLazy(node.type)) {
    return fallback;
  }

  return _objectSpread(_objectSpread({}, node), {}, {
    props: _objectSpread(_objectSpread({}, node.props), {}, {
      children: replaceLazyWithFallback(node.props.children, fallback)
    })
  });
}

var eventOptions = {
  animation: true,
  pointerEvents: true,
  auxClick: true
};

function getEmptyStateValue() {
  // this handles a bug in React 16.0 - 16.2
  // see https://github.com/facebook/react/commit/39be83565c65f9c522150e52375167568a2a1459
  // also see https://github.com/facebook/react/pull/11965
  var EmptyState = /*#__PURE__*/function (_React$Component) {
    _inherits(EmptyState, _React$Component);

    var _super = _createSuper(EmptyState);

    function EmptyState() {
      _classCallCheck(this, EmptyState);

      return _super.apply(this, arguments);
    }

    _createClass(EmptyState, [{
      key: "render",
      value: function render() {
        return null;
      }
    }]);

    return EmptyState;
  }(_react["default"].Component);

  var testRenderer = new _shallow["default"]();
  testRenderer.render( /*#__PURE__*/_react["default"].createElement(EmptyState));
  return testRenderer._instance.state;
}

function wrapAct(fn) {
  var returnVal;

  _testUtils["default"].act(function () {
    returnVal = fn();
  });

  return returnVal;
}

function getProviderDefaultValue(Provider) {
  // React stores references to the Provider's defaultValue differently across versions.
  if ('_defaultValue' in Provider._context) {
    return Provider._context._defaultValue;
  }

  if ('_currentValue' in Provider._context) {
    return Provider._context._currentValue;
  }

  throw new Error('Enzyme Internal Error: can’t figure out how to get Provider’s default value');
}

function makeFakeElement(type) {
  return {
    $$typeof: _reactIs.Element,
    type: type
  };
}

function isStateful(Component) {
  return Component.prototype && (Component.prototype.isReactComponent || Array.isArray(Component.__reactAutoBindPairs) // fallback for createClass components
  );
}

var ReactSeventeenAdapter = /*#__PURE__*/function (_EnzymeAdapter) {
  _inherits(ReactSeventeenAdapter, _EnzymeAdapter);

  var _super2 = _createSuper(ReactSeventeenAdapter);

  function ReactSeventeenAdapter() {
    var _this;

    _classCallCheck(this, ReactSeventeenAdapter);

    _this = _super2.call(this);
    var lifecycles = _this.options.lifecycles;
    _this.options = _objectSpread(_objectSpread({}, _this.options), {}, {
      enableComponentDidUpdateOnSetState: true,
      // TODO: remove, semver-major
      legacyContextMode: 'parent',
      lifecycles: _objectSpread(_objectSpread({}, lifecycles), {}, {
        componentDidUpdate: {
          onSetState: true
        },
        getDerivedStateFromProps: {
          hasShouldComponentUpdateBug: false
        },
        getSnapshotBeforeUpdate: true,
        setState: {
          skipsComponentDidUpdateOnNullish: true
        },
        getChildContext: {
          calledByRenderer: false
        },
        getDerivedStateFromError: true
      })
    });
    return _this;
  }

  _createClass(ReactSeventeenAdapter, [{
    key: "createMountRenderer",
    value: function createMountRenderer(options) {
      (0, _enzymeAdapterUtils.assertDomAvailable)('mount');

      if ((0, _has["default"])(options, 'suspenseFallback')) {
        throw new TypeError('`suspenseFallback` is not supported by the `mount` renderer');
      }

      if (FiberTags === null) {
        // Requires DOM.
        FiberTags = (0, _detectFiberTags["default"])();
      }

      var attachTo = options.attachTo,
          hydrateIn = options.hydrateIn,
          wrappingComponentProps = options.wrappingComponentProps;
      var domNode = hydrateIn || attachTo || global.document.createElement('div');
      var instance = null;
      var adapter = this;
      return {
        render: function render(el, context, callback) {
          return wrapAct(function () {
            if (instance === null) {
              var type = el.type,
                  props = el.props,
                  ref = el.ref;

              var wrapperProps = _objectSpread({
                Component: type,
                props: props,
                wrappingComponentProps: wrappingComponentProps,
                context: context
              }, ref && {
                refProp: ref
              });

              var ReactWrapperComponent = (0, _enzymeAdapterUtils.createMountWrapper)(el, _objectSpread(_objectSpread({}, options), {}, {
                adapter: adapter
              }));

              var wrappedEl = /*#__PURE__*/_react["default"].createElement(ReactWrapperComponent, wrapperProps);

              instance = hydrateIn ? _reactDom["default"].hydrate(wrappedEl, domNode) : _reactDom["default"].render(wrappedEl, domNode);

              if (typeof callback === 'function') {
                callback();
              }
            } else {
              instance.setChildProps(el.props, context, callback);
            }
          });
        },
        unmount: function unmount() {
          wrapAct(function () {
            _reactDom["default"].unmountComponentAtNode(domNode);
          });
          instance = null;
        },
        getNode: function getNode() {
          if (!instance) {
            return null;
          }

          return (0, _enzymeAdapterUtils.getNodeFromRootFinder)(adapter.isCustomComponent, _toTree(instance._reactInternals), options);
        },
        simulateError: function simulateError(nodeHierarchy, rootNode, error) {
          var isErrorBoundary = function isErrorBoundary(_ref2) {
            var elInstance = _ref2.instance,
                type = _ref2.type;

            if (type && type.getDerivedStateFromError) {
              return true;
            }

            return elInstance && elInstance.componentDidCatch;
          };

          var _ref3 = nodeHierarchy.find(isErrorBoundary) || {},
              catchingInstance = _ref3.instance,
              catchingType = _ref3.type;

          (0, _enzymeAdapterUtils.simulateError)(error, catchingInstance, rootNode, nodeHierarchy, nodeTypeFromType, adapter.displayNameOfNode, catchingType);
        },
        simulateEvent: function simulateEvent(node, event, mock) {
          var mappedEvent = (0, _enzymeAdapterUtils.mapNativeEventNames)(event, eventOptions);
          var eventFn = _testUtils["default"].Simulate[mappedEvent];

          if (!eventFn) {
            throw new TypeError("ReactWrapper::simulate() event '".concat(event, "' does not exist"));
          }

          wrapAct(function () {
            eventFn(adapter.nodeToHostNode(node), mock);
          });
        },
        batchedUpdates: function batchedUpdates(fn) {
          return fn(); // return ReactDOM.unstable_batchedUpdates(fn);
        },
        getWrappingComponentRenderer: function getWrappingComponentRenderer() {
          return _objectSpread(_objectSpread({}, this), (0, _enzymeAdapterUtils.getWrappingComponentMountRenderer)({
            toTree: function toTree(inst) {
              return _toTree(inst._reactInternals);
            },
            getMountWrapperInstance: function getMountWrapperInstance() {
              return instance;
            }
          }));
        },
        wrapInvoke: wrapAct
      };
    }
  }, {
    key: "createShallowRenderer",
    value: function createShallowRenderer() {
      var _this2 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var adapter = this;
      var renderer = new _shallow["default"]();
      var suspenseFallback = options.suspenseFallback;

      if (typeof suspenseFallback !== 'undefined' && typeof suspenseFallback !== 'boolean') {
        throw TypeError('`options.suspenseFallback` should be boolean or undefined');
      }

      var isDOM = false;
      var cachedNode = null;
      var lastComponent = null;
      var wrappedComponent = null;
      var sentinel = {}; // wrap memo components with a PureComponent, or a class component with sCU

      var wrapPureComponent = function wrapPureComponent(Component, compare) {
        if (lastComponent !== Component) {
          if (isStateful(Component)) {
            wrappedComponent = /*#__PURE__*/function (_Component) {
              _inherits(wrappedComponent, _Component);

              var _super3 = _createSuper(wrappedComponent);

              function wrappedComponent() {
                _classCallCheck(this, wrappedComponent);

                return _super3.apply(this, arguments);
              }

              return wrappedComponent;
            }(Component);

            if (compare) {
              wrappedComponent.prototype.shouldComponentUpdate = function (nextProps) {
                return !compare(_this2.props, nextProps);
              };
            } else {
              wrappedComponent.prototype.isPureReactComponent = true;
            }
          } else {
            var memoized = sentinel;
            var prevProps;

            wrappedComponent = function wrappedComponentFn(props) {
              var shouldUpdate = memoized === sentinel || (compare ? !compare(prevProps, props) : !(0, _enzymeShallowEqual["default"])(prevProps, props));

              if (shouldUpdate) {
                for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  args[_key - 1] = arguments[_key];
                }

                memoized = Component.apply(void 0, [_objectSpread(_objectSpread({}, Component.defaultProps), props)].concat(args));
                prevProps = props;
              }

              return memoized;
            };
          }

          (0, _object["default"])(wrappedComponent, Component, {
            displayName: adapter.displayNameOfNode({
              type: Component
            })
          });
          lastComponent = Component;
        }

        return wrappedComponent;
      }; // Wrap functional components on versions prior to 16.5,
      // to avoid inadvertently pass a `this` instance to it.


      var wrapFunctionalComponent = function wrapFunctionalComponent(Component) {
        if ((0, _has["default"])(Component, 'defaultProps')) {
          if (lastComponent !== Component) {
            wrappedComponent = (0, _object["default"])( // eslint-disable-next-line new-cap
            function (props) {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }

              return Component.apply(void 0, [_objectSpread(_objectSpread({}, Component.defaultProps), props)].concat(args));
            }, Component, {
              displayName: adapter.displayNameOfNode({
                type: Component
              })
            });
            lastComponent = Component;
          }

          return wrappedComponent;
        }

        return Component;
      };

      var renderElement = function renderElement(elConfig) {
        for (var _len3 = arguments.length, rest = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          rest[_key3 - 1] = arguments[_key3];
        }

        var renderedEl = renderer.render.apply(renderer, [elConfig].concat(rest));
        var typeIsExisted = !!(renderedEl && renderedEl.type);

        if (typeIsExisted) {
          var clonedEl = checkIsSuspenseAndCloneElement(renderedEl, {
            suspenseFallback: suspenseFallback
          });
          var elementIsChanged = clonedEl.type !== renderedEl.type;

          if (elementIsChanged) {
            return renderer.render.apply(renderer, [_objectSpread(_objectSpread({}, elConfig), {}, {
              type: clonedEl.type
            })].concat(rest));
          }
        }

        return renderedEl;
      };

      return {
        // eslint-disable-next-line consistent-return
        render: function render(el, unmaskedContext) {
          var _ref4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
              _ref4$providerValues = _ref4.providerValues,
              providerValues = _ref4$providerValues === void 0 ? new Map() : _ref4$providerValues;

          cachedNode = el;

          if (typeof el.type === 'string') {
            isDOM = true;
          } else if ((0, _reactIs.isContextProvider)(el)) {
            providerValues.set(el.type, el.props.value);
            var MockProvider = (0, _object["default"])(function (props) {
              return props.children;
            }, el.type);
            return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
              return renderElement(_objectSpread(_objectSpread({}, el), {}, {
                type: MockProvider
              }));
            });
          } else if ((0, _reactIs.isContextConsumer)(el)) {
            var Provider = adapter.getProviderFromConsumer(el.type);
            var value = providerValues.has(Provider) ? providerValues.get(Provider) : getProviderDefaultValue(Provider);
            var MockConsumer = (0, _object["default"])(function (props) {
              return props.children(value);
            }, el.type);
            return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
              return renderElement(_objectSpread(_objectSpread({}, el), {}, {
                type: MockConsumer
              }));
            });
          } else {
            isDOM = false;
            var renderedEl = el;

            if (isLazy(renderedEl)) {
              throw TypeError('`React.lazy` is not supported by shallow rendering.');
            }

            renderedEl = checkIsSuspenseAndCloneElement(renderedEl, {
              suspenseFallback: suspenseFallback
            });
            var _renderedEl = renderedEl,
                Component = _renderedEl.type;
            var context = (0, _enzymeAdapterUtils.getMaskedContext)(Component.contextTypes, unmaskedContext);

            if (isMemo(el.type)) {
              var _el$type = el.type,
                  InnerComp = _el$type.type,
                  compare = _el$type.compare;
              return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                return renderElement(_objectSpread(_objectSpread({}, el), {}, {
                  type: wrapPureComponent(InnerComp, compare)
                }), context);
              });
            }

            var isComponentStateful = isStateful(Component);

            if (!isComponentStateful && typeof Component === 'function') {
              return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                return renderElement(_objectSpread(_objectSpread({}, renderedEl), {}, {
                  type: wrapFunctionalComponent(Component)
                }), context);
              });
            }

            if (isComponentStateful) {
              if (renderer._instance && el.props === renderer._instance.props && !(0, _enzymeShallowEqual["default"])(context, renderer._instance.context)) {
                var _spyMethod = (0, _enzymeAdapterUtils.spyMethod)(renderer, '_updateClassComponent', function (originalMethod) {
                  return function _updateClassComponent() {
                    var props = renderer._instance.props;

                    var clonedProps = _objectSpread({}, props);

                    renderer._instance.props = clonedProps;

                    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                      args[_key4] = arguments[_key4];
                    }

                    var result = originalMethod.apply(renderer, args);
                    renderer._instance.props = props;
                    restore();
                    return result;
                  };
                }),
                    restore = _spyMethod.restore;
              } // fix react bug; see implementation of `getEmptyStateValue`


              var emptyStateValue = getEmptyStateValue();

              if (emptyStateValue) {
                Object.defineProperty(Component.prototype, 'state', {
                  configurable: true,
                  enumerable: true,
                  get: function get() {
                    return null;
                  },
                  set: function set(value) {
                    if (value !== emptyStateValue) {
                      Object.defineProperty(this, 'state', {
                        configurable: true,
                        enumerable: true,
                        value: value,
                        writable: true
                      });
                    }

                    return true;
                  }
                });
              }
            }

            return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
              return renderElement(renderedEl, context);
            });
          }
        },
        unmount: function unmount() {
          renderer.unmount();
        },
        getNode: function getNode() {
          if (isDOM) {
            return elementToTree(cachedNode);
          }

          var output = renderer.getRenderOutput();
          return {
            nodeType: nodeTypeFromType(cachedNode.type),
            type: cachedNode.type,
            props: cachedNode.props,
            key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(cachedNode.key),
            ref: cachedNode.ref,
            instance: renderer._instance,
            rendered: Array.isArray(output) ? flatten(output).map(function (el) {
              return elementToTree(el);
            }) : elementToTree(output)
          };
        },
        simulateError: function simulateError(nodeHierarchy, rootNode, error) {
          (0, _enzymeAdapterUtils.simulateError)(error, renderer._instance, cachedNode, nodeHierarchy.concat(cachedNode), nodeTypeFromType, adapter.displayNameOfNode, cachedNode.type);
        },
        simulateEvent: function simulateEvent(node, event) {
          for (var _len5 = arguments.length, args = new Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
            args[_key5 - 2] = arguments[_key5];
          }

          var handler = node.props[(0, _enzymeAdapterUtils.propFromEvent)(event, eventOptions)];

          if (handler) {
            (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
              // TODO(lmr): create/use synthetic events
              // TODO(lmr): emulate React's event propagation
              // ReactDOM.unstable_batchedUpdates(() => {
              handler.apply(void 0, args); // });
            });
          }
        },
        batchedUpdates: function batchedUpdates(fn) {
          return fn(); // return ReactDOM.unstable_batchedUpdates(fn);
        },
        checkPropTypes: function checkPropTypes(typeSpecs, values, location, hierarchy) {
          return (0, _checkPropTypes2["default"])(typeSpecs, values, location, (0, _enzymeAdapterUtils.displayNameOfNode)(cachedNode), function () {
            return (0, _enzymeAdapterUtils.getComponentStack)(hierarchy.concat([cachedNode]));
          });
        }
      };
    }
  }, {
    key: "createStringRenderer",
    value: function createStringRenderer(options) {
      if ((0, _has["default"])(options, 'suspenseFallback')) {
        throw new TypeError('`suspenseFallback` should not be specified in options of string renderer');
      }

      return {
        render: function render(el, context) {
          if (options.context && (el.type.contextTypes || options.childContextTypes)) {
            var childContextTypes = _objectSpread(_objectSpread({}, el.type.contextTypes || {}), options.childContextTypes);

            var ContextWrapper = (0, _enzymeAdapterUtils.createRenderWrapper)(el, context, childContextTypes);
            return _server["default"].renderToStaticMarkup( /*#__PURE__*/_react["default"].createElement(ContextWrapper));
          }

          return _server["default"].renderToStaticMarkup(el);
        }
      };
    } // Provided a bag of options, return an `EnzymeRenderer`. Some options can be implementation
    // specific, like `attach` etc. for React, but not part of this interface explicitly.
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: "createRenderer",
    value: function createRenderer(options) {
      switch (options.mode) {
        case _enzyme.EnzymeAdapter.MODES.MOUNT:
          return this.createMountRenderer(options);

        case _enzyme.EnzymeAdapter.MODES.SHALLOW:
          return this.createShallowRenderer(options);

        case _enzyme.EnzymeAdapter.MODES.STRING:
          return this.createStringRenderer(options);

        default:
          throw new Error("Enzyme Internal Error: Unrecognized mode: ".concat(options.mode));
      }
    }
  }, {
    key: "wrap",
    value: function wrap(element) {
      return (0, _enzymeAdapterUtils.wrap)(element);
    } // converts an RSTNode to the corresponding JSX Pragma Element. This will be needed
    // in order to implement the `Wrapper.mount()` and `Wrapper.shallow()` methods, but should
    // be pretty straightforward for people to implement.
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: "nodeToElement",
    value: function nodeToElement(node) {
      if (!node || _typeof(node) !== 'object') return null;
      var type = node.type;
      return /*#__PURE__*/_react["default"].createElement(unmemoType(type), (0, _enzymeAdapterUtils.propsWithKeysAndRef)(node));
    } // eslint-disable-next-line class-methods-use-this

  }, {
    key: "matchesElementType",
    value: function matchesElementType(node, matchingType) {
      if (!node) {
        return node;
      }

      var type = node.type;
      return unmemoType(type) === unmemoType(matchingType);
    }
  }, {
    key: "elementToNode",
    value: function elementToNode(element) {
      return elementToTree(element);
    }
  }, {
    key: "nodeToHostNode",
    value: function nodeToHostNode(node) {
      var supportsArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var nodes = _nodeToHostNode(node);

      if (Array.isArray(nodes) && !supportsArray) {
        return nodes[0];
      }

      return nodes;
    }
  }, {
    key: "displayNameOfNode",
    value: function displayNameOfNode(node) {
      if (!node) return null;
      var type = node.type,
          $$typeof = node.$$typeof;
      var adapter = this;
      var nodeType = type || $$typeof; // newer node types may be undefined, so only test if the nodeType exists

      if (nodeType) {
        switch (nodeType) {
          case _reactIs.ConcurrentMode || NaN:
            return 'ConcurrentMode';

          case _reactIs.Fragment || NaN:
            return 'Fragment';

          case _reactIs.StrictMode || NaN:
            return 'StrictMode';

          case _reactIs.Profiler || NaN:
            return 'Profiler';

          case _reactIs.Portal || NaN:
            return 'Portal';

          case _reactIs.Suspense || NaN:
            return 'Suspense';

          default:
        }
      }

      var $$typeofType = type && type.$$typeof;

      switch ($$typeofType) {
        case _reactIs.ContextConsumer || NaN:
          return 'ContextConsumer';

        case _reactIs.ContextProvider || NaN:
          return 'ContextProvider';

        case _reactIs.Memo || NaN:
          {
            var nodeName = (0, _enzymeAdapterUtils.displayNameOfNode)(node);
            return typeof nodeName === 'string' ? nodeName : "Memo(".concat(adapter.displayNameOfNode(type), ")");
          }

        case _reactIs.ForwardRef || NaN:
          {
            if (type.displayName) {
              return type.displayName;
            }

            var name = adapter.displayNameOfNode({
              type: type.render
            });
            return name ? "ForwardRef(".concat(name, ")") : 'ForwardRef';
          }

        case _reactIs.Lazy || NaN:
          {
            return 'lazy';
          }

        default:
          return (0, _enzymeAdapterUtils.displayNameOfNode)(node);
      }
    }
  }, {
    key: "isValidElement",
    value: function isValidElement(element) {
      return (0, _reactIs.isElement)(element);
    }
  }, {
    key: "isValidElementType",
    value: function isValidElementType(object) {
      return !!object && (0, _reactIs.isValidElementType)(object);
    }
  }, {
    key: "isFragment",
    value: function isFragment(fragment) {
      return (0, _Utils.typeOfNode)(fragment) === _reactIs.Fragment;
    }
  }, {
    key: "isCustomComponent",
    value: function isCustomComponent(type) {
      var fakeElement = makeFakeElement(type);
      return !!type && (typeof type === 'function' || (0, _reactIs.isForwardRef)(fakeElement) || (0, _reactIs.isContextProvider)(fakeElement) || (0, _reactIs.isContextConsumer)(fakeElement) || (0, _reactIs.isSuspense)(fakeElement));
    }
  }, {
    key: "isContextConsumer",
    value: function isContextConsumer(type) {
      return !!type && (0, _reactIs.isContextConsumer)(makeFakeElement(type));
    }
  }, {
    key: "isCustomComponentElement",
    value: function isCustomComponentElement(inst) {
      if (!inst || !this.isValidElement(inst)) {
        return false;
      }

      return this.isCustomComponent(inst.type);
    }
  }, {
    key: "getProviderFromConsumer",
    value: function getProviderFromConsumer(Consumer) {
      // React stores references to the Provider on a Consumer differently across versions.
      if (Consumer) {
        var Provider;

        if (Consumer._context) {
          // check this first, to avoid a deprecation warning
          Provider = Consumer._context.Provider;
        } else if (Consumer.Provider) {
          Provider = Consumer.Provider;
        }

        if (Provider) {
          return Provider;
        }
      }

      throw new Error('Enzyme Internal Error: can’t figure out how to get Provider from Consumer');
    }
  }, {
    key: "createElement",
    value: function createElement() {
      return /*#__PURE__*/_react["default"].createElement.apply(_react["default"], arguments);
    }
  }, {
    key: "wrapWithWrappingComponent",
    value: function wrapWithWrappingComponent(node, options) {
      return {
        RootFinder: _enzymeAdapterUtils.RootFinder,
        node: (0, _enzymeAdapterUtils.wrapWithWrappingComponent)(_react["default"].createElement, node, options)
      };
    }
  }]);

  return ReactSeventeenAdapter;
}(_enzyme.EnzymeAdapter);

module.exports = ReactSeventeenAdapter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9SZWFjdFNldmVudGVlbkFkYXB0ZXIuanMiXSwibmFtZXMiOlsiRmliZXJUYWdzIiwibm9kZUFuZFNpYmxpbmdzQXJyYXkiLCJub2RlV2l0aFNpYmxpbmciLCJhcnJheSIsIm5vZGUiLCJwdXNoIiwic2libGluZyIsImZsYXR0ZW4iLCJhcnIiLCJyZXN1bHQiLCJzdGFjayIsImkiLCJsZW5ndGgiLCJuIiwicG9wIiwiZWwiLCJBcnJheSIsImlzQXJyYXkiLCJub2RlVHlwZUZyb21UeXBlIiwidHlwZSIsIlBvcnRhbCIsImlzTWVtbyIsIk1lbW8iLCJpc0xhenkiLCJMYXp5IiwidW5tZW1vVHlwZSIsImNoZWNrSXNTdXNwZW5zZUFuZENsb25lRWxlbWVudCIsInN1c3BlbnNlRmFsbGJhY2siLCJjaGlsZHJlbiIsInByb3BzIiwiZmFsbGJhY2siLCJyZXBsYWNlTGF6eVdpdGhGYWxsYmFjayIsIkZha2VTdXNwZW5zZVdyYXBwZXIiLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJlbGVtZW50VG9UcmVlIiwiY29udGFpbmVySW5mbyIsIm5vZGVUeXBlIiwia2V5IiwicmVmIiwiaW5zdGFuY2UiLCJyZW5kZXJlZCIsInRvVHJlZSIsInZub2RlIiwidGFnIiwiSG9zdFJvb3QiLCJjaGlsZHJlblRvVHJlZSIsImNoaWxkIiwiSG9zdFBvcnRhbCIsInN0YXRlTm9kZSIsIm1lbW9pemVkUHJvcHMiLCJDbGFzc0NvbXBvbmVudCIsIkZ1bmN0aW9uYWxDb21wb25lbnQiLCJNZW1vQ2xhc3MiLCJlbGVtZW50VHlwZSIsIk1lbW9TRkMiLCJyZW5kZXJlZE5vZGVzIiwibWFwIiwiSG9zdENvbXBvbmVudCIsIkhvc3RUZXh0IiwiRnJhZ21lbnQiLCJNb2RlIiwiQ29udGV4dFByb3ZpZGVyIiwiQ29udGV4dENvbnN1bWVyIiwiUHJvZmlsZXIiLCJGb3J3YXJkUmVmIiwicGVuZGluZ1Byb3BzIiwiU3VzcGVuc2UiLCJPZmZzY3JlZW5Db21wb25lbnQiLCJFcnJvciIsIm5vZGVUb0hvc3ROb2RlIiwiX25vZGUiLCJtYXBwZXIiLCJpdGVtIiwiUmVhY3RET00iLCJmaW5kRE9NTm9kZSIsImV2ZW50T3B0aW9ucyIsImFuaW1hdGlvbiIsInBvaW50ZXJFdmVudHMiLCJhdXhDbGljayIsImdldEVtcHR5U3RhdGVWYWx1ZSIsIkVtcHR5U3RhdGUiLCJDb21wb25lbnQiLCJ0ZXN0UmVuZGVyZXIiLCJTaGFsbG93UmVuZGVyZXIiLCJyZW5kZXIiLCJfaW5zdGFuY2UiLCJzdGF0ZSIsIndyYXBBY3QiLCJmbiIsInJldHVyblZhbCIsIlRlc3RVdGlscyIsImFjdCIsImdldFByb3ZpZGVyRGVmYXVsdFZhbHVlIiwiUHJvdmlkZXIiLCJfY29udGV4dCIsIl9kZWZhdWx0VmFsdWUiLCJfY3VycmVudFZhbHVlIiwibWFrZUZha2VFbGVtZW50IiwiJCR0eXBlb2YiLCJFbGVtZW50IiwiaXNTdGF0ZWZ1bCIsInByb3RvdHlwZSIsImlzUmVhY3RDb21wb25lbnQiLCJfX3JlYWN0QXV0b0JpbmRQYWlycyIsIlJlYWN0U2V2ZW50ZWVuQWRhcHRlciIsImxpZmVjeWNsZXMiLCJvcHRpb25zIiwiZW5hYmxlQ29tcG9uZW50RGlkVXBkYXRlT25TZXRTdGF0ZSIsImxlZ2FjeUNvbnRleHRNb2RlIiwiY29tcG9uZW50RGlkVXBkYXRlIiwib25TZXRTdGF0ZSIsImdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyIsImhhc1Nob3VsZENvbXBvbmVudFVwZGF0ZUJ1ZyIsImdldFNuYXBzaG90QmVmb3JlVXBkYXRlIiwic2V0U3RhdGUiLCJza2lwc0NvbXBvbmVudERpZFVwZGF0ZU9uTnVsbGlzaCIsImdldENoaWxkQ29udGV4dCIsImNhbGxlZEJ5UmVuZGVyZXIiLCJnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IiLCJUeXBlRXJyb3IiLCJhdHRhY2hUbyIsImh5ZHJhdGVJbiIsIndyYXBwaW5nQ29tcG9uZW50UHJvcHMiLCJkb21Ob2RlIiwiZ2xvYmFsIiwiZG9jdW1lbnQiLCJhZGFwdGVyIiwiY29udGV4dCIsImNhbGxiYWNrIiwid3JhcHBlclByb3BzIiwicmVmUHJvcCIsIlJlYWN0V3JhcHBlckNvbXBvbmVudCIsIndyYXBwZWRFbCIsImh5ZHJhdGUiLCJzZXRDaGlsZFByb3BzIiwidW5tb3VudCIsInVubW91bnRDb21wb25lbnRBdE5vZGUiLCJnZXROb2RlIiwiaXNDdXN0b21Db21wb25lbnQiLCJfcmVhY3RJbnRlcm5hbHMiLCJzaW11bGF0ZUVycm9yIiwibm9kZUhpZXJhcmNoeSIsInJvb3ROb2RlIiwiZXJyb3IiLCJpc0Vycm9yQm91bmRhcnkiLCJlbEluc3RhbmNlIiwiY29tcG9uZW50RGlkQ2F0Y2giLCJmaW5kIiwiY2F0Y2hpbmdJbnN0YW5jZSIsImNhdGNoaW5nVHlwZSIsImRpc3BsYXlOYW1lT2ZOb2RlIiwic2ltdWxhdGVFdmVudCIsImV2ZW50IiwibW9jayIsIm1hcHBlZEV2ZW50IiwiZXZlbnRGbiIsIlNpbXVsYXRlIiwiYmF0Y2hlZFVwZGF0ZXMiLCJnZXRXcmFwcGluZ0NvbXBvbmVudFJlbmRlcmVyIiwiaW5zdCIsImdldE1vdW50V3JhcHBlckluc3RhbmNlIiwid3JhcEludm9rZSIsInJlbmRlcmVyIiwiaXNET00iLCJjYWNoZWROb2RlIiwibGFzdENvbXBvbmVudCIsIndyYXBwZWRDb21wb25lbnQiLCJzZW50aW5lbCIsIndyYXBQdXJlQ29tcG9uZW50IiwiY29tcGFyZSIsInNob3VsZENvbXBvbmVudFVwZGF0ZSIsIm5leHRQcm9wcyIsImlzUHVyZVJlYWN0Q29tcG9uZW50IiwibWVtb2l6ZWQiLCJwcmV2UHJvcHMiLCJ3cmFwcGVkQ29tcG9uZW50Rm4iLCJzaG91bGRVcGRhdGUiLCJhcmdzIiwiZGVmYXVsdFByb3BzIiwiZGlzcGxheU5hbWUiLCJ3cmFwRnVuY3Rpb25hbENvbXBvbmVudCIsInJlbmRlckVsZW1lbnQiLCJlbENvbmZpZyIsInJlc3QiLCJyZW5kZXJlZEVsIiwidHlwZUlzRXhpc3RlZCIsImNsb25lZEVsIiwiZWxlbWVudElzQ2hhbmdlZCIsInVubWFza2VkQ29udGV4dCIsInByb3ZpZGVyVmFsdWVzIiwiTWFwIiwic2V0IiwidmFsdWUiLCJNb2NrUHJvdmlkZXIiLCJnZXRQcm92aWRlckZyb21Db25zdW1lciIsImhhcyIsImdldCIsIk1vY2tDb25zdW1lciIsImNvbnRleHRUeXBlcyIsIklubmVyQ29tcCIsImlzQ29tcG9uZW50U3RhdGVmdWwiLCJvcmlnaW5hbE1ldGhvZCIsIl91cGRhdGVDbGFzc0NvbXBvbmVudCIsImNsb25lZFByb3BzIiwiYXBwbHkiLCJyZXN0b3JlIiwiZW1wdHlTdGF0ZVZhbHVlIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJjb25maWd1cmFibGUiLCJlbnVtZXJhYmxlIiwid3JpdGFibGUiLCJvdXRwdXQiLCJnZXRSZW5kZXJPdXRwdXQiLCJjb25jYXQiLCJoYW5kbGVyIiwiY2hlY2tQcm9wVHlwZXMiLCJ0eXBlU3BlY3MiLCJ2YWx1ZXMiLCJsb2NhdGlvbiIsImhpZXJhcmNoeSIsImNoaWxkQ29udGV4dFR5cGVzIiwiQ29udGV4dFdyYXBwZXIiLCJSZWFjdERPTVNlcnZlciIsInJlbmRlclRvU3RhdGljTWFya3VwIiwibW9kZSIsIkVuenltZUFkYXB0ZXIiLCJNT0RFUyIsIk1PVU5UIiwiY3JlYXRlTW91bnRSZW5kZXJlciIsIlNIQUxMT1ciLCJjcmVhdGVTaGFsbG93UmVuZGVyZXIiLCJTVFJJTkciLCJjcmVhdGVTdHJpbmdSZW5kZXJlciIsImVsZW1lbnQiLCJtYXRjaGluZ1R5cGUiLCJzdXBwb3J0c0FycmF5Iiwibm9kZXMiLCJDb25jdXJyZW50TW9kZSIsIk5hTiIsIlN0cmljdE1vZGUiLCIkJHR5cGVvZlR5cGUiLCJub2RlTmFtZSIsIm5hbWUiLCJvYmplY3QiLCJmcmFnbWVudCIsImZha2VFbGVtZW50IiwiaXNWYWxpZEVsZW1lbnQiLCJDb25zdW1lciIsIlJvb3RGaW5kZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBcUJBOztBQUNBOztBQUNBOztBQUNBOztBQXVCQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTtBQUNBLElBQUlBLFNBQVMsR0FBRyxJQUFoQjs7QUFFQSxTQUFTQyxvQkFBVCxDQUE4QkMsZUFBOUIsRUFBK0M7QUFDN0MsTUFBTUMsS0FBSyxHQUFHLEVBQWQ7QUFDQSxNQUFJQyxJQUFJLEdBQUdGLGVBQVg7O0FBQ0EsU0FBT0UsSUFBSSxJQUFJLElBQWYsRUFBcUI7QUFDbkJELElBQUFBLEtBQUssQ0FBQ0UsSUFBTixDQUFXRCxJQUFYO0FBQ0FBLElBQUFBLElBQUksR0FBR0EsSUFBSSxDQUFDRSxPQUFaO0FBQ0Q7O0FBQ0QsU0FBT0gsS0FBUDtBQUNEOztBQUVELFNBQVNJLE9BQVQsQ0FBaUJDLEdBQWpCLEVBQXNCO0FBQ3BCLE1BQU1DLE1BQU0sR0FBRyxFQUFmO0FBQ0EsTUFBTUMsS0FBSyxHQUFHLENBQUM7QUFBRUMsSUFBQUEsQ0FBQyxFQUFFLENBQUw7QUFBUVIsSUFBQUEsS0FBSyxFQUFFSztBQUFmLEdBQUQsQ0FBZDs7QUFDQSxTQUFPRSxLQUFLLENBQUNFLE1BQWIsRUFBcUI7QUFDbkIsUUFBTUMsQ0FBQyxHQUFHSCxLQUFLLENBQUNJLEdBQU4sRUFBVjs7QUFDQSxXQUFPRCxDQUFDLENBQUNGLENBQUYsR0FBTUUsQ0FBQyxDQUFDVixLQUFGLENBQVFTLE1BQXJCLEVBQTZCO0FBQzNCLFVBQU1HLEVBQUUsR0FBR0YsQ0FBQyxDQUFDVixLQUFGLENBQVFVLENBQUMsQ0FBQ0YsQ0FBVixDQUFYO0FBQ0FFLE1BQUFBLENBQUMsQ0FBQ0YsQ0FBRixJQUFPLENBQVA7O0FBQ0EsVUFBSUssS0FBSyxDQUFDQyxPQUFOLENBQWNGLEVBQWQsQ0FBSixFQUF1QjtBQUNyQkwsUUFBQUEsS0FBSyxDQUFDTCxJQUFOLENBQVdRLENBQVg7QUFDQUgsUUFBQUEsS0FBSyxDQUFDTCxJQUFOLENBQVc7QUFBRU0sVUFBQUEsQ0FBQyxFQUFFLENBQUw7QUFBUVIsVUFBQUEsS0FBSyxFQUFFWTtBQUFmLFNBQVg7QUFDQTtBQUNEOztBQUNETixNQUFBQSxNQUFNLENBQUNKLElBQVAsQ0FBWVUsRUFBWjtBQUNEO0FBQ0Y7O0FBQ0QsU0FBT04sTUFBUDtBQUNEOztBQUVELFNBQVNTLGdCQUFULENBQTBCQyxJQUExQixFQUFnQztBQUM5QixNQUFJQSxJQUFJLEtBQUtDLGVBQWIsRUFBcUI7QUFDbkIsV0FBTyxRQUFQO0FBQ0Q7O0FBRUQsU0FBTywwQ0FBcUJELElBQXJCLENBQVA7QUFDRDs7QUFFRCxTQUFTRSxNQUFULENBQWdCRixJQUFoQixFQUFzQjtBQUNwQixTQUFPLDJDQUFrQkEsSUFBbEIsRUFBd0JHLGFBQXhCLENBQVA7QUFDRDs7QUFFRCxTQUFTQyxNQUFULENBQWdCSixJQUFoQixFQUFzQjtBQUNwQixTQUFPLDJDQUFrQkEsSUFBbEIsRUFBd0JLLGFBQXhCLENBQVA7QUFDRDs7QUFFRCxTQUFTQyxVQUFULENBQW9CTixJQUFwQixFQUEwQjtBQUN4QixTQUFPRSxNQUFNLENBQUNGLElBQUQsQ0FBTixHQUFlQSxJQUFJLENBQUNBLElBQXBCLEdBQTJCQSxJQUFsQztBQUNEOztBQUVELFNBQVNPLDhCQUFULENBQXdDWCxFQUF4QyxRQUFrRTtBQUFBLE1BQXBCWSxnQkFBb0IsUUFBcEJBLGdCQUFvQjs7QUFDaEUsTUFBSSxDQUFDLHlCQUFXWixFQUFYLENBQUwsRUFBcUI7QUFDbkIsV0FBT0EsRUFBUDtBQUNEOztBQUVELE1BQU1hLFFBQU4sR0FBbUJiLEVBQUUsQ0FBQ2MsS0FBdEIsQ0FBTUQsUUFBTjs7QUFFQSxNQUFJRCxnQkFBSixFQUFzQjtBQUNwQixRQUFRRyxRQUFSLEdBQXFCZixFQUFFLENBQUNjLEtBQXhCLENBQVFDLFFBQVI7QUFDQUYsSUFBQUEsUUFBUSxHQUFHRyx1QkFBdUIsQ0FBQ0gsUUFBRCxFQUFXRSxRQUFYLENBQWxDO0FBQ0Q7O0FBRUQsTUFBTUUsbUJBQW1CLEdBQUcsU0FBdEJBLG1CQUFzQixDQUFDSCxLQUFEO0FBQUEsd0JBQVdJLGtCQUFNQyxhQUFOLENBQ3JDbkIsRUFBRSxDQUFDSSxJQURrQyxrQ0FFaENKLEVBQUUsQ0FBQ2MsS0FGNkIsR0FFbkJBLEtBRm1CLEdBR3JDRCxRQUhxQyxDQUFYO0FBQUEsR0FBNUI7O0FBS0Esc0JBQU9LLGtCQUFNQyxhQUFOLENBQW9CRixtQkFBcEIsRUFBeUMsSUFBekMsRUFBK0NKLFFBQS9DLENBQVA7QUFDRDs7QUFFRCxTQUFTTyxhQUFULENBQXVCcEIsRUFBdkIsRUFBMkI7QUFDekIsTUFBSSxDQUFDLHVCQUFTQSxFQUFULENBQUwsRUFBbUI7QUFDakIsV0FBTyx1Q0FBa0JBLEVBQWxCLEVBQXNCb0IsYUFBdEIsQ0FBUDtBQUNEOztBQUVELE1BQVFQLFFBQVIsR0FBb0NiLEVBQXBDLENBQVFhLFFBQVI7QUFBQSxNQUFrQlEsYUFBbEIsR0FBb0NyQixFQUFwQyxDQUFrQnFCLGFBQWxCO0FBQ0EsTUFBTVAsS0FBSyxHQUFHO0FBQUVELElBQUFBLFFBQVEsRUFBUkEsUUFBRjtBQUFZUSxJQUFBQSxhQUFhLEVBQWJBO0FBQVosR0FBZDtBQUVBLFNBQU87QUFDTEMsSUFBQUEsUUFBUSxFQUFFLFFBREw7QUFFTGxCLElBQUFBLElBQUksRUFBRUMsZUFGRDtBQUdMUyxJQUFBQSxLQUFLLEVBQUxBLEtBSEs7QUFJTFMsSUFBQUEsR0FBRyxFQUFFLDhDQUFxQnZCLEVBQUUsQ0FBQ3VCLEdBQXhCLENBSkE7QUFLTEMsSUFBQUEsR0FBRyxFQUFFeEIsRUFBRSxDQUFDd0IsR0FBSCxJQUFVLElBTFY7QUFNTEMsSUFBQUEsUUFBUSxFQUFFLElBTkw7QUFPTEMsSUFBQUEsUUFBUSxFQUFFTixhQUFhLENBQUNwQixFQUFFLENBQUNhLFFBQUo7QUFQbEIsR0FBUDtBQVNEOztBQUVELFNBQVNjLE9BQVQsQ0FBZ0JDLEtBQWhCLEVBQXVCO0FBQ3JCLE1BQUlBLEtBQUssSUFBSSxJQUFiLEVBQW1CO0FBQ2pCLFdBQU8sSUFBUDtBQUNELEdBSG9CLENBSXJCO0FBQ0E7QUFDQTs7O0FBQ0EsTUFBTXZDLElBQUksR0FBRywrQ0FBOEJ1QyxLQUE5QixDQUFiOztBQUNBLFVBQVF2QyxJQUFJLENBQUN3QyxHQUFiO0FBQ0UsU0FBSzVDLFNBQVMsQ0FBQzZDLFFBQWY7QUFDRSxhQUFPQyxjQUFjLENBQUMxQyxJQUFJLENBQUMyQyxLQUFOLENBQXJCOztBQUNGLFNBQUsvQyxTQUFTLENBQUNnRCxVQUFmO0FBQTJCO0FBQ3pCLFlBQ2VaLGFBRGYsR0FHSWhDLElBSEosQ0FDRTZDLFNBREYsQ0FDZWIsYUFEZjtBQUFBLFlBRWlCUixRQUZqQixHQUdJeEIsSUFISixDQUVFOEMsYUFGRjtBQUlBLFlBQU1yQixLQUFLLEdBQUc7QUFBRU8sVUFBQUEsYUFBYSxFQUFiQSxhQUFGO0FBQWlCUixVQUFBQSxRQUFRLEVBQVJBO0FBQWpCLFNBQWQ7QUFDQSxlQUFPO0FBQ0xTLFVBQUFBLFFBQVEsRUFBRSxRQURMO0FBRUxsQixVQUFBQSxJQUFJLEVBQUVDLGVBRkQ7QUFHTFMsVUFBQUEsS0FBSyxFQUFMQSxLQUhLO0FBSUxTLFVBQUFBLEdBQUcsRUFBRSw4Q0FBcUJsQyxJQUFJLENBQUNrQyxHQUExQixDQUpBO0FBS0xDLFVBQUFBLEdBQUcsRUFBRW5DLElBQUksQ0FBQ21DLEdBTEw7QUFNTEMsVUFBQUEsUUFBUSxFQUFFLElBTkw7QUFPTEMsVUFBQUEsUUFBUSxFQUFFSyxjQUFjLENBQUMxQyxJQUFJLENBQUMyQyxLQUFOO0FBUG5CLFNBQVA7QUFTRDs7QUFDRCxTQUFLL0MsU0FBUyxDQUFDbUQsY0FBZjtBQUNFLGFBQU87QUFDTGQsUUFBQUEsUUFBUSxFQUFFLE9BREw7QUFFTGxCLFFBQUFBLElBQUksRUFBRWYsSUFBSSxDQUFDZSxJQUZOO0FBR0xVLFFBQUFBLEtBQUssb0JBQU96QixJQUFJLENBQUM4QyxhQUFaLENBSEE7QUFJTFosUUFBQUEsR0FBRyxFQUFFLDhDQUFxQmxDLElBQUksQ0FBQ2tDLEdBQTFCLENBSkE7QUFLTEMsUUFBQUEsR0FBRyxFQUFFbkMsSUFBSSxDQUFDbUMsR0FMTDtBQU1MQyxRQUFBQSxRQUFRLEVBQUVwQyxJQUFJLENBQUM2QyxTQU5WO0FBT0xSLFFBQUFBLFFBQVEsRUFBRUssY0FBYyxDQUFDMUMsSUFBSSxDQUFDMkMsS0FBTjtBQVBuQixPQUFQOztBQVNGLFNBQUsvQyxTQUFTLENBQUNvRCxtQkFBZjtBQUNFLGFBQU87QUFDTGYsUUFBQUEsUUFBUSxFQUFFLFVBREw7QUFFTGxCLFFBQUFBLElBQUksRUFBRWYsSUFBSSxDQUFDZSxJQUZOO0FBR0xVLFFBQUFBLEtBQUssb0JBQU96QixJQUFJLENBQUM4QyxhQUFaLENBSEE7QUFJTFosUUFBQUEsR0FBRyxFQUFFLDhDQUFxQmxDLElBQUksQ0FBQ2tDLEdBQTFCLENBSkE7QUFLTEMsUUFBQUEsR0FBRyxFQUFFbkMsSUFBSSxDQUFDbUMsR0FMTDtBQU1MQyxRQUFBQSxRQUFRLEVBQUUsSUFOTDtBQU9MQyxRQUFBQSxRQUFRLEVBQUVLLGNBQWMsQ0FBQzFDLElBQUksQ0FBQzJDLEtBQU47QUFQbkIsT0FBUDs7QUFTRixTQUFLL0MsU0FBUyxDQUFDcUQsU0FBZjtBQUNFLGFBQU87QUFDTGhCLFFBQUFBLFFBQVEsRUFBRSxPQURMO0FBRUxsQixRQUFBQSxJQUFJLEVBQUVmLElBQUksQ0FBQ2tELFdBQUwsQ0FBaUJuQyxJQUZsQjtBQUdMVSxRQUFBQSxLQUFLLG9CQUFPekIsSUFBSSxDQUFDOEMsYUFBWixDQUhBO0FBSUxaLFFBQUFBLEdBQUcsRUFBRSw4Q0FBcUJsQyxJQUFJLENBQUNrQyxHQUExQixDQUpBO0FBS0xDLFFBQUFBLEdBQUcsRUFBRW5DLElBQUksQ0FBQ21DLEdBTEw7QUFNTEMsUUFBQUEsUUFBUSxFQUFFcEMsSUFBSSxDQUFDNkMsU0FOVjtBQU9MUixRQUFBQSxRQUFRLEVBQUVLLGNBQWMsQ0FBQzFDLElBQUksQ0FBQzJDLEtBQUwsQ0FBV0EsS0FBWjtBQVBuQixPQUFQOztBQVNGLFNBQUsvQyxTQUFTLENBQUN1RCxPQUFmO0FBQXdCO0FBQ3RCLFlBQUlDLGFBQWEsR0FBR2pELE9BQU8sQ0FBQ04sb0JBQW9CLENBQUNHLElBQUksQ0FBQzJDLEtBQU4sQ0FBcEIsQ0FBaUNVLEdBQWpDLENBQXFDZixPQUFyQyxDQUFELENBQTNCOztBQUNBLFlBQUljLGFBQWEsQ0FBQzVDLE1BQWQsS0FBeUIsQ0FBN0IsRUFBZ0M7QUFDOUI0QyxVQUFBQSxhQUFhLEdBQUcsQ0FBQ3BELElBQUksQ0FBQzhDLGFBQUwsQ0FBbUJ0QixRQUFwQixDQUFoQjtBQUNEOztBQUNELGVBQU87QUFDTFMsVUFBQUEsUUFBUSxFQUFFLFVBREw7QUFFTGxCLFVBQUFBLElBQUksRUFBRWYsSUFBSSxDQUFDa0QsV0FGTjtBQUdMekIsVUFBQUEsS0FBSyxvQkFBT3pCLElBQUksQ0FBQzhDLGFBQVosQ0FIQTtBQUlMWixVQUFBQSxHQUFHLEVBQUUsOENBQXFCbEMsSUFBSSxDQUFDa0MsR0FBMUIsQ0FKQTtBQUtMQyxVQUFBQSxHQUFHLEVBQUVuQyxJQUFJLENBQUNtQyxHQUxMO0FBTUxDLFVBQUFBLFFBQVEsRUFBRSxJQU5MO0FBT0xDLFVBQUFBLFFBQVEsRUFBRWU7QUFQTCxTQUFQO0FBU0Q7O0FBQ0QsU0FBS3hELFNBQVMsQ0FBQzBELGFBQWY7QUFBOEI7QUFDNUIsWUFBSUYsY0FBYSxHQUFHakQsT0FBTyxDQUFDTixvQkFBb0IsQ0FBQ0csSUFBSSxDQUFDMkMsS0FBTixDQUFwQixDQUFpQ1UsR0FBakMsQ0FBcUNmLE9BQXJDLENBQUQsQ0FBM0I7O0FBQ0EsWUFBSWMsY0FBYSxDQUFDNUMsTUFBZCxLQUF5QixDQUE3QixFQUFnQztBQUM5QjRDLFVBQUFBLGNBQWEsR0FBRyxDQUFDcEQsSUFBSSxDQUFDOEMsYUFBTCxDQUFtQnRCLFFBQXBCLENBQWhCO0FBQ0Q7O0FBQ0QsZUFBTztBQUNMUyxVQUFBQSxRQUFRLEVBQUUsTUFETDtBQUVMbEIsVUFBQUEsSUFBSSxFQUFFZixJQUFJLENBQUNlLElBRk47QUFHTFUsVUFBQUEsS0FBSyxvQkFBT3pCLElBQUksQ0FBQzhDLGFBQVosQ0FIQTtBQUlMWixVQUFBQSxHQUFHLEVBQUUsOENBQXFCbEMsSUFBSSxDQUFDa0MsR0FBMUIsQ0FKQTtBQUtMQyxVQUFBQSxHQUFHLEVBQUVuQyxJQUFJLENBQUNtQyxHQUxMO0FBTUxDLFVBQUFBLFFBQVEsRUFBRXBDLElBQUksQ0FBQzZDLFNBTlY7QUFPTFIsVUFBQUEsUUFBUSxFQUFFZTtBQVBMLFNBQVA7QUFTRDs7QUFDRCxTQUFLeEQsU0FBUyxDQUFDMkQsUUFBZjtBQUNFLGFBQU92RCxJQUFJLENBQUM4QyxhQUFaOztBQUNGLFNBQUtsRCxTQUFTLENBQUM0RCxRQUFmO0FBQ0EsU0FBSzVELFNBQVMsQ0FBQzZELElBQWY7QUFDQSxTQUFLN0QsU0FBUyxDQUFDOEQsZUFBZjtBQUNBLFNBQUs5RCxTQUFTLENBQUMrRCxlQUFmO0FBQ0UsYUFBT2pCLGNBQWMsQ0FBQzFDLElBQUksQ0FBQzJDLEtBQU4sQ0FBckI7O0FBQ0YsU0FBSy9DLFNBQVMsQ0FBQ2dFLFFBQWY7QUFDQSxTQUFLaEUsU0FBUyxDQUFDaUUsVUFBZjtBQUEyQjtBQUN6QixlQUFPO0FBQ0w1QixVQUFBQSxRQUFRLEVBQUUsVUFETDtBQUVMbEIsVUFBQUEsSUFBSSxFQUFFZixJQUFJLENBQUNlLElBRk47QUFHTFUsVUFBQUEsS0FBSyxvQkFBT3pCLElBQUksQ0FBQzhELFlBQVosQ0FIQTtBQUlMNUIsVUFBQUEsR0FBRyxFQUFFLDhDQUFxQmxDLElBQUksQ0FBQ2tDLEdBQTFCLENBSkE7QUFLTEMsVUFBQUEsR0FBRyxFQUFFbkMsSUFBSSxDQUFDbUMsR0FMTDtBQU1MQyxVQUFBQSxRQUFRLEVBQUUsSUFOTDtBQU9MQyxVQUFBQSxRQUFRLEVBQUVLLGNBQWMsQ0FBQzFDLElBQUksQ0FBQzJDLEtBQU47QUFQbkIsU0FBUDtBQVNEOztBQUNELFNBQUsvQyxTQUFTLENBQUNtRSxRQUFmO0FBQXlCO0FBQ3ZCLGVBQU87QUFDTDlCLFVBQUFBLFFBQVEsRUFBRSxVQURMO0FBRUxsQixVQUFBQSxJQUFJLEVBQUVnRCxpQkFGRDtBQUdMdEMsVUFBQUEsS0FBSyxvQkFBT3pCLElBQUksQ0FBQzhDLGFBQVosQ0FIQTtBQUlMWixVQUFBQSxHQUFHLEVBQUUsOENBQXFCbEMsSUFBSSxDQUFDa0MsR0FBMUIsQ0FKQTtBQUtMQyxVQUFBQSxHQUFHLEVBQUVuQyxJQUFJLENBQUNtQyxHQUxMO0FBTUxDLFVBQUFBLFFBQVEsRUFBRSxJQU5MO0FBT0xDLFVBQUFBLFFBQVEsRUFBRUssY0FBYyxDQUFDMUMsSUFBSSxDQUFDMkMsS0FBTjtBQVBuQixTQUFQO0FBU0Q7O0FBQ0QsU0FBSy9DLFNBQVMsQ0FBQ3dCLElBQWY7QUFDRSxhQUFPc0IsY0FBYyxDQUFDMUMsSUFBSSxDQUFDMkMsS0FBTixDQUFyQjs7QUFDRixTQUFLL0MsU0FBUyxDQUFDb0Usa0JBQWY7QUFDRSxhQUFPMUIsT0FBTSxDQUFDdEMsSUFBSSxDQUFDMkMsS0FBTixDQUFiOztBQUNGO0FBQ0UsWUFBTSxJQUFJc0IsS0FBSix3REFBMERqRSxJQUFJLENBQUN3QyxHQUEvRCxFQUFOO0FBbEhKO0FBb0hEOztBQUVELFNBQVNFLGNBQVQsQ0FBd0IxQyxJQUF4QixFQUE4QjtBQUM1QixNQUFJLENBQUNBLElBQUwsRUFBVztBQUNULFdBQU8sSUFBUDtBQUNEOztBQUNELE1BQU13QixRQUFRLEdBQUczQixvQkFBb0IsQ0FBQ0csSUFBRCxDQUFyQzs7QUFDQSxNQUFJd0IsUUFBUSxDQUFDaEIsTUFBVCxLQUFvQixDQUF4QixFQUEyQjtBQUN6QixXQUFPLElBQVA7QUFDRDs7QUFDRCxNQUFJZ0IsUUFBUSxDQUFDaEIsTUFBVCxLQUFvQixDQUF4QixFQUEyQjtBQUN6QixXQUFPOEIsT0FBTSxDQUFDZCxRQUFRLENBQUMsQ0FBRCxDQUFULENBQWI7QUFDRDs7QUFDRCxTQUFPckIsT0FBTyxDQUFDcUIsUUFBUSxDQUFDNkIsR0FBVCxDQUFhZixPQUFiLENBQUQsQ0FBZDtBQUNEOztBQUVELFNBQVM0QixlQUFULENBQXdCQyxLQUF4QixFQUErQjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSW5FLElBQUksR0FBR21FLEtBQVg7O0FBQ0EsU0FBT25FLElBQUksSUFBSSxDQUFDWSxLQUFLLENBQUNDLE9BQU4sQ0FBY2IsSUFBZCxDQUFULElBQWdDQSxJQUFJLENBQUNvQyxRQUFMLEtBQWtCLElBQXpELEVBQStEO0FBQzdEcEMsSUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNxQyxRQUFaO0FBQ0QsR0FUNEIsQ0FVN0I7OztBQUNBLE1BQUksQ0FBQ3JDLElBQUwsRUFBVztBQUNULFdBQU8sSUFBUDtBQUNEOztBQUVELE1BQU1vRSxNQUFNLEdBQUcsU0FBVEEsTUFBUyxDQUFDQyxJQUFELEVBQVU7QUFDdkIsUUFBSUEsSUFBSSxJQUFJQSxJQUFJLENBQUNqQyxRQUFqQixFQUEyQixPQUFPa0MscUJBQVNDLFdBQVQsQ0FBcUJGLElBQUksQ0FBQ2pDLFFBQTFCLENBQVA7QUFDM0IsV0FBTyxJQUFQO0FBQ0QsR0FIRDs7QUFJQSxNQUFJeEIsS0FBSyxDQUFDQyxPQUFOLENBQWNiLElBQWQsQ0FBSixFQUF5QjtBQUN2QixXQUFPQSxJQUFJLENBQUNxRCxHQUFMLENBQVNlLE1BQVQsQ0FBUDtBQUNEOztBQUNELE1BQUl4RCxLQUFLLENBQUNDLE9BQU4sQ0FBY2IsSUFBSSxDQUFDcUMsUUFBbkIsS0FBZ0NyQyxJQUFJLENBQUNpQyxRQUFMLEtBQWtCLE9BQXRELEVBQStEO0FBQzdELFdBQU9qQyxJQUFJLENBQUNxQyxRQUFMLENBQWNnQixHQUFkLENBQWtCZSxNQUFsQixDQUFQO0FBQ0Q7O0FBQ0QsU0FBT0EsTUFBTSxDQUFDcEUsSUFBRCxDQUFiO0FBQ0Q7O0FBRUQsU0FBUzJCLHVCQUFULENBQWlDM0IsSUFBakMsRUFBdUMwQixRQUF2QyxFQUFpRDtBQUMvQyxNQUFJLENBQUMxQixJQUFMLEVBQVc7QUFDVCxXQUFPLElBQVA7QUFDRDs7QUFDRCxNQUFJWSxLQUFLLENBQUNDLE9BQU4sQ0FBY2IsSUFBZCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQU9BLElBQUksQ0FBQ3FELEdBQUwsQ0FBUyxVQUFDMUMsRUFBRDtBQUFBLGFBQVFnQix1QkFBdUIsQ0FBQ2hCLEVBQUQsRUFBS2UsUUFBTCxDQUEvQjtBQUFBLEtBQVQsQ0FBUDtBQUNEOztBQUNELE1BQUlQLE1BQU0sQ0FBQ25CLElBQUksQ0FBQ2UsSUFBTixDQUFWLEVBQXVCO0FBQ3JCLFdBQU9XLFFBQVA7QUFDRDs7QUFDRCx5Q0FDSzFCLElBREw7QUFFRXlCLElBQUFBLEtBQUssa0NBQ0F6QixJQUFJLENBQUN5QixLQURMO0FBRUhELE1BQUFBLFFBQVEsRUFBRUcsdUJBQXVCLENBQUMzQixJQUFJLENBQUN5QixLQUFMLENBQVdELFFBQVosRUFBc0JFLFFBQXRCO0FBRjlCO0FBRlA7QUFPRDs7QUFFRCxJQUFNOEMsWUFBWSxHQUFHO0FBQ25CQyxFQUFBQSxTQUFTLEVBQUUsSUFEUTtBQUVuQkMsRUFBQUEsYUFBYSxFQUFFLElBRkk7QUFHbkJDLEVBQUFBLFFBQVEsRUFBRTtBQUhTLENBQXJCOztBQU1BLFNBQVNDLGtCQUFULEdBQThCO0FBQzVCO0FBQ0E7QUFDQTtBQUg0QixNQUt0QkMsVUFMc0I7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGFBTTFCLGtCQUFTO0FBQ1AsZUFBTyxJQUFQO0FBQ0Q7QUFSeUI7O0FBQUE7QUFBQSxJQUtIaEQsa0JBQU1pRCxTQUxIOztBQVU1QixNQUFNQyxZQUFZLEdBQUcsSUFBSUMsbUJBQUosRUFBckI7QUFDQUQsRUFBQUEsWUFBWSxDQUFDRSxNQUFiLGVBQW9CcEQsa0JBQU1DLGFBQU4sQ0FBb0IrQyxVQUFwQixDQUFwQjtBQUNBLFNBQU9FLFlBQVksQ0FBQ0csU0FBYixDQUF1QkMsS0FBOUI7QUFDRDs7QUFFRCxTQUFTQyxPQUFULENBQWlCQyxFQUFqQixFQUFxQjtBQUNuQixNQUFJQyxTQUFKOztBQUNBQyx3QkFBVUMsR0FBVixDQUFjLFlBQU07QUFBRUYsSUFBQUEsU0FBUyxHQUFHRCxFQUFFLEVBQWQ7QUFBbUIsR0FBekM7O0FBQ0EsU0FBT0MsU0FBUDtBQUNEOztBQUVELFNBQVNHLHVCQUFULENBQWlDQyxRQUFqQyxFQUEyQztBQUN6QztBQUNBLE1BQUksbUJBQW1CQSxRQUFRLENBQUNDLFFBQWhDLEVBQTBDO0FBQ3hDLFdBQU9ELFFBQVEsQ0FBQ0MsUUFBVCxDQUFrQkMsYUFBekI7QUFDRDs7QUFDRCxNQUFJLG1CQUFtQkYsUUFBUSxDQUFDQyxRQUFoQyxFQUEwQztBQUN4QyxXQUFPRCxRQUFRLENBQUNDLFFBQVQsQ0FBa0JFLGFBQXpCO0FBQ0Q7O0FBQ0QsUUFBTSxJQUFJNUIsS0FBSixDQUFVLDZFQUFWLENBQU47QUFDRDs7QUFFRCxTQUFTNkIsZUFBVCxDQUF5Qi9FLElBQXpCLEVBQStCO0FBQzdCLFNBQU87QUFBRWdGLElBQUFBLFFBQVEsRUFBRUMsZ0JBQVo7QUFBcUJqRixJQUFBQSxJQUFJLEVBQUpBO0FBQXJCLEdBQVA7QUFDRDs7QUFFRCxTQUFTa0YsVUFBVCxDQUFvQm5CLFNBQXBCLEVBQStCO0FBQzdCLFNBQU9BLFNBQVMsQ0FBQ29CLFNBQVYsS0FDTHBCLFNBQVMsQ0FBQ29CLFNBQVYsQ0FBb0JDLGdCQUFwQixJQUNHdkYsS0FBSyxDQUFDQyxPQUFOLENBQWNpRSxTQUFTLENBQUNzQixvQkFBeEIsQ0FGRSxDQUU0QztBQUY1QyxHQUFQO0FBSUQ7O0lBRUtDLHFCOzs7OztBQUNKLG1DQUFjO0FBQUE7O0FBQUE7O0FBQ1o7QUFDQSxRQUFRQyxVQUFSLEdBQXVCLE1BQUtDLE9BQTVCLENBQVFELFVBQVI7QUFDQSxVQUFLQyxPQUFMLG1DQUNLLE1BQUtBLE9BRFY7QUFFRUMsTUFBQUEsa0NBQWtDLEVBQUUsSUFGdEM7QUFFNEM7QUFDMUNDLE1BQUFBLGlCQUFpQixFQUFFLFFBSHJCO0FBSUVILE1BQUFBLFVBQVUsa0NBQ0xBLFVBREs7QUFFUkksUUFBQUEsa0JBQWtCLEVBQUU7QUFDbEJDLFVBQUFBLFVBQVUsRUFBRTtBQURNLFNBRlo7QUFLUkMsUUFBQUEsd0JBQXdCLEVBQUU7QUFDeEJDLFVBQUFBLDJCQUEyQixFQUFFO0FBREwsU0FMbEI7QUFRUkMsUUFBQUEsdUJBQXVCLEVBQUUsSUFSakI7QUFTUkMsUUFBQUEsUUFBUSxFQUFFO0FBQ1JDLFVBQUFBLGdDQUFnQyxFQUFFO0FBRDFCLFNBVEY7QUFZUkMsUUFBQUEsZUFBZSxFQUFFO0FBQ2ZDLFVBQUFBLGdCQUFnQixFQUFFO0FBREgsU0FaVDtBQWVSQyxRQUFBQSx3QkFBd0IsRUFBRTtBQWZsQjtBQUpaO0FBSFk7QUF5QmI7Ozs7V0FFRCw2QkFBb0JaLE9BQXBCLEVBQTZCO0FBQzNCLGtEQUFtQixPQUFuQjs7QUFDQSxVQUFJLHFCQUFJQSxPQUFKLEVBQWEsa0JBQWIsQ0FBSixFQUFzQztBQUNwQyxjQUFNLElBQUlhLFNBQUosQ0FBYyw2REFBZCxDQUFOO0FBQ0Q7O0FBQ0QsVUFBSXhILFNBQVMsS0FBSyxJQUFsQixFQUF3QjtBQUN0QjtBQUNBQSxRQUFBQSxTQUFTLEdBQUcsa0NBQVo7QUFDRDs7QUFDRCxVQUFReUgsUUFBUixHQUF3RGQsT0FBeEQsQ0FBUWMsUUFBUjtBQUFBLFVBQWtCQyxTQUFsQixHQUF3RGYsT0FBeEQsQ0FBa0JlLFNBQWxCO0FBQUEsVUFBNkJDLHNCQUE3QixHQUF3RGhCLE9BQXhELENBQTZCZ0Isc0JBQTdCO0FBQ0EsVUFBTUMsT0FBTyxHQUFHRixTQUFTLElBQUlELFFBQWIsSUFBeUJJLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQjVGLGFBQWhCLENBQThCLEtBQTlCLENBQXpDO0FBQ0EsVUFBSU0sUUFBUSxHQUFHLElBQWY7QUFDQSxVQUFNdUYsT0FBTyxHQUFHLElBQWhCO0FBQ0EsYUFBTztBQUNMMUMsUUFBQUEsTUFESyxrQkFDRXRFLEVBREYsRUFDTWlILE9BRE4sRUFDZUMsUUFEZixFQUN5QjtBQUM1QixpQkFBT3pDLE9BQU8sQ0FBQyxZQUFNO0FBQ25CLGdCQUFJaEQsUUFBUSxLQUFLLElBQWpCLEVBQXVCO0FBQ3JCLGtCQUFRckIsSUFBUixHQUE2QkosRUFBN0IsQ0FBUUksSUFBUjtBQUFBLGtCQUFjVSxLQUFkLEdBQTZCZCxFQUE3QixDQUFjYyxLQUFkO0FBQUEsa0JBQXFCVSxHQUFyQixHQUE2QnhCLEVBQTdCLENBQXFCd0IsR0FBckI7O0FBQ0Esa0JBQU0yRixZQUFZO0FBQ2hCaEQsZ0JBQUFBLFNBQVMsRUFBRS9ELElBREs7QUFFaEJVLGdCQUFBQSxLQUFLLEVBQUxBLEtBRmdCO0FBR2hCOEYsZ0JBQUFBLHNCQUFzQixFQUF0QkEsc0JBSGdCO0FBSWhCSyxnQkFBQUEsT0FBTyxFQUFQQTtBQUpnQixpQkFLWnpGLEdBQUcsSUFBSTtBQUFFNEYsZ0JBQUFBLE9BQU8sRUFBRTVGO0FBQVgsZUFMSyxDQUFsQjs7QUFPQSxrQkFBTTZGLHFCQUFxQixHQUFHLDRDQUFtQnJILEVBQW5CLGtDQUE0QjRGLE9BQTVCO0FBQXFDb0IsZ0JBQUFBLE9BQU8sRUFBUEE7QUFBckMsaUJBQTlCOztBQUNBLGtCQUFNTSxTQUFTLGdCQUFHcEcsa0JBQU1DLGFBQU4sQ0FBb0JrRyxxQkFBcEIsRUFBMkNGLFlBQTNDLENBQWxCOztBQUNBMUYsY0FBQUEsUUFBUSxHQUFHa0YsU0FBUyxHQUNoQmhELHFCQUFTNEQsT0FBVCxDQUFpQkQsU0FBakIsRUFBNEJULE9BQTVCLENBRGdCLEdBRWhCbEQscUJBQVNXLE1BQVQsQ0FBZ0JnRCxTQUFoQixFQUEyQlQsT0FBM0IsQ0FGSjs7QUFHQSxrQkFBSSxPQUFPSyxRQUFQLEtBQW9CLFVBQXhCLEVBQW9DO0FBQ2xDQSxnQkFBQUEsUUFBUTtBQUNUO0FBQ0YsYUFqQkQsTUFpQk87QUFDTHpGLGNBQUFBLFFBQVEsQ0FBQytGLGFBQVQsQ0FBdUJ4SCxFQUFFLENBQUNjLEtBQTFCLEVBQWlDbUcsT0FBakMsRUFBMENDLFFBQTFDO0FBQ0Q7QUFDRixXQXJCYSxDQUFkO0FBc0JELFNBeEJJO0FBeUJMTyxRQUFBQSxPQXpCSyxxQkF5Qks7QUFDUmhELFVBQUFBLE9BQU8sQ0FBQyxZQUFNO0FBQ1pkLGlDQUFTK0Qsc0JBQVQsQ0FBZ0NiLE9BQWhDO0FBQ0QsV0FGTSxDQUFQO0FBR0FwRixVQUFBQSxRQUFRLEdBQUcsSUFBWDtBQUNELFNBOUJJO0FBK0JMa0csUUFBQUEsT0EvQksscUJBK0JLO0FBQ1IsY0FBSSxDQUFDbEcsUUFBTCxFQUFlO0FBQ2IsbUJBQU8sSUFBUDtBQUNEOztBQUNELGlCQUFPLCtDQUNMdUYsT0FBTyxDQUFDWSxpQkFESCxFQUVMakcsT0FBTSxDQUFDRixRQUFRLENBQUNvRyxlQUFWLENBRkQsRUFHTGpDLE9BSEssQ0FBUDtBQUtELFNBeENJO0FBeUNMa0MsUUFBQUEsYUF6Q0sseUJBeUNTQyxhQXpDVCxFQXlDd0JDLFFBekN4QixFQXlDa0NDLEtBekNsQyxFQXlDeUM7QUFDNUMsY0FBTUMsZUFBZSxHQUFHLFNBQWxCQSxlQUFrQixRQUFvQztBQUFBLGdCQUF2QkMsVUFBdUIsU0FBakMxRyxRQUFpQztBQUFBLGdCQUFYckIsSUFBVyxTQUFYQSxJQUFXOztBQUMxRCxnQkFBSUEsSUFBSSxJQUFJQSxJQUFJLENBQUNvRyx3QkFBakIsRUFBMkM7QUFDekMscUJBQU8sSUFBUDtBQUNEOztBQUNELG1CQUFPMkIsVUFBVSxJQUFJQSxVQUFVLENBQUNDLGlCQUFoQztBQUNELFdBTEQ7O0FBT0Esc0JBR0lMLGFBQWEsQ0FBQ00sSUFBZCxDQUFtQkgsZUFBbkIsS0FBdUMsRUFIM0M7QUFBQSxjQUNZSSxnQkFEWixTQUNFN0csUUFERjtBQUFBLGNBRVE4RyxZQUZSLFNBRUVuSSxJQUZGOztBQUtBLGlEQUNFNkgsS0FERixFQUVFSyxnQkFGRixFQUdFTixRQUhGLEVBSUVELGFBSkYsRUFLRTVILGdCQUxGLEVBTUU2RyxPQUFPLENBQUN3QixpQkFOVixFQU9FRCxZQVBGO0FBU0QsU0EvREk7QUFnRUxFLFFBQUFBLGFBaEVLLHlCQWdFU3BKLElBaEVULEVBZ0VlcUosS0FoRWYsRUFnRXNCQyxJQWhFdEIsRUFnRTRCO0FBQy9CLGNBQU1DLFdBQVcsR0FBRyw2Q0FBb0JGLEtBQXBCLEVBQTJCN0UsWUFBM0IsQ0FBcEI7QUFDQSxjQUFNZ0YsT0FBTyxHQUFHakUsc0JBQVVrRSxRQUFWLENBQW1CRixXQUFuQixDQUFoQjs7QUFDQSxjQUFJLENBQUNDLE9BQUwsRUFBYztBQUNaLGtCQUFNLElBQUlwQyxTQUFKLDJDQUFpRGlDLEtBQWpELHNCQUFOO0FBQ0Q7O0FBQ0RqRSxVQUFBQSxPQUFPLENBQUMsWUFBTTtBQUNab0UsWUFBQUEsT0FBTyxDQUFDN0IsT0FBTyxDQUFDekQsY0FBUixDQUF1QmxFLElBQXZCLENBQUQsRUFBK0JzSixJQUEvQixDQUFQO0FBQ0QsV0FGTSxDQUFQO0FBR0QsU0F6RUk7QUEwRUxJLFFBQUFBLGNBMUVLLDBCQTBFVXJFLEVBMUVWLEVBMEVjO0FBQ2pCLGlCQUFPQSxFQUFFLEVBQVQsQ0FEaUIsQ0FFakI7QUFDRCxTQTdFSTtBQThFTHNFLFFBQUFBLDRCQTlFSywwQ0E4RTBCO0FBQzdCLGlEQUNLLElBREwsR0FFSywyREFBa0M7QUFDbkNySCxZQUFBQSxNQUFNLEVBQUUsZ0JBQUNzSCxJQUFEO0FBQUEscUJBQVV0SCxPQUFNLENBQUNzSCxJQUFJLENBQUNwQixlQUFOLENBQWhCO0FBQUEsYUFEMkI7QUFFbkNxQixZQUFBQSx1QkFBdUIsRUFBRTtBQUFBLHFCQUFNekgsUUFBTjtBQUFBO0FBRlUsV0FBbEMsQ0FGTDtBQU9ELFNBdEZJO0FBdUZMMEgsUUFBQUEsVUFBVSxFQUFFMUU7QUF2RlAsT0FBUDtBQXlGRDs7O1dBRUQsaUNBQW9DO0FBQUE7O0FBQUEsVUFBZG1CLE9BQWMsdUVBQUosRUFBSTtBQUNsQyxVQUFNb0IsT0FBTyxHQUFHLElBQWhCO0FBQ0EsVUFBTW9DLFFBQVEsR0FBRyxJQUFJL0UsbUJBQUosRUFBakI7QUFDQSxVQUFRekQsZ0JBQVIsR0FBNkJnRixPQUE3QixDQUFRaEYsZ0JBQVI7O0FBQ0EsVUFBSSxPQUFPQSxnQkFBUCxLQUE0QixXQUE1QixJQUEyQyxPQUFPQSxnQkFBUCxLQUE0QixTQUEzRSxFQUFzRjtBQUNwRixjQUFNNkYsU0FBUyxDQUFDLDJEQUFELENBQWY7QUFDRDs7QUFDRCxVQUFJNEMsS0FBSyxHQUFHLEtBQVo7QUFDQSxVQUFJQyxVQUFVLEdBQUcsSUFBakI7QUFFQSxVQUFJQyxhQUFhLEdBQUcsSUFBcEI7QUFDQSxVQUFJQyxnQkFBZ0IsR0FBRyxJQUF2QjtBQUNBLFVBQU1DLFFBQVEsR0FBRyxFQUFqQixDQVprQyxDQWNsQzs7QUFDQSxVQUFNQyxpQkFBaUIsR0FBRyxTQUFwQkEsaUJBQW9CLENBQUN2RixTQUFELEVBQVl3RixPQUFaLEVBQXdCO0FBQ2hELFlBQUlKLGFBQWEsS0FBS3BGLFNBQXRCLEVBQWlDO0FBQy9CLGNBQUltQixVQUFVLENBQUNuQixTQUFELENBQWQsRUFBMkI7QUFDekJxRixZQUFBQSxnQkFBZ0I7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQSxjQUFpQnJGLFNBQWpCLENBQWhCOztBQUNBLGdCQUFJd0YsT0FBSixFQUFhO0FBQ1hILGNBQUFBLGdCQUFnQixDQUFDakUsU0FBakIsQ0FBMkJxRSxxQkFBM0IsR0FBbUQsVUFBQ0MsU0FBRDtBQUFBLHVCQUNqRCxDQUFDRixPQUFPLENBQUMsTUFBSSxDQUFDN0ksS0FBTixFQUFhK0ksU0FBYixDQUR5QztBQUFBLGVBQW5EO0FBR0QsYUFKRCxNQUlPO0FBQ0xMLGNBQUFBLGdCQUFnQixDQUFDakUsU0FBakIsQ0FBMkJ1RSxvQkFBM0IsR0FBa0QsSUFBbEQ7QUFDRDtBQUNGLFdBVEQsTUFTTztBQUNMLGdCQUFJQyxRQUFRLEdBQUdOLFFBQWY7QUFDQSxnQkFBSU8sU0FBSjs7QUFDQVIsWUFBQUEsZ0JBQWdCLEdBQUcsU0FBU1Msa0JBQVQsQ0FBNEJuSixLQUE1QixFQUE0QztBQUM3RCxrQkFBTW9KLFlBQVksR0FBR0gsUUFBUSxLQUFLTixRQUFiLEtBQTBCRSxPQUFPLEdBQ2xELENBQUNBLE9BQU8sQ0FBQ0ssU0FBRCxFQUFZbEosS0FBWixDQUQwQyxHQUVsRCxDQUFDLG9DQUFha0osU0FBYixFQUF3QmxKLEtBQXhCLENBRmdCLENBQXJCOztBQUlBLGtCQUFJb0osWUFBSixFQUFrQjtBQUFBLGtEQUxxQ0MsSUFLckM7QUFMcUNBLGtCQUFBQSxJQUtyQztBQUFBOztBQUNoQkosZ0JBQUFBLFFBQVEsR0FBRzVGLFNBQVMsTUFBVCwwQ0FBZUEsU0FBUyxDQUFDaUcsWUFBekIsR0FBMEN0SixLQUExQyxVQUFzRHFKLElBQXRELEVBQVg7QUFDQUgsZ0JBQUFBLFNBQVMsR0FBR2xKLEtBQVo7QUFDRDs7QUFDRCxxQkFBT2lKLFFBQVA7QUFDRCxhQVZEO0FBV0Q7O0FBQ0Qsa0NBQ0VQLGdCQURGLEVBRUVyRixTQUZGLEVBR0U7QUFBRWtHLFlBQUFBLFdBQVcsRUFBRXJELE9BQU8sQ0FBQ3dCLGlCQUFSLENBQTBCO0FBQUVwSSxjQUFBQSxJQUFJLEVBQUUrRDtBQUFSLGFBQTFCO0FBQWYsV0FIRjtBQUtBb0YsVUFBQUEsYUFBYSxHQUFHcEYsU0FBaEI7QUFDRDs7QUFDRCxlQUFPcUYsZ0JBQVA7QUFDRCxPQWxDRCxDQWZrQyxDQW1EbEM7QUFDQTs7O0FBQ0EsVUFBTWMsdUJBQXVCLEdBQUcsU0FBMUJBLHVCQUEwQixDQUFDbkcsU0FBRCxFQUFlO0FBQzdDLFlBQUkscUJBQUlBLFNBQUosRUFBZSxjQUFmLENBQUosRUFBb0M7QUFDbEMsY0FBSW9GLGFBQWEsS0FBS3BGLFNBQXRCLEVBQWlDO0FBQy9CcUYsWUFBQUEsZ0JBQWdCLEdBQUcseUJBQ2pCO0FBQ0Esc0JBQUMxSSxLQUFEO0FBQUEsaURBQVdxSixJQUFYO0FBQVdBLGdCQUFBQSxJQUFYO0FBQUE7O0FBQUEscUJBQW9CaEcsU0FBUyxNQUFULDBDQUFlQSxTQUFTLENBQUNpRyxZQUF6QixHQUEwQ3RKLEtBQTFDLFVBQXNEcUosSUFBdEQsRUFBcEI7QUFBQSxhQUZpQixFQUdqQmhHLFNBSGlCLEVBSWpCO0FBQUVrRyxjQUFBQSxXQUFXLEVBQUVyRCxPQUFPLENBQUN3QixpQkFBUixDQUEwQjtBQUFFcEksZ0JBQUFBLElBQUksRUFBRStEO0FBQVIsZUFBMUI7QUFBZixhQUppQixDQUFuQjtBQU1Bb0YsWUFBQUEsYUFBYSxHQUFHcEYsU0FBaEI7QUFDRDs7QUFDRCxpQkFBT3FGLGdCQUFQO0FBQ0Q7O0FBRUQsZUFBT3JGLFNBQVA7QUFDRCxPQWZEOztBQWlCQSxVQUFNb0csYUFBYSxHQUFHLFNBQWhCQSxhQUFnQixDQUFDQyxRQUFELEVBQXVCO0FBQUEsMkNBQVRDLElBQVM7QUFBVEEsVUFBQUEsSUFBUztBQUFBOztBQUMzQyxZQUFNQyxVQUFVLEdBQUd0QixRQUFRLENBQUM5RSxNQUFULE9BQUE4RSxRQUFRLEdBQVFvQixRQUFSLFNBQXFCQyxJQUFyQixFQUEzQjtBQUVBLFlBQU1FLGFBQWEsR0FBRyxDQUFDLEVBQUVELFVBQVUsSUFBSUEsVUFBVSxDQUFDdEssSUFBM0IsQ0FBdkI7O0FBQ0EsWUFBSXVLLGFBQUosRUFBbUI7QUFDakIsY0FBTUMsUUFBUSxHQUFHakssOEJBQThCLENBQUMrSixVQUFELEVBQWE7QUFBRTlKLFlBQUFBLGdCQUFnQixFQUFoQkE7QUFBRixXQUFiLENBQS9DO0FBRUEsY0FBTWlLLGdCQUFnQixHQUFHRCxRQUFRLENBQUN4SyxJQUFULEtBQWtCc0ssVUFBVSxDQUFDdEssSUFBdEQ7O0FBQ0EsY0FBSXlLLGdCQUFKLEVBQXNCO0FBQ3BCLG1CQUFPekIsUUFBUSxDQUFDOUUsTUFBVCxPQUFBOEUsUUFBUSxtQ0FBYW9CLFFBQWI7QUFBdUJwSyxjQUFBQSxJQUFJLEVBQUV3SyxRQUFRLENBQUN4SztBQUF0Qyx1QkFBaURxSyxJQUFqRCxFQUFmO0FBQ0Q7QUFDRjs7QUFFRCxlQUFPQyxVQUFQO0FBQ0QsT0FkRDs7QUFnQkEsYUFBTztBQUNMO0FBQ0FwRyxRQUFBQSxNQUZLLGtCQUVFdEUsRUFGRixFQUVNOEssZUFGTixFQUlHO0FBQUEsMEZBQUosRUFBSTtBQUFBLDJDQUROQyxjQUNNO0FBQUEsY0FETkEsY0FDTSxxQ0FEVyxJQUFJQyxHQUFKLEVBQ1g7O0FBQ04xQixVQUFBQSxVQUFVLEdBQUd0SixFQUFiOztBQUNBLGNBQUksT0FBT0EsRUFBRSxDQUFDSSxJQUFWLEtBQW1CLFFBQXZCLEVBQWlDO0FBQy9CaUosWUFBQUEsS0FBSyxHQUFHLElBQVI7QUFDRCxXQUZELE1BRU8sSUFBSSxnQ0FBa0JySixFQUFsQixDQUFKLEVBQTJCO0FBQ2hDK0ssWUFBQUEsY0FBYyxDQUFDRSxHQUFmLENBQW1CakwsRUFBRSxDQUFDSSxJQUF0QixFQUE0QkosRUFBRSxDQUFDYyxLQUFILENBQVNvSyxLQUFyQztBQUNBLGdCQUFNQyxZQUFZLEdBQUcsd0JBQ25CLFVBQUNySyxLQUFEO0FBQUEscUJBQVdBLEtBQUssQ0FBQ0QsUUFBakI7QUFBQSxhQURtQixFQUVuQmIsRUFBRSxDQUFDSSxJQUZnQixDQUFyQjtBQUlBLG1CQUFPLDZDQUFvQjtBQUFBLHFCQUFNbUssYUFBYSxpQ0FBTXZLLEVBQU47QUFBVUksZ0JBQUFBLElBQUksRUFBRStLO0FBQWhCLGlCQUFuQjtBQUFBLGFBQXBCLENBQVA7QUFDRCxXQVBNLE1BT0EsSUFBSSxnQ0FBa0JuTCxFQUFsQixDQUFKLEVBQTJCO0FBQ2hDLGdCQUFNK0UsUUFBUSxHQUFHaUMsT0FBTyxDQUFDb0UsdUJBQVIsQ0FBZ0NwTCxFQUFFLENBQUNJLElBQW5DLENBQWpCO0FBQ0EsZ0JBQU04SyxLQUFLLEdBQUdILGNBQWMsQ0FBQ00sR0FBZixDQUFtQnRHLFFBQW5CLElBQ1ZnRyxjQUFjLENBQUNPLEdBQWYsQ0FBbUJ2RyxRQUFuQixDQURVLEdBRVZELHVCQUF1QixDQUFDQyxRQUFELENBRjNCO0FBR0EsZ0JBQU13RyxZQUFZLEdBQUcsd0JBQ25CLFVBQUN6SyxLQUFEO0FBQUEscUJBQVdBLEtBQUssQ0FBQ0QsUUFBTixDQUFlcUssS0FBZixDQUFYO0FBQUEsYUFEbUIsRUFFbkJsTCxFQUFFLENBQUNJLElBRmdCLENBQXJCO0FBSUEsbUJBQU8sNkNBQW9CO0FBQUEscUJBQU1tSyxhQUFhLGlDQUFNdkssRUFBTjtBQUFVSSxnQkFBQUEsSUFBSSxFQUFFbUw7QUFBaEIsaUJBQW5CO0FBQUEsYUFBcEIsQ0FBUDtBQUNELFdBVk0sTUFVQTtBQUNMbEMsWUFBQUEsS0FBSyxHQUFHLEtBQVI7QUFDQSxnQkFBSXFCLFVBQVUsR0FBRzFLLEVBQWpCOztBQUNBLGdCQUFJUSxNQUFNLENBQUNrSyxVQUFELENBQVYsRUFBd0I7QUFDdEIsb0JBQU1qRSxTQUFTLENBQUMscURBQUQsQ0FBZjtBQUNEOztBQUVEaUUsWUFBQUEsVUFBVSxHQUFHL0osOEJBQThCLENBQUMrSixVQUFELEVBQWE7QUFBRTlKLGNBQUFBLGdCQUFnQixFQUFoQkE7QUFBRixhQUFiLENBQTNDO0FBQ0EsOEJBQTRCOEosVUFBNUI7QUFBQSxnQkFBY3ZHLFNBQWQsZUFBUS9ELElBQVI7QUFFQSxnQkFBTTZHLE9BQU8sR0FBRywwQ0FBaUI5QyxTQUFTLENBQUNxSCxZQUEzQixFQUF5Q1YsZUFBekMsQ0FBaEI7O0FBRUEsZ0JBQUl4SyxNQUFNLENBQUNOLEVBQUUsQ0FBQ0ksSUFBSixDQUFWLEVBQXFCO0FBQ25CLDZCQUFxQ0osRUFBRSxDQUFDSSxJQUF4QztBQUFBLGtCQUFjcUwsU0FBZCxZQUFRckwsSUFBUjtBQUFBLGtCQUF5QnVKLE9BQXpCLFlBQXlCQSxPQUF6QjtBQUVBLHFCQUFPLDZDQUFvQjtBQUFBLHVCQUFNWSxhQUFhLGlDQUN2Q3ZLLEVBRHVDO0FBQ25DSSxrQkFBQUEsSUFBSSxFQUFFc0osaUJBQWlCLENBQUMrQixTQUFELEVBQVk5QixPQUFaO0FBRFksb0JBRTVDMUMsT0FGNEMsQ0FBbkI7QUFBQSxlQUFwQixDQUFQO0FBSUQ7O0FBRUQsZ0JBQU15RSxtQkFBbUIsR0FBR3BHLFVBQVUsQ0FBQ25CLFNBQUQsQ0FBdEM7O0FBRUEsZ0JBQUksQ0FBQ3VILG1CQUFELElBQXdCLE9BQU92SCxTQUFQLEtBQXFCLFVBQWpELEVBQTZEO0FBQzNELHFCQUFPLDZDQUFvQjtBQUFBLHVCQUFNb0csYUFBYSxpQ0FDdkNHLFVBRHVDO0FBQzNCdEssa0JBQUFBLElBQUksRUFBRWtLLHVCQUF1QixDQUFDbkcsU0FBRDtBQURGLG9CQUU1QzhDLE9BRjRDLENBQW5CO0FBQUEsZUFBcEIsQ0FBUDtBQUlEOztBQUVELGdCQUFJeUUsbUJBQUosRUFBeUI7QUFDdkIsa0JBQ0V0QyxRQUFRLENBQUM3RSxTQUFULElBQ0d2RSxFQUFFLENBQUNjLEtBQUgsS0FBYXNJLFFBQVEsQ0FBQzdFLFNBQVQsQ0FBbUJ6RCxLQURuQyxJQUVHLENBQUMsb0NBQWFtRyxPQUFiLEVBQXNCbUMsUUFBUSxDQUFDN0UsU0FBVCxDQUFtQjBDLE9BQXpDLENBSE4sRUFJRTtBQUNBLGlDQUFvQixtQ0FDbEJtQyxRQURrQixFQUVsQix1QkFGa0IsRUFHbEIsVUFBQ3VDLGNBQUQ7QUFBQSx5QkFBb0IsU0FBU0MscUJBQVQsR0FBd0M7QUFDMUQsd0JBQVE5SyxLQUFSLEdBQWtCc0ksUUFBUSxDQUFDN0UsU0FBM0IsQ0FBUXpELEtBQVI7O0FBQ0Esd0JBQU0rSyxXQUFXLHFCQUFRL0ssS0FBUixDQUFqQjs7QUFDQXNJLG9CQUFBQSxRQUFRLENBQUM3RSxTQUFULENBQW1CekQsS0FBbkIsR0FBMkIrSyxXQUEzQjs7QUFIMEQsdURBQU4xQixJQUFNO0FBQU5BLHNCQUFBQSxJQUFNO0FBQUE7O0FBSzFELHdCQUFNekssTUFBTSxHQUFHaU0sY0FBYyxDQUFDRyxLQUFmLENBQXFCMUMsUUFBckIsRUFBK0JlLElBQS9CLENBQWY7QUFFQWYsb0JBQUFBLFFBQVEsQ0FBQzdFLFNBQVQsQ0FBbUJ6RCxLQUFuQixHQUEyQkEsS0FBM0I7QUFDQWlMLG9CQUFBQSxPQUFPO0FBRVAsMkJBQU9yTSxNQUFQO0FBQ0QsbUJBWEQ7QUFBQSxpQkFIa0IsQ0FBcEI7QUFBQSxvQkFBUXFNLE9BQVIsY0FBUUEsT0FBUjtBQWdCRCxlQXRCc0IsQ0F3QnZCOzs7QUFDQSxrQkFBTUMsZUFBZSxHQUFHL0gsa0JBQWtCLEVBQTFDOztBQUNBLGtCQUFJK0gsZUFBSixFQUFxQjtBQUNuQkMsZ0JBQUFBLE1BQU0sQ0FBQ0MsY0FBUCxDQUFzQi9ILFNBQVMsQ0FBQ29CLFNBQWhDLEVBQTJDLE9BQTNDLEVBQW9EO0FBQ2xENEcsa0JBQUFBLFlBQVksRUFBRSxJQURvQztBQUVsREMsa0JBQUFBLFVBQVUsRUFBRSxJQUZzQztBQUdsRGQsa0JBQUFBLEdBSGtELGlCQUc1QztBQUNKLDJCQUFPLElBQVA7QUFDRCxtQkFMaUQ7QUFNbERMLGtCQUFBQSxHQU5rRCxlQU05Q0MsS0FOOEMsRUFNdkM7QUFDVCx3QkFBSUEsS0FBSyxLQUFLYyxlQUFkLEVBQStCO0FBQzdCQyxzQkFBQUEsTUFBTSxDQUFDQyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLE9BQTVCLEVBQXFDO0FBQ25DQyx3QkFBQUEsWUFBWSxFQUFFLElBRHFCO0FBRW5DQyx3QkFBQUEsVUFBVSxFQUFFLElBRnVCO0FBR25DbEIsd0JBQUFBLEtBQUssRUFBTEEsS0FIbUM7QUFJbkNtQix3QkFBQUEsUUFBUSxFQUFFO0FBSnlCLHVCQUFyQztBQU1EOztBQUNELDJCQUFPLElBQVA7QUFDRDtBQWhCaUQsaUJBQXBEO0FBa0JEO0FBQ0Y7O0FBQ0QsbUJBQU8sNkNBQW9CO0FBQUEscUJBQU05QixhQUFhLENBQUNHLFVBQUQsRUFBYXpELE9BQWIsQ0FBbkI7QUFBQSxhQUFwQixDQUFQO0FBQ0Q7QUFDRixTQXhHSTtBQXlHTFEsUUFBQUEsT0F6R0sscUJBeUdLO0FBQ1IyQixVQUFBQSxRQUFRLENBQUMzQixPQUFUO0FBQ0QsU0EzR0k7QUE0R0xFLFFBQUFBLE9BNUdLLHFCQTRHSztBQUNSLGNBQUkwQixLQUFKLEVBQVc7QUFDVCxtQkFBT2pJLGFBQWEsQ0FBQ2tJLFVBQUQsQ0FBcEI7QUFDRDs7QUFDRCxjQUFNZ0QsTUFBTSxHQUFHbEQsUUFBUSxDQUFDbUQsZUFBVCxFQUFmO0FBQ0EsaUJBQU87QUFDTGpMLFlBQUFBLFFBQVEsRUFBRW5CLGdCQUFnQixDQUFDbUosVUFBVSxDQUFDbEosSUFBWixDQURyQjtBQUVMQSxZQUFBQSxJQUFJLEVBQUVrSixVQUFVLENBQUNsSixJQUZaO0FBR0xVLFlBQUFBLEtBQUssRUFBRXdJLFVBQVUsQ0FBQ3hJLEtBSGI7QUFJTFMsWUFBQUEsR0FBRyxFQUFFLDhDQUFxQitILFVBQVUsQ0FBQy9ILEdBQWhDLENBSkE7QUFLTEMsWUFBQUEsR0FBRyxFQUFFOEgsVUFBVSxDQUFDOUgsR0FMWDtBQU1MQyxZQUFBQSxRQUFRLEVBQUUySCxRQUFRLENBQUM3RSxTQU5kO0FBT0w3QyxZQUFBQSxRQUFRLEVBQUV6QixLQUFLLENBQUNDLE9BQU4sQ0FBY29NLE1BQWQsSUFDTjlNLE9BQU8sQ0FBQzhNLE1BQUQsQ0FBUCxDQUFnQjVKLEdBQWhCLENBQW9CLFVBQUMxQyxFQUFEO0FBQUEscUJBQVFvQixhQUFhLENBQUNwQixFQUFELENBQXJCO0FBQUEsYUFBcEIsQ0FETSxHQUVOb0IsYUFBYSxDQUFDa0wsTUFBRDtBQVRaLFdBQVA7QUFXRCxTQTVISTtBQTZITHhFLFFBQUFBLGFBN0hLLHlCQTZIU0MsYUE3SFQsRUE2SHdCQyxRQTdIeEIsRUE2SGtDQyxLQTdIbEMsRUE2SHlDO0FBQzVDLGlEQUNFQSxLQURGLEVBRUVtQixRQUFRLENBQUM3RSxTQUZYLEVBR0UrRSxVQUhGLEVBSUV2QixhQUFhLENBQUN5RSxNQUFkLENBQXFCbEQsVUFBckIsQ0FKRixFQUtFbkosZ0JBTEYsRUFNRTZHLE9BQU8sQ0FBQ3dCLGlCQU5WLEVBT0VjLFVBQVUsQ0FBQ2xKLElBUGI7QUFTRCxTQXZJSTtBQXdJTHFJLFFBQUFBLGFBeElLLHlCQXdJU3BKLElBeElULEVBd0llcUosS0F4SWYsRUF3SStCO0FBQUEsNkNBQU55QixJQUFNO0FBQU5BLFlBQUFBLElBQU07QUFBQTs7QUFDbEMsY0FBTXNDLE9BQU8sR0FBR3BOLElBQUksQ0FBQ3lCLEtBQUwsQ0FBVyx1Q0FBYzRILEtBQWQsRUFBcUI3RSxZQUFyQixDQUFYLENBQWhCOztBQUNBLGNBQUk0SSxPQUFKLEVBQWE7QUFDWCx5REFBb0IsWUFBTTtBQUN4QjtBQUNBO0FBQ0E7QUFDQUEsY0FBQUEsT0FBTyxNQUFQLFNBQVd0QyxJQUFYLEVBSndCLENBS3hCO0FBQ0QsYUFORDtBQU9EO0FBQ0YsU0FuSkk7QUFvSkxwQixRQUFBQSxjQXBKSywwQkFvSlVyRSxFQXBKVixFQW9KYztBQUNqQixpQkFBT0EsRUFBRSxFQUFULENBRGlCLENBRWpCO0FBQ0QsU0F2Skk7QUF3SkxnSSxRQUFBQSxjQXhKSywwQkF3SlVDLFNBeEpWLEVBd0pxQkMsTUF4SnJCLEVBd0o2QkMsUUF4SjdCLEVBd0p1Q0MsU0F4SnZDLEVBd0prRDtBQUNyRCxpQkFBTyxpQ0FDTEgsU0FESyxFQUVMQyxNQUZLLEVBR0xDLFFBSEssRUFJTCwyQ0FBa0J2RCxVQUFsQixDQUpLLEVBS0w7QUFBQSxtQkFBTSwyQ0FBa0J3RCxTQUFTLENBQUNOLE1BQVYsQ0FBaUIsQ0FBQ2xELFVBQUQsQ0FBakIsQ0FBbEIsQ0FBTjtBQUFBLFdBTEssQ0FBUDtBQU9EO0FBaEtJLE9BQVA7QUFrS0Q7OztXQUVELDhCQUFxQjFELE9BQXJCLEVBQThCO0FBQzVCLFVBQUkscUJBQUlBLE9BQUosRUFBYSxrQkFBYixDQUFKLEVBQXNDO0FBQ3BDLGNBQU0sSUFBSWEsU0FBSixDQUFjLDBFQUFkLENBQU47QUFDRDs7QUFDRCxhQUFPO0FBQ0xuQyxRQUFBQSxNQURLLGtCQUNFdEUsRUFERixFQUNNaUgsT0FETixFQUNlO0FBQ2xCLGNBQUlyQixPQUFPLENBQUNxQixPQUFSLEtBQW9CakgsRUFBRSxDQUFDSSxJQUFILENBQVFvTCxZQUFSLElBQXdCNUYsT0FBTyxDQUFDbUgsaUJBQXBELENBQUosRUFBNEU7QUFDMUUsZ0JBQU1BLGlCQUFpQixtQ0FDakIvTSxFQUFFLENBQUNJLElBQUgsQ0FBUW9MLFlBQVIsSUFBd0IsRUFEUCxHQUVsQjVGLE9BQU8sQ0FBQ21ILGlCQUZVLENBQXZCOztBQUlBLGdCQUFNQyxjQUFjLEdBQUcsNkNBQW9CaE4sRUFBcEIsRUFBd0JpSCxPQUF4QixFQUFpQzhGLGlCQUFqQyxDQUF2QjtBQUNBLG1CQUFPRSxtQkFBZUMsb0JBQWYsZUFBb0NoTSxrQkFBTUMsYUFBTixDQUFvQjZMLGNBQXBCLENBQXBDLENBQVA7QUFDRDs7QUFDRCxpQkFBT0MsbUJBQWVDLG9CQUFmLENBQW9DbE4sRUFBcEMsQ0FBUDtBQUNEO0FBWEksT0FBUDtBQWFELEssQ0FFRDtBQUNBO0FBQ0E7Ozs7V0FDQSx3QkFBZTRGLE9BQWYsRUFBd0I7QUFDdEIsY0FBUUEsT0FBTyxDQUFDdUgsSUFBaEI7QUFDRSxhQUFLQyxzQkFBY0MsS0FBZCxDQUFvQkMsS0FBekI7QUFBZ0MsaUJBQU8sS0FBS0MsbUJBQUwsQ0FBeUIzSCxPQUF6QixDQUFQOztBQUNoQyxhQUFLd0gsc0JBQWNDLEtBQWQsQ0FBb0JHLE9BQXpCO0FBQWtDLGlCQUFPLEtBQUtDLHFCQUFMLENBQTJCN0gsT0FBM0IsQ0FBUDs7QUFDbEMsYUFBS3dILHNCQUFjQyxLQUFkLENBQW9CSyxNQUF6QjtBQUFpQyxpQkFBTyxLQUFLQyxvQkFBTCxDQUEwQi9ILE9BQTFCLENBQVA7O0FBQ2pDO0FBQ0UsZ0JBQU0sSUFBSXRDLEtBQUoscURBQXVEc0MsT0FBTyxDQUFDdUgsSUFBL0QsRUFBTjtBQUxKO0FBT0Q7OztXQUVELGNBQUtTLE9BQUwsRUFBYztBQUNaLGFBQU8sOEJBQUtBLE9BQUwsQ0FBUDtBQUNELEssQ0FFRDtBQUNBO0FBQ0E7QUFDQTs7OztXQUNBLHVCQUFjdk8sSUFBZCxFQUFvQjtBQUNsQixVQUFJLENBQUNBLElBQUQsSUFBUyxRQUFPQSxJQUFQLE1BQWdCLFFBQTdCLEVBQXVDLE9BQU8sSUFBUDtBQUN2QyxVQUFRZSxJQUFSLEdBQWlCZixJQUFqQixDQUFRZSxJQUFSO0FBQ0EsMEJBQU9jLGtCQUFNQyxhQUFOLENBQW9CVCxVQUFVLENBQUNOLElBQUQsQ0FBOUIsRUFBc0MsNkNBQW9CZixJQUFwQixDQUF0QyxDQUFQO0FBQ0QsSyxDQUVEOzs7O1dBQ0EsNEJBQW1CQSxJQUFuQixFQUF5QndPLFlBQXpCLEVBQXVDO0FBQ3JDLFVBQUksQ0FBQ3hPLElBQUwsRUFBVztBQUNULGVBQU9BLElBQVA7QUFDRDs7QUFDRCxVQUFRZSxJQUFSLEdBQWlCZixJQUFqQixDQUFRZSxJQUFSO0FBQ0EsYUFBT00sVUFBVSxDQUFDTixJQUFELENBQVYsS0FBcUJNLFVBQVUsQ0FBQ21OLFlBQUQsQ0FBdEM7QUFDRDs7O1dBRUQsdUJBQWNELE9BQWQsRUFBdUI7QUFDckIsYUFBT3hNLGFBQWEsQ0FBQ3dNLE9BQUQsQ0FBcEI7QUFDRDs7O1dBRUQsd0JBQWV2TyxJQUFmLEVBQTRDO0FBQUEsVUFBdkJ5TyxhQUF1Qix1RUFBUCxLQUFPOztBQUMxQyxVQUFNQyxLQUFLLEdBQUd4SyxlQUFjLENBQUNsRSxJQUFELENBQTVCOztBQUNBLFVBQUlZLEtBQUssQ0FBQ0MsT0FBTixDQUFjNk4sS0FBZCxLQUF3QixDQUFDRCxhQUE3QixFQUE0QztBQUMxQyxlQUFPQyxLQUFLLENBQUMsQ0FBRCxDQUFaO0FBQ0Q7O0FBQ0QsYUFBT0EsS0FBUDtBQUNEOzs7V0FFRCwyQkFBa0IxTyxJQUFsQixFQUF3QjtBQUN0QixVQUFJLENBQUNBLElBQUwsRUFBVyxPQUFPLElBQVA7QUFDWCxVQUFRZSxJQUFSLEdBQTJCZixJQUEzQixDQUFRZSxJQUFSO0FBQUEsVUFBY2dGLFFBQWQsR0FBMkIvRixJQUEzQixDQUFjK0YsUUFBZDtBQUNBLFVBQU00QixPQUFPLEdBQUcsSUFBaEI7QUFFQSxVQUFNMUYsUUFBUSxHQUFHbEIsSUFBSSxJQUFJZ0YsUUFBekIsQ0FMc0IsQ0FPdEI7O0FBQ0EsVUFBSTlELFFBQUosRUFBYztBQUNaLGdCQUFRQSxRQUFSO0FBQ0UsZUFBSzBNLDJCQUFrQkMsR0FBdkI7QUFBNEIsbUJBQU8sZ0JBQVA7O0FBQzVCLGVBQUtwTCxxQkFBWW9MLEdBQWpCO0FBQXNCLG1CQUFPLFVBQVA7O0FBQ3RCLGVBQUtDLHVCQUFjRCxHQUFuQjtBQUF3QixtQkFBTyxZQUFQOztBQUN4QixlQUFLaEwscUJBQVlnTCxHQUFqQjtBQUFzQixtQkFBTyxVQUFQOztBQUN0QixlQUFLNU4sbUJBQVU0TixHQUFmO0FBQW9CLG1CQUFPLFFBQVA7O0FBQ3BCLGVBQUs3SyxxQkFBWTZLLEdBQWpCO0FBQXNCLG1CQUFPLFVBQVA7O0FBQ3RCO0FBUEY7QUFTRDs7QUFFRCxVQUFNRSxZQUFZLEdBQUcvTixJQUFJLElBQUlBLElBQUksQ0FBQ2dGLFFBQWxDOztBQUVBLGNBQVErSSxZQUFSO0FBQ0UsYUFBS25MLDRCQUFtQmlMLEdBQXhCO0FBQTZCLGlCQUFPLGlCQUFQOztBQUM3QixhQUFLbEwsNEJBQW1Ca0wsR0FBeEI7QUFBNkIsaUJBQU8saUJBQVA7O0FBQzdCLGFBQUsxTixpQkFBUTBOLEdBQWI7QUFBa0I7QUFDaEIsZ0JBQU1HLFFBQVEsR0FBRywyQ0FBa0IvTyxJQUFsQixDQUFqQjtBQUNBLG1CQUFPLE9BQU8rTyxRQUFQLEtBQW9CLFFBQXBCLEdBQStCQSxRQUEvQixrQkFBa0RwSCxPQUFPLENBQUN3QixpQkFBUixDQUEwQnBJLElBQTFCLENBQWxELE1BQVA7QUFDRDs7QUFDRCxhQUFLOEMsdUJBQWMrSyxHQUFuQjtBQUF3QjtBQUN0QixnQkFBSTdOLElBQUksQ0FBQ2lLLFdBQVQsRUFBc0I7QUFDcEIscUJBQU9qSyxJQUFJLENBQUNpSyxXQUFaO0FBQ0Q7O0FBQ0QsZ0JBQU1nRSxJQUFJLEdBQUdySCxPQUFPLENBQUN3QixpQkFBUixDQUEwQjtBQUFFcEksY0FBQUEsSUFBSSxFQUFFQSxJQUFJLENBQUNrRTtBQUFiLGFBQTFCLENBQWI7QUFDQSxtQkFBTytKLElBQUksd0JBQWlCQSxJQUFqQixTQUEyQixZQUF0QztBQUNEOztBQUNELGFBQUs1TixpQkFBUXdOLEdBQWI7QUFBa0I7QUFDaEIsbUJBQU8sTUFBUDtBQUNEOztBQUNEO0FBQVMsaUJBQU8sMkNBQWtCNU8sSUFBbEIsQ0FBUDtBQWpCWDtBQW1CRDs7O1dBRUQsd0JBQWV1TyxPQUFmLEVBQXdCO0FBQ3RCLGFBQU8sd0JBQVVBLE9BQVYsQ0FBUDtBQUNEOzs7V0FFRCw0QkFBbUJVLE1BQW5CLEVBQTJCO0FBQ3pCLGFBQU8sQ0FBQyxDQUFDQSxNQUFGLElBQVksaUNBQW1CQSxNQUFuQixDQUFuQjtBQUNEOzs7V0FFRCxvQkFBV0MsUUFBWCxFQUFxQjtBQUNuQixhQUFPLHVCQUFXQSxRQUFYLE1BQXlCMUwsaUJBQWhDO0FBQ0Q7OztXQUVELDJCQUFrQnpDLElBQWxCLEVBQXdCO0FBQ3RCLFVBQU1vTyxXQUFXLEdBQUdySixlQUFlLENBQUMvRSxJQUFELENBQW5DO0FBQ0EsYUFBTyxDQUFDLENBQUNBLElBQUYsS0FDTCxPQUFPQSxJQUFQLEtBQWdCLFVBQWhCLElBQ0csMkJBQWFvTyxXQUFiLENBREgsSUFFRyxnQ0FBa0JBLFdBQWxCLENBRkgsSUFHRyxnQ0FBa0JBLFdBQWxCLENBSEgsSUFJRyx5QkFBV0EsV0FBWCxDQUxFLENBQVA7QUFPRDs7O1dBRUQsMkJBQWtCcE8sSUFBbEIsRUFBd0I7QUFDdEIsYUFBTyxDQUFDLENBQUNBLElBQUYsSUFBVSxnQ0FBa0IrRSxlQUFlLENBQUMvRSxJQUFELENBQWpDLENBQWpCO0FBQ0Q7OztXQUVELGtDQUF5QjZJLElBQXpCLEVBQStCO0FBQzdCLFVBQUksQ0FBQ0EsSUFBRCxJQUFTLENBQUMsS0FBS3dGLGNBQUwsQ0FBb0J4RixJQUFwQixDQUFkLEVBQXlDO0FBQ3ZDLGVBQU8sS0FBUDtBQUNEOztBQUNELGFBQU8sS0FBS3JCLGlCQUFMLENBQXVCcUIsSUFBSSxDQUFDN0ksSUFBNUIsQ0FBUDtBQUNEOzs7V0FFRCxpQ0FBd0JzTyxRQUF4QixFQUFrQztBQUNoQztBQUNBLFVBQUlBLFFBQUosRUFBYztBQUNaLFlBQUkzSixRQUFKOztBQUNBLFlBQUkySixRQUFRLENBQUMxSixRQUFiLEVBQXVCO0FBQUU7QUFDcEJELFVBQUFBLFFBRGtCLEdBQ0wySixRQUFRLENBQUMxSixRQURKLENBQ2xCRCxRQURrQjtBQUV0QixTQUZELE1BRU8sSUFBSTJKLFFBQVEsQ0FBQzNKLFFBQWIsRUFBdUI7QUFDekJBLFVBQUFBLFFBRHlCLEdBQ1oySixRQURZLENBQ3pCM0osUUFEeUI7QUFFN0I7O0FBQ0QsWUFBSUEsUUFBSixFQUFjO0FBQ1osaUJBQU9BLFFBQVA7QUFDRDtBQUNGOztBQUNELFlBQU0sSUFBSXpCLEtBQUosQ0FBVSwyRUFBVixDQUFOO0FBQ0Q7OztXQUVELHlCQUF1QjtBQUNyQiwwQkFBT3BDLGtCQUFNQyxhQUFOLG9DQUFQO0FBQ0Q7OztXQUVELG1DQUEwQjlCLElBQTFCLEVBQWdDdUcsT0FBaEMsRUFBeUM7QUFDdkMsYUFBTztBQUNMK0ksUUFBQUEsVUFBVSxFQUFWQSw4QkFESztBQUVMdFAsUUFBQUEsSUFBSSxFQUFFLG1EQUEwQjZCLGtCQUFNQyxhQUFoQyxFQUErQzlCLElBQS9DLEVBQXFEdUcsT0FBckQ7QUFGRCxPQUFQO0FBSUQ7Ozs7RUF2aUJpQ3dILHFCOztBQTBpQnBDd0IsTUFBTSxDQUFDQyxPQUFQLEdBQWlCbkoscUJBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdXNlLWJlZm9yZS1kZWZpbmUgKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBSZWFjdERPTVNlcnZlciBmcm9tICdyZWFjdC1kb20vc2VydmVyJztcbmltcG9ydCBTaGFsbG93UmVuZGVyZXIgZnJvbSAncmVhY3QtdGVzdC1yZW5kZXJlci9zaGFsbG93JztcbmltcG9ydCBUZXN0VXRpbHMgZnJvbSAncmVhY3QtZG9tL3Rlc3QtdXRpbHMnO1xuaW1wb3J0IGNoZWNrUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMvY2hlY2tQcm9wVHlwZXMnO1xuaW1wb3J0IGhhcyBmcm9tICdoYXMnO1xuaW1wb3J0IHtcbiAgQ29uY3VycmVudE1vZGUsXG4gIENvbnRleHRDb25zdW1lcixcbiAgQ29udGV4dFByb3ZpZGVyLFxuICBFbGVtZW50LFxuICBGb3J3YXJkUmVmLFxuICBGcmFnbWVudCxcbiAgaXNDb250ZXh0Q29uc3VtZXIsXG4gIGlzQ29udGV4dFByb3ZpZGVyLFxuICBpc0VsZW1lbnQsXG4gIGlzRm9yd2FyZFJlZixcbiAgaXNQb3J0YWwsXG4gIGlzU3VzcGVuc2UsXG4gIGlzVmFsaWRFbGVtZW50VHlwZSxcbiAgTGF6eSxcbiAgTWVtbyxcbiAgUG9ydGFsLFxuICBQcm9maWxlcixcbiAgU3RyaWN0TW9kZSxcbiAgU3VzcGVuc2UsXG59IGZyb20gJ3JlYWN0LWlzJztcbmltcG9ydCB7IEVuenltZUFkYXB0ZXIgfSBmcm9tICdlbnp5bWUnO1xuaW1wb3J0IHsgdHlwZU9mTm9kZSB9IGZyb20gJ2VuenltZS9idWlsZC9VdGlscyc7XG5pbXBvcnQgc2hhbGxvd0VxdWFsIGZyb20gJ2VuenltZS1zaGFsbG93LWVxdWFsJztcbmltcG9ydCB7XG4gIGRpc3BsYXlOYW1lT2ZOb2RlLFxuICBlbGVtZW50VG9UcmVlIGFzIHV0aWxFbGVtZW50VG9UcmVlLFxuICBub2RlVHlwZUZyb21UeXBlIGFzIHV0aWxOb2RlVHlwZUZyb21UeXBlLFxuICBtYXBOYXRpdmVFdmVudE5hbWVzLFxuICBwcm9wRnJvbUV2ZW50LFxuICBhc3NlcnREb21BdmFpbGFibGUsXG4gIHdpdGhTZXRTdGF0ZUFsbG93ZWQsXG4gIGNyZWF0ZVJlbmRlcldyYXBwZXIsXG4gIGNyZWF0ZU1vdW50V3JhcHBlcixcbiAgcHJvcHNXaXRoS2V5c0FuZFJlZixcbiAgZW5zdXJlS2V5T3JVbmRlZmluZWQsXG4gIHNpbXVsYXRlRXJyb3IsXG4gIHdyYXAsXG4gIGdldE1hc2tlZENvbnRleHQsXG4gIGdldENvbXBvbmVudFN0YWNrLFxuICBSb290RmluZGVyLFxuICBnZXROb2RlRnJvbVJvb3RGaW5kZXIsXG4gIHdyYXBXaXRoV3JhcHBpbmdDb21wb25lbnQsXG4gIGdldFdyYXBwaW5nQ29tcG9uZW50TW91bnRSZW5kZXJlcixcbiAgY29tcGFyZU5vZGVUeXBlT2YsXG4gIHNweU1ldGhvZCxcbn0gZnJvbSAnQHdvanRla21hai9lbnp5bWUtYWRhcHRlci11dGlscyc7XG5pbXBvcnQgZmluZEN1cnJlbnRGaWJlclVzaW5nU2xvd1BhdGggZnJvbSAnLi9maW5kQ3VycmVudEZpYmVyVXNpbmdTbG93UGF0aCc7XG5pbXBvcnQgZGV0ZWN0RmliZXJUYWdzIGZyb20gJy4vZGV0ZWN0RmliZXJUYWdzJztcblxuLy8gTGF6aWx5IHBvcHVsYXRlZCBpZiBET00gaXMgYXZhaWxhYmxlLlxubGV0IEZpYmVyVGFncyA9IG51bGw7XG5cbmZ1bmN0aW9uIG5vZGVBbmRTaWJsaW5nc0FycmF5KG5vZGVXaXRoU2libGluZykge1xuICBjb25zdCBhcnJheSA9IFtdO1xuICBsZXQgbm9kZSA9IG5vZGVXaXRoU2libGluZztcbiAgd2hpbGUgKG5vZGUgIT0gbnVsbCkge1xuICAgIGFycmF5LnB1c2gobm9kZSk7XG4gICAgbm9kZSA9IG5vZGUuc2libGluZztcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW4oYXJyKSB7XG4gIGNvbnN0IHJlc3VsdCA9IFtdO1xuICBjb25zdCBzdGFjayA9IFt7IGk6IDAsIGFycmF5OiBhcnIgfV07XG4gIHdoaWxlIChzdGFjay5sZW5ndGgpIHtcbiAgICBjb25zdCBuID0gc3RhY2sucG9wKCk7XG4gICAgd2hpbGUgKG4uaSA8IG4uYXJyYXkubGVuZ3RoKSB7XG4gICAgICBjb25zdCBlbCA9IG4uYXJyYXlbbi5pXTtcbiAgICAgIG4uaSArPSAxO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZWwpKSB7XG4gICAgICAgIHN0YWNrLnB1c2gobik7XG4gICAgICAgIHN0YWNrLnB1c2goeyBpOiAwLCBhcnJheTogZWwgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgcmVzdWx0LnB1c2goZWwpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBub2RlVHlwZUZyb21UeXBlKHR5cGUpIHtcbiAgaWYgKHR5cGUgPT09IFBvcnRhbCkge1xuICAgIHJldHVybiAncG9ydGFsJztcbiAgfVxuXG4gIHJldHVybiB1dGlsTm9kZVR5cGVGcm9tVHlwZSh0eXBlKTtcbn1cblxuZnVuY3Rpb24gaXNNZW1vKHR5cGUpIHtcbiAgcmV0dXJuIGNvbXBhcmVOb2RlVHlwZU9mKHR5cGUsIE1lbW8pO1xufVxuXG5mdW5jdGlvbiBpc0xhenkodHlwZSkge1xuICByZXR1cm4gY29tcGFyZU5vZGVUeXBlT2YodHlwZSwgTGF6eSk7XG59XG5cbmZ1bmN0aW9uIHVubWVtb1R5cGUodHlwZSkge1xuICByZXR1cm4gaXNNZW1vKHR5cGUpID8gdHlwZS50eXBlIDogdHlwZTtcbn1cblxuZnVuY3Rpb24gY2hlY2tJc1N1c3BlbnNlQW5kQ2xvbmVFbGVtZW50KGVsLCB7IHN1c3BlbnNlRmFsbGJhY2sgfSkge1xuICBpZiAoIWlzU3VzcGVuc2UoZWwpKSB7XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgbGV0IHsgY2hpbGRyZW4gfSA9IGVsLnByb3BzO1xuXG4gIGlmIChzdXNwZW5zZUZhbGxiYWNrKSB7XG4gICAgY29uc3QgeyBmYWxsYmFjayB9ID0gZWwucHJvcHM7XG4gICAgY2hpbGRyZW4gPSByZXBsYWNlTGF6eVdpdGhGYWxsYmFjayhjaGlsZHJlbiwgZmFsbGJhY2spO1xuICB9XG5cbiAgY29uc3QgRmFrZVN1c3BlbnNlV3JhcHBlciA9IChwcm9wcykgPT4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICBlbC50eXBlLFxuICAgIHsgLi4uZWwucHJvcHMsIC4uLnByb3BzIH0sXG4gICAgY2hpbGRyZW4sXG4gICk7XG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KEZha2VTdXNwZW5zZVdyYXBwZXIsIG51bGwsIGNoaWxkcmVuKTtcbn1cblxuZnVuY3Rpb24gZWxlbWVudFRvVHJlZShlbCkge1xuICBpZiAoIWlzUG9ydGFsKGVsKSkge1xuICAgIHJldHVybiB1dGlsRWxlbWVudFRvVHJlZShlbCwgZWxlbWVudFRvVHJlZSk7XG4gIH1cblxuICBjb25zdCB7IGNoaWxkcmVuLCBjb250YWluZXJJbmZvIH0gPSBlbDtcbiAgY29uc3QgcHJvcHMgPSB7IGNoaWxkcmVuLCBjb250YWluZXJJbmZvIH07XG5cbiAgcmV0dXJuIHtcbiAgICBub2RlVHlwZTogJ3BvcnRhbCcsXG4gICAgdHlwZTogUG9ydGFsLFxuICAgIHByb3BzLFxuICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQoZWwua2V5KSxcbiAgICByZWY6IGVsLnJlZiB8fCBudWxsLFxuICAgIGluc3RhbmNlOiBudWxsLFxuICAgIHJlbmRlcmVkOiBlbGVtZW50VG9UcmVlKGVsLmNoaWxkcmVuKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gdG9UcmVlKHZub2RlKSB7XG4gIGlmICh2bm9kZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgLy8gVE9ETyhsbXIpOiBJJ20gbm90IHJlYWxseSBzdXJlIEkgdW5kZXJzdGFuZCB3aGV0aGVyIG9yIG5vdCB0aGlzIGlzIHdoYXRcbiAgLy8gaSBzaG91bGQgYmUgZG9pbmcsIG9yIGlmIHRoaXMgaXMgYSBoYWNrIGZvciBzb21ldGhpbmcgaSdtIGRvaW5nIHdyb25nXG4gIC8vIHNvbWV3aGVyZSBlbHNlLiBTaG91bGQgdGFsayB0byBzZWJhc3RpYW4gYWJvdXQgdGhpcyBwZXJoYXBzXG4gIGNvbnN0IG5vZGUgPSBmaW5kQ3VycmVudEZpYmVyVXNpbmdTbG93UGF0aCh2bm9kZSk7XG4gIHN3aXRjaCAobm9kZS50YWcpIHtcbiAgICBjYXNlIEZpYmVyVGFncy5Ib3N0Um9vdDpcbiAgICAgIHJldHVybiBjaGlsZHJlblRvVHJlZShub2RlLmNoaWxkKTtcbiAgICBjYXNlIEZpYmVyVGFncy5Ib3N0UG9ydGFsOiB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHN0YXRlTm9kZTogeyBjb250YWluZXJJbmZvIH0sXG4gICAgICAgIG1lbW9pemVkUHJvcHM6IGNoaWxkcmVuLFxuICAgICAgfSA9IG5vZGU7XG4gICAgICBjb25zdCBwcm9wcyA9IHsgY29udGFpbmVySW5mbywgY2hpbGRyZW4gfTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vZGVUeXBlOiAncG9ydGFsJyxcbiAgICAgICAgdHlwZTogUG9ydGFsLFxuICAgICAgICBwcm9wcyxcbiAgICAgICAga2V5OiBlbnN1cmVLZXlPclVuZGVmaW5lZChub2RlLmtleSksXG4gICAgICAgIHJlZjogbm9kZS5yZWYsXG4gICAgICAgIGluc3RhbmNlOiBudWxsLFxuICAgICAgICByZW5kZXJlZDogY2hpbGRyZW5Ub1RyZWUobm9kZS5jaGlsZCksXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIEZpYmVyVGFncy5DbGFzc0NvbXBvbmVudDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vZGVUeXBlOiAnY2xhc3MnLFxuICAgICAgICB0eXBlOiBub2RlLnR5cGUsXG4gICAgICAgIHByb3BzOiB7IC4uLm5vZGUubWVtb2l6ZWRQcm9wcyB9LFxuICAgICAgICBrZXk6IGVuc3VyZUtleU9yVW5kZWZpbmVkKG5vZGUua2V5KSxcbiAgICAgICAgcmVmOiBub2RlLnJlZixcbiAgICAgICAgaW5zdGFuY2U6IG5vZGUuc3RhdGVOb2RlLFxuICAgICAgICByZW5kZXJlZDogY2hpbGRyZW5Ub1RyZWUobm9kZS5jaGlsZCksXG4gICAgICB9O1xuICAgIGNhc2UgRmliZXJUYWdzLkZ1bmN0aW9uYWxDb21wb25lbnQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlVHlwZTogJ2Z1bmN0aW9uJyxcbiAgICAgICAgdHlwZTogbm9kZS50eXBlLFxuICAgICAgICBwcm9wczogeyAuLi5ub2RlLm1lbW9pemVkUHJvcHMgfSxcbiAgICAgICAga2V5OiBlbnN1cmVLZXlPclVuZGVmaW5lZChub2RlLmtleSksXG4gICAgICAgIHJlZjogbm9kZS5yZWYsXG4gICAgICAgIGluc3RhbmNlOiBudWxsLFxuICAgICAgICByZW5kZXJlZDogY2hpbGRyZW5Ub1RyZWUobm9kZS5jaGlsZCksXG4gICAgICB9O1xuICAgIGNhc2UgRmliZXJUYWdzLk1lbW9DbGFzczpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vZGVUeXBlOiAnY2xhc3MnLFxuICAgICAgICB0eXBlOiBub2RlLmVsZW1lbnRUeXBlLnR5cGUsXG4gICAgICAgIHByb3BzOiB7IC4uLm5vZGUubWVtb2l6ZWRQcm9wcyB9LFxuICAgICAgICBrZXk6IGVuc3VyZUtleU9yVW5kZWZpbmVkKG5vZGUua2V5KSxcbiAgICAgICAgcmVmOiBub2RlLnJlZixcbiAgICAgICAgaW5zdGFuY2U6IG5vZGUuc3RhdGVOb2RlLFxuICAgICAgICByZW5kZXJlZDogY2hpbGRyZW5Ub1RyZWUobm9kZS5jaGlsZC5jaGlsZCksXG4gICAgICB9O1xuICAgIGNhc2UgRmliZXJUYWdzLk1lbW9TRkM6IHtcbiAgICAgIGxldCByZW5kZXJlZE5vZGVzID0gZmxhdHRlbihub2RlQW5kU2libGluZ3NBcnJheShub2RlLmNoaWxkKS5tYXAodG9UcmVlKSk7XG4gICAgICBpZiAocmVuZGVyZWROb2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVuZGVyZWROb2RlcyA9IFtub2RlLm1lbW9pemVkUHJvcHMuY2hpbGRyZW5dO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9kZVR5cGU6ICdmdW5jdGlvbicsXG4gICAgICAgIHR5cGU6IG5vZGUuZWxlbWVudFR5cGUsXG4gICAgICAgIHByb3BzOiB7IC4uLm5vZGUubWVtb2l6ZWRQcm9wcyB9LFxuICAgICAgICBrZXk6IGVuc3VyZUtleU9yVW5kZWZpbmVkKG5vZGUua2V5KSxcbiAgICAgICAgcmVmOiBub2RlLnJlZixcbiAgICAgICAgaW5zdGFuY2U6IG51bGwsXG4gICAgICAgIHJlbmRlcmVkOiByZW5kZXJlZE5vZGVzLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBGaWJlclRhZ3MuSG9zdENvbXBvbmVudDoge1xuICAgICAgbGV0IHJlbmRlcmVkTm9kZXMgPSBmbGF0dGVuKG5vZGVBbmRTaWJsaW5nc0FycmF5KG5vZGUuY2hpbGQpLm1hcCh0b1RyZWUpKTtcbiAgICAgIGlmIChyZW5kZXJlZE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZW5kZXJlZE5vZGVzID0gW25vZGUubWVtb2l6ZWRQcm9wcy5jaGlsZHJlbl07XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlVHlwZTogJ2hvc3QnLFxuICAgICAgICB0eXBlOiBub2RlLnR5cGUsXG4gICAgICAgIHByb3BzOiB7IC4uLm5vZGUubWVtb2l6ZWRQcm9wcyB9LFxuICAgICAgICBrZXk6IGVuc3VyZUtleU9yVW5kZWZpbmVkKG5vZGUua2V5KSxcbiAgICAgICAgcmVmOiBub2RlLnJlZixcbiAgICAgICAgaW5zdGFuY2U6IG5vZGUuc3RhdGVOb2RlLFxuICAgICAgICByZW5kZXJlZDogcmVuZGVyZWROb2RlcyxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgRmliZXJUYWdzLkhvc3RUZXh0OlxuICAgICAgcmV0dXJuIG5vZGUubWVtb2l6ZWRQcm9wcztcbiAgICBjYXNlIEZpYmVyVGFncy5GcmFnbWVudDpcbiAgICBjYXNlIEZpYmVyVGFncy5Nb2RlOlxuICAgIGNhc2UgRmliZXJUYWdzLkNvbnRleHRQcm92aWRlcjpcbiAgICBjYXNlIEZpYmVyVGFncy5Db250ZXh0Q29uc3VtZXI6XG4gICAgICByZXR1cm4gY2hpbGRyZW5Ub1RyZWUobm9kZS5jaGlsZCk7XG4gICAgY2FzZSBGaWJlclRhZ3MuUHJvZmlsZXI6XG4gICAgY2FzZSBGaWJlclRhZ3MuRm9yd2FyZFJlZjoge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9kZVR5cGU6ICdmdW5jdGlvbicsXG4gICAgICAgIHR5cGU6IG5vZGUudHlwZSxcbiAgICAgICAgcHJvcHM6IHsgLi4ubm9kZS5wZW5kaW5nUHJvcHMgfSxcbiAgICAgICAga2V5OiBlbnN1cmVLZXlPclVuZGVmaW5lZChub2RlLmtleSksXG4gICAgICAgIHJlZjogbm9kZS5yZWYsXG4gICAgICAgIGluc3RhbmNlOiBudWxsLFxuICAgICAgICByZW5kZXJlZDogY2hpbGRyZW5Ub1RyZWUobm9kZS5jaGlsZCksXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIEZpYmVyVGFncy5TdXNwZW5zZToge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9kZVR5cGU6ICdmdW5jdGlvbicsXG4gICAgICAgIHR5cGU6IFN1c3BlbnNlLFxuICAgICAgICBwcm9wczogeyAuLi5ub2RlLm1lbW9pemVkUHJvcHMgfSxcbiAgICAgICAga2V5OiBlbnN1cmVLZXlPclVuZGVmaW5lZChub2RlLmtleSksXG4gICAgICAgIHJlZjogbm9kZS5yZWYsXG4gICAgICAgIGluc3RhbmNlOiBudWxsLFxuICAgICAgICByZW5kZXJlZDogY2hpbGRyZW5Ub1RyZWUobm9kZS5jaGlsZCksXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIEZpYmVyVGFncy5MYXp5OlxuICAgICAgcmV0dXJuIGNoaWxkcmVuVG9UcmVlKG5vZGUuY2hpbGQpO1xuICAgIGNhc2UgRmliZXJUYWdzLk9mZnNjcmVlbkNvbXBvbmVudDpcbiAgICAgIHJldHVybiB0b1RyZWUobm9kZS5jaGlsZCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRW56eW1lIEludGVybmFsIEVycm9yOiB1bmtub3duIG5vZGUgd2l0aCB0YWcgJHtub2RlLnRhZ31gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGlsZHJlblRvVHJlZShub2RlKSB7XG4gIGlmICghbm9kZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGNoaWxkcmVuID0gbm9kZUFuZFNpYmxpbmdzQXJyYXkobm9kZSk7XG4gIGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoY2hpbGRyZW4ubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHRvVHJlZShjaGlsZHJlblswXSk7XG4gIH1cbiAgcmV0dXJuIGZsYXR0ZW4oY2hpbGRyZW4ubWFwKHRvVHJlZSkpO1xufVxuXG5mdW5jdGlvbiBub2RlVG9Ib3N0Tm9kZShfbm9kZSkge1xuICAvLyBOT1RFKGxtcik6IG5vZGUgY291bGQgYmUgYSBmdW5jdGlvbiBjb21wb25lbnRcbiAgLy8gd2hpY2ggd29udCBoYXZlIGFuIGluc3RhbmNlIHByb3AsIGJ1dCB3ZSBjYW4gZ2V0IHRoZVxuICAvLyBob3N0IG5vZGUgYXNzb2NpYXRlZCB3aXRoIGl0cyByZXR1cm4gdmFsdWUgYXQgdGhhdCBwb2ludC5cbiAgLy8gQWx0aG91Z2ggdGhpcyBicmVha3MgZG93biBpZiB0aGUgcmV0dXJuIHZhbHVlIGlzIGFuIGFycmF5LFxuICAvLyBhcyBpcyBwb3NzaWJsZSB3aXRoIFJlYWN0IDE2LlxuICBsZXQgbm9kZSA9IF9ub2RlO1xuICB3aGlsZSAobm9kZSAmJiAhQXJyYXkuaXNBcnJheShub2RlKSAmJiBub2RlLmluc3RhbmNlID09PSBudWxsKSB7XG4gICAgbm9kZSA9IG5vZGUucmVuZGVyZWQ7XG4gIH1cbiAgLy8gaWYgdGhlIFNGQyByZXR1cm5lZCBudWxsIGVmZmVjdGl2ZWx5LCB0aGVyZSBpcyBubyBob3N0IG5vZGUuXG4gIGlmICghbm9kZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgbWFwcGVyID0gKGl0ZW0pID0+IHtcbiAgICBpZiAoaXRlbSAmJiBpdGVtLmluc3RhbmNlKSByZXR1cm4gUmVhY3RET00uZmluZERPTU5vZGUoaXRlbS5pbnN0YW5jZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKSB7XG4gICAgcmV0dXJuIG5vZGUubWFwKG1hcHBlcik7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkobm9kZS5yZW5kZXJlZCkgJiYgbm9kZS5ub2RlVHlwZSA9PT0gJ2NsYXNzJykge1xuICAgIHJldHVybiBub2RlLnJlbmRlcmVkLm1hcChtYXBwZXIpO1xuICB9XG4gIHJldHVybiBtYXBwZXIobm9kZSk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VMYXp5V2l0aEZhbGxiYWNrKG5vZGUsIGZhbGxiYWNrKSB7XG4gIGlmICghbm9kZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKSB7XG4gICAgcmV0dXJuIG5vZGUubWFwKChlbCkgPT4gcmVwbGFjZUxhenlXaXRoRmFsbGJhY2soZWwsIGZhbGxiYWNrKSk7XG4gIH1cbiAgaWYgKGlzTGF6eShub2RlLnR5cGUpKSB7XG4gICAgcmV0dXJuIGZhbGxiYWNrO1xuICB9XG4gIHJldHVybiB7XG4gICAgLi4ubm9kZSxcbiAgICBwcm9wczoge1xuICAgICAgLi4ubm9kZS5wcm9wcyxcbiAgICAgIGNoaWxkcmVuOiByZXBsYWNlTGF6eVdpdGhGYWxsYmFjayhub2RlLnByb3BzLmNoaWxkcmVuLCBmYWxsYmFjayksXG4gICAgfSxcbiAgfTtcbn1cblxuY29uc3QgZXZlbnRPcHRpb25zID0ge1xuICBhbmltYXRpb246IHRydWUsXG4gIHBvaW50ZXJFdmVudHM6IHRydWUsXG4gIGF1eENsaWNrOiB0cnVlLFxufTtcblxuZnVuY3Rpb24gZ2V0RW1wdHlTdGF0ZVZhbHVlKCkge1xuICAvLyB0aGlzIGhhbmRsZXMgYSBidWcgaW4gUmVhY3QgMTYuMCAtIDE2LjJcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9jb21taXQvMzliZTgzNTY1YzY1ZjljNTIyMTUwZTUyMzc1MTY3NTY4YTJhMTQ1OVxuICAvLyBhbHNvIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvcHVsbC8xMTk2NVxuXG4gIGNsYXNzIEVtcHR5U3RhdGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHJlbmRlcigpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBjb25zdCB0ZXN0UmVuZGVyZXIgPSBuZXcgU2hhbGxvd1JlbmRlcmVyKCk7XG4gIHRlc3RSZW5kZXJlci5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChFbXB0eVN0YXRlKSk7XG4gIHJldHVybiB0ZXN0UmVuZGVyZXIuX2luc3RhbmNlLnN0YXRlO1xufVxuXG5mdW5jdGlvbiB3cmFwQWN0KGZuKSB7XG4gIGxldCByZXR1cm5WYWw7XG4gIFRlc3RVdGlscy5hY3QoKCkgPT4geyByZXR1cm5WYWwgPSBmbigpOyB9KTtcbiAgcmV0dXJuIHJldHVyblZhbDtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvdmlkZXJEZWZhdWx0VmFsdWUoUHJvdmlkZXIpIHtcbiAgLy8gUmVhY3Qgc3RvcmVzIHJlZmVyZW5jZXMgdG8gdGhlIFByb3ZpZGVyJ3MgZGVmYXVsdFZhbHVlIGRpZmZlcmVudGx5IGFjcm9zcyB2ZXJzaW9ucy5cbiAgaWYgKCdfZGVmYXVsdFZhbHVlJyBpbiBQcm92aWRlci5fY29udGV4dCkge1xuICAgIHJldHVybiBQcm92aWRlci5fY29udGV4dC5fZGVmYXVsdFZhbHVlO1xuICB9XG4gIGlmICgnX2N1cnJlbnRWYWx1ZScgaW4gUHJvdmlkZXIuX2NvbnRleHQpIHtcbiAgICByZXR1cm4gUHJvdmlkZXIuX2NvbnRleHQuX2N1cnJlbnRWYWx1ZTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ0VuenltZSBJbnRlcm5hbCBFcnJvcjogY2Fu4oCZdCBmaWd1cmUgb3V0IGhvdyB0byBnZXQgUHJvdmlkZXLigJlzIGRlZmF1bHQgdmFsdWUnKTtcbn1cblxuZnVuY3Rpb24gbWFrZUZha2VFbGVtZW50KHR5cGUpIHtcbiAgcmV0dXJuIHsgJCR0eXBlb2Y6IEVsZW1lbnQsIHR5cGUgfTtcbn1cblxuZnVuY3Rpb24gaXNTdGF0ZWZ1bChDb21wb25lbnQpIHtcbiAgcmV0dXJuIENvbXBvbmVudC5wcm90b3R5cGUgJiYgKFxuICAgIENvbXBvbmVudC5wcm90b3R5cGUuaXNSZWFjdENvbXBvbmVudFxuICAgIHx8IEFycmF5LmlzQXJyYXkoQ29tcG9uZW50Ll9fcmVhY3RBdXRvQmluZFBhaXJzKSAvLyBmYWxsYmFjayBmb3IgY3JlYXRlQ2xhc3MgY29tcG9uZW50c1xuICApO1xufVxuXG5jbGFzcyBSZWFjdFNldmVudGVlbkFkYXB0ZXIgZXh0ZW5kcyBFbnp5bWVBZGFwdGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICBjb25zdCB7IGxpZmVjeWNsZXMgfSA9IHRoaXMub3B0aW9ucztcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAuLi50aGlzLm9wdGlvbnMsXG4gICAgICBlbmFibGVDb21wb25lbnREaWRVcGRhdGVPblNldFN0YXRlOiB0cnVlLCAvLyBUT0RPOiByZW1vdmUsIHNlbXZlci1tYWpvclxuICAgICAgbGVnYWN5Q29udGV4dE1vZGU6ICdwYXJlbnQnLFxuICAgICAgbGlmZWN5Y2xlczoge1xuICAgICAgICAuLi5saWZlY3ljbGVzLFxuICAgICAgICBjb21wb25lbnREaWRVcGRhdGU6IHtcbiAgICAgICAgICBvblNldFN0YXRlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHM6IHtcbiAgICAgICAgICBoYXNTaG91bGRDb21wb25lbnRVcGRhdGVCdWc6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBnZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZTogdHJ1ZSxcbiAgICAgICAgc2V0U3RhdGU6IHtcbiAgICAgICAgICBza2lwc0NvbXBvbmVudERpZFVwZGF0ZU9uTnVsbGlzaDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Q2hpbGRDb250ZXh0OiB7XG4gICAgICAgICAgY2FsbGVkQnlSZW5kZXJlcjogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZU1vdW50UmVuZGVyZXIob3B0aW9ucykge1xuICAgIGFzc2VydERvbUF2YWlsYWJsZSgnbW91bnQnKTtcbiAgICBpZiAoaGFzKG9wdGlvbnMsICdzdXNwZW5zZUZhbGxiYWNrJykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2BzdXNwZW5zZUZhbGxiYWNrYCBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBgbW91bnRgIHJlbmRlcmVyJyk7XG4gICAgfVxuICAgIGlmIChGaWJlclRhZ3MgPT09IG51bGwpIHtcbiAgICAgIC8vIFJlcXVpcmVzIERPTS5cbiAgICAgIEZpYmVyVGFncyA9IGRldGVjdEZpYmVyVGFncygpO1xuICAgIH1cbiAgICBjb25zdCB7IGF0dGFjaFRvLCBoeWRyYXRlSW4sIHdyYXBwaW5nQ29tcG9uZW50UHJvcHMgfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgZG9tTm9kZSA9IGh5ZHJhdGVJbiB8fCBhdHRhY2hUbyB8fCBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGV0IGluc3RhbmNlID0gbnVsbDtcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcztcbiAgICByZXR1cm4ge1xuICAgICAgcmVuZGVyKGVsLCBjb250ZXh0LCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gd3JhcEFjdCgoKSA9PiB7XG4gICAgICAgICAgaWYgKGluc3RhbmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCB7IHR5cGUsIHByb3BzLCByZWYgfSA9IGVsO1xuICAgICAgICAgICAgY29uc3Qgd3JhcHBlclByb3BzID0ge1xuICAgICAgICAgICAgICBDb21wb25lbnQ6IHR5cGUsXG4gICAgICAgICAgICAgIHByb3BzLFxuICAgICAgICAgICAgICB3cmFwcGluZ0NvbXBvbmVudFByb3BzLFxuICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAuLi4ocmVmICYmIHsgcmVmUHJvcDogcmVmIH0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IFJlYWN0V3JhcHBlckNvbXBvbmVudCA9IGNyZWF0ZU1vdW50V3JhcHBlcihlbCwgeyAuLi5vcHRpb25zLCBhZGFwdGVyIH0pO1xuICAgICAgICAgICAgY29uc3Qgd3JhcHBlZEVsID0gUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdFdyYXBwZXJDb21wb25lbnQsIHdyYXBwZXJQcm9wcyk7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IGh5ZHJhdGVJblxuICAgICAgICAgICAgICA/IFJlYWN0RE9NLmh5ZHJhdGUod3JhcHBlZEVsLCBkb21Ob2RlKVxuICAgICAgICAgICAgICA6IFJlYWN0RE9NLnJlbmRlcih3cmFwcGVkRWwsIGRvbU5vZGUpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnN0YW5jZS5zZXRDaGlsZFByb3BzKGVsLnByb3BzLCBjb250ZXh0LCBjYWxsYmFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB1bm1vdW50KCkge1xuICAgICAgICB3cmFwQWN0KCgpID0+IHtcbiAgICAgICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGRvbU5vZGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgaW5zdGFuY2UgPSBudWxsO1xuICAgICAgfSxcbiAgICAgIGdldE5vZGUoKSB7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0Tm9kZUZyb21Sb290RmluZGVyKFxuICAgICAgICAgIGFkYXB0ZXIuaXNDdXN0b21Db21wb25lbnQsXG4gICAgICAgICAgdG9UcmVlKGluc3RhbmNlLl9yZWFjdEludGVybmFscyksXG4gICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBzaW11bGF0ZUVycm9yKG5vZGVIaWVyYXJjaHksIHJvb3ROb2RlLCBlcnJvcikge1xuICAgICAgICBjb25zdCBpc0Vycm9yQm91bmRhcnkgPSAoeyBpbnN0YW5jZTogZWxJbnN0YW5jZSwgdHlwZSB9KSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGUgJiYgdHlwZS5nZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZWxJbnN0YW5jZSAmJiBlbEluc3RhbmNlLmNvbXBvbmVudERpZENhdGNoO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBpbnN0YW5jZTogY2F0Y2hpbmdJbnN0YW5jZSxcbiAgICAgICAgICB0eXBlOiBjYXRjaGluZ1R5cGUsXG4gICAgICAgIH0gPSBub2RlSGllcmFyY2h5LmZpbmQoaXNFcnJvckJvdW5kYXJ5KSB8fCB7fTtcblxuICAgICAgICBzaW11bGF0ZUVycm9yKFxuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIGNhdGNoaW5nSW5zdGFuY2UsXG4gICAgICAgICAgcm9vdE5vZGUsXG4gICAgICAgICAgbm9kZUhpZXJhcmNoeSxcbiAgICAgICAgICBub2RlVHlwZUZyb21UeXBlLFxuICAgICAgICAgIGFkYXB0ZXIuZGlzcGxheU5hbWVPZk5vZGUsXG4gICAgICAgICAgY2F0Y2hpbmdUeXBlLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIHNpbXVsYXRlRXZlbnQobm9kZSwgZXZlbnQsIG1vY2spIHtcbiAgICAgICAgY29uc3QgbWFwcGVkRXZlbnQgPSBtYXBOYXRpdmVFdmVudE5hbWVzKGV2ZW50LCBldmVudE9wdGlvbnMpO1xuICAgICAgICBjb25zdCBldmVudEZuID0gVGVzdFV0aWxzLlNpbXVsYXRlW21hcHBlZEV2ZW50XTtcbiAgICAgICAgaWYgKCFldmVudEZuKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgUmVhY3RXcmFwcGVyOjpzaW11bGF0ZSgpIGV2ZW50ICcke2V2ZW50fScgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgfVxuICAgICAgICB3cmFwQWN0KCgpID0+IHtcbiAgICAgICAgICBldmVudEZuKGFkYXB0ZXIubm9kZVRvSG9zdE5vZGUobm9kZSksIG1vY2spO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBiYXRjaGVkVXBkYXRlcyhmbikge1xuICAgICAgICByZXR1cm4gZm4oKTtcbiAgICAgICAgLy8gcmV0dXJuIFJlYWN0RE9NLnVuc3RhYmxlX2JhdGNoZWRVcGRhdGVzKGZuKTtcbiAgICAgIH0sXG4gICAgICBnZXRXcmFwcGluZ0NvbXBvbmVudFJlbmRlcmVyKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLnRoaXMsXG4gICAgICAgICAgLi4uZ2V0V3JhcHBpbmdDb21wb25lbnRNb3VudFJlbmRlcmVyKHtcbiAgICAgICAgICAgIHRvVHJlZTogKGluc3QpID0+IHRvVHJlZShpbnN0Ll9yZWFjdEludGVybmFscyksXG4gICAgICAgICAgICBnZXRNb3VudFdyYXBwZXJJbnN0YW5jZTogKCkgPT4gaW5zdGFuY2UsXG4gICAgICAgICAgfSksXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgd3JhcEludm9rZTogd3JhcEFjdCxcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlU2hhbGxvd1JlbmRlcmVyKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzO1xuICAgIGNvbnN0IHJlbmRlcmVyID0gbmV3IFNoYWxsb3dSZW5kZXJlcigpO1xuICAgIGNvbnN0IHsgc3VzcGVuc2VGYWxsYmFjayB9ID0gb3B0aW9ucztcbiAgICBpZiAodHlwZW9mIHN1c3BlbnNlRmFsbGJhY2sgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBzdXNwZW5zZUZhbGxiYWNrICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcignYG9wdGlvbnMuc3VzcGVuc2VGYWxsYmFja2Agc2hvdWxkIGJlIGJvb2xlYW4gb3IgdW5kZWZpbmVkJyk7XG4gICAgfVxuICAgIGxldCBpc0RPTSA9IGZhbHNlO1xuICAgIGxldCBjYWNoZWROb2RlID0gbnVsbDtcblxuICAgIGxldCBsYXN0Q29tcG9uZW50ID0gbnVsbDtcbiAgICBsZXQgd3JhcHBlZENvbXBvbmVudCA9IG51bGw7XG4gICAgY29uc3Qgc2VudGluZWwgPSB7fTtcblxuICAgIC8vIHdyYXAgbWVtbyBjb21wb25lbnRzIHdpdGggYSBQdXJlQ29tcG9uZW50LCBvciBhIGNsYXNzIGNvbXBvbmVudCB3aXRoIHNDVVxuICAgIGNvbnN0IHdyYXBQdXJlQ29tcG9uZW50ID0gKENvbXBvbmVudCwgY29tcGFyZSkgPT4ge1xuICAgICAgaWYgKGxhc3RDb21wb25lbnQgIT09IENvbXBvbmVudCkge1xuICAgICAgICBpZiAoaXNTdGF0ZWZ1bChDb21wb25lbnQpKSB7XG4gICAgICAgICAgd3JhcHBlZENvbXBvbmVudCA9IGNsYXNzIGV4dGVuZHMgQ29tcG9uZW50IHt9O1xuICAgICAgICAgIGlmIChjb21wYXJlKSB7XG4gICAgICAgICAgICB3cmFwcGVkQ29tcG9uZW50LnByb3RvdHlwZS5zaG91bGRDb21wb25lbnRVcGRhdGUgPSAobmV4dFByb3BzKSA9PiAoXG4gICAgICAgICAgICAgICFjb21wYXJlKHRoaXMucHJvcHMsIG5leHRQcm9wcylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdyYXBwZWRDb21wb25lbnQucHJvdG90eXBlLmlzUHVyZVJlYWN0Q29tcG9uZW50ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IG1lbW9pemVkID0gc2VudGluZWw7XG4gICAgICAgICAgbGV0IHByZXZQcm9wcztcbiAgICAgICAgICB3cmFwcGVkQ29tcG9uZW50ID0gZnVuY3Rpb24gd3JhcHBlZENvbXBvbmVudEZuKHByb3BzLCAuLi5hcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBzaG91bGRVcGRhdGUgPSBtZW1vaXplZCA9PT0gc2VudGluZWwgfHwgKGNvbXBhcmVcbiAgICAgICAgICAgICAgPyAhY29tcGFyZShwcmV2UHJvcHMsIHByb3BzKVxuICAgICAgICAgICAgICA6ICFzaGFsbG93RXF1YWwocHJldlByb3BzLCBwcm9wcylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoc2hvdWxkVXBkYXRlKSB7XG4gICAgICAgICAgICAgIG1lbW9pemVkID0gQ29tcG9uZW50KHsgLi4uQ29tcG9uZW50LmRlZmF1bHRQcm9wcywgLi4ucHJvcHMgfSwgLi4uYXJncyk7XG4gICAgICAgICAgICAgIHByZXZQcm9wcyA9IHByb3BzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB3cmFwcGVkQ29tcG9uZW50LFxuICAgICAgICAgIENvbXBvbmVudCxcbiAgICAgICAgICB7IGRpc3BsYXlOYW1lOiBhZGFwdGVyLmRpc3BsYXlOYW1lT2ZOb2RlKHsgdHlwZTogQ29tcG9uZW50IH0pIH0sXG4gICAgICAgICk7XG4gICAgICAgIGxhc3RDb21wb25lbnQgPSBDb21wb25lbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gd3JhcHBlZENvbXBvbmVudDtcbiAgICB9O1xuXG4gICAgLy8gV3JhcCBmdW5jdGlvbmFsIGNvbXBvbmVudHMgb24gdmVyc2lvbnMgcHJpb3IgdG8gMTYuNSxcbiAgICAvLyB0byBhdm9pZCBpbmFkdmVydGVudGx5IHBhc3MgYSBgdGhpc2AgaW5zdGFuY2UgdG8gaXQuXG4gICAgY29uc3Qgd3JhcEZ1bmN0aW9uYWxDb21wb25lbnQgPSAoQ29tcG9uZW50KSA9PiB7XG4gICAgICBpZiAoaGFzKENvbXBvbmVudCwgJ2RlZmF1bHRQcm9wcycpKSB7XG4gICAgICAgIGlmIChsYXN0Q29tcG9uZW50ICE9PSBDb21wb25lbnQpIHtcbiAgICAgICAgICB3cmFwcGVkQ29tcG9uZW50ID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwXG4gICAgICAgICAgICAocHJvcHMsIC4uLmFyZ3MpID0+IENvbXBvbmVudCh7IC4uLkNvbXBvbmVudC5kZWZhdWx0UHJvcHMsIC4uLnByb3BzIH0sIC4uLmFyZ3MpLFxuICAgICAgICAgICAgQ29tcG9uZW50LFxuICAgICAgICAgICAgeyBkaXNwbGF5TmFtZTogYWRhcHRlci5kaXNwbGF5TmFtZU9mTm9kZSh7IHR5cGU6IENvbXBvbmVudCB9KSB9LFxuICAgICAgICAgICk7XG4gICAgICAgICAgbGFzdENvbXBvbmVudCA9IENvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd3JhcHBlZENvbXBvbmVudDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbXBvbmVudDtcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyRWxlbWVudCA9IChlbENvbmZpZywgLi4ucmVzdCkgPT4ge1xuICAgICAgY29uc3QgcmVuZGVyZWRFbCA9IHJlbmRlcmVyLnJlbmRlcihlbENvbmZpZywgLi4ucmVzdCk7XG5cbiAgICAgIGNvbnN0IHR5cGVJc0V4aXN0ZWQgPSAhIShyZW5kZXJlZEVsICYmIHJlbmRlcmVkRWwudHlwZSk7XG4gICAgICBpZiAodHlwZUlzRXhpc3RlZCkge1xuICAgICAgICBjb25zdCBjbG9uZWRFbCA9IGNoZWNrSXNTdXNwZW5zZUFuZENsb25lRWxlbWVudChyZW5kZXJlZEVsLCB7IHN1c3BlbnNlRmFsbGJhY2sgfSk7XG5cbiAgICAgICAgY29uc3QgZWxlbWVudElzQ2hhbmdlZCA9IGNsb25lZEVsLnR5cGUgIT09IHJlbmRlcmVkRWwudHlwZTtcbiAgICAgICAgaWYgKGVsZW1lbnRJc0NoYW5nZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVuZGVyZXIucmVuZGVyKHsgLi4uZWxDb25maWcsIHR5cGU6IGNsb25lZEVsLnR5cGUgfSwgLi4ucmVzdCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlbmRlcmVkRWw7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgICAgIHJlbmRlcihlbCwgdW5tYXNrZWRDb250ZXh0LCB7XG4gICAgICAgIHByb3ZpZGVyVmFsdWVzID0gbmV3IE1hcCgpLFxuICAgICAgfSA9IHt9KSB7XG4gICAgICAgIGNhY2hlZE5vZGUgPSBlbDtcbiAgICAgICAgaWYgKHR5cGVvZiBlbC50eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlzRE9NID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0NvbnRleHRQcm92aWRlcihlbCkpIHtcbiAgICAgICAgICBwcm92aWRlclZhbHVlcy5zZXQoZWwudHlwZSwgZWwucHJvcHMudmFsdWUpO1xuICAgICAgICAgIGNvbnN0IE1vY2tQcm92aWRlciA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAocHJvcHMpID0+IHByb3BzLmNoaWxkcmVuLFxuICAgICAgICAgICAgZWwudHlwZSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB3aXRoU2V0U3RhdGVBbGxvd2VkKCgpID0+IHJlbmRlckVsZW1lbnQoeyAuLi5lbCwgdHlwZTogTW9ja1Byb3ZpZGVyIH0pKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0NvbnRleHRDb25zdW1lcihlbCkpIHtcbiAgICAgICAgICBjb25zdCBQcm92aWRlciA9IGFkYXB0ZXIuZ2V0UHJvdmlkZXJGcm9tQ29uc3VtZXIoZWwudHlwZSk7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBwcm92aWRlclZhbHVlcy5oYXMoUHJvdmlkZXIpXG4gICAgICAgICAgICA/IHByb3ZpZGVyVmFsdWVzLmdldChQcm92aWRlcilcbiAgICAgICAgICAgIDogZ2V0UHJvdmlkZXJEZWZhdWx0VmFsdWUoUHJvdmlkZXIpO1xuICAgICAgICAgIGNvbnN0IE1vY2tDb25zdW1lciA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAocHJvcHMpID0+IHByb3BzLmNoaWxkcmVuKHZhbHVlKSxcbiAgICAgICAgICAgIGVsLnR5cGUsXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gd2l0aFNldFN0YXRlQWxsb3dlZCgoKSA9PiByZW5kZXJFbGVtZW50KHsgLi4uZWwsIHR5cGU6IE1vY2tDb25zdW1lciB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNET00gPSBmYWxzZTtcbiAgICAgICAgICBsZXQgcmVuZGVyZWRFbCA9IGVsO1xuICAgICAgICAgIGlmIChpc0xhenkocmVuZGVyZWRFbCkpIHtcbiAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcignYFJlYWN0LmxhenlgIGlzIG5vdCBzdXBwb3J0ZWQgYnkgc2hhbGxvdyByZW5kZXJpbmcuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVuZGVyZWRFbCA9IGNoZWNrSXNTdXNwZW5zZUFuZENsb25lRWxlbWVudChyZW5kZXJlZEVsLCB7IHN1c3BlbnNlRmFsbGJhY2sgfSk7XG4gICAgICAgICAgY29uc3QgeyB0eXBlOiBDb21wb25lbnQgfSA9IHJlbmRlcmVkRWw7XG5cbiAgICAgICAgICBjb25zdCBjb250ZXh0ID0gZ2V0TWFza2VkQ29udGV4dChDb21wb25lbnQuY29udGV4dFR5cGVzLCB1bm1hc2tlZENvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGlzTWVtbyhlbC50eXBlKSkge1xuICAgICAgICAgICAgY29uc3QgeyB0eXBlOiBJbm5lckNvbXAsIGNvbXBhcmUgfSA9IGVsLnR5cGU7XG5cbiAgICAgICAgICAgIHJldHVybiB3aXRoU2V0U3RhdGVBbGxvd2VkKCgpID0+IHJlbmRlckVsZW1lbnQoXG4gICAgICAgICAgICAgIHsgLi4uZWwsIHR5cGU6IHdyYXBQdXJlQ29tcG9uZW50KElubmVyQ29tcCwgY29tcGFyZSkgfSxcbiAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGlzQ29tcG9uZW50U3RhdGVmdWwgPSBpc1N0YXRlZnVsKENvbXBvbmVudCk7XG5cbiAgICAgICAgICBpZiAoIWlzQ29tcG9uZW50U3RhdGVmdWwgJiYgdHlwZW9mIENvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIHdpdGhTZXRTdGF0ZUFsbG93ZWQoKCkgPT4gcmVuZGVyRWxlbWVudChcbiAgICAgICAgICAgICAgeyAuLi5yZW5kZXJlZEVsLCB0eXBlOiB3cmFwRnVuY3Rpb25hbENvbXBvbmVudChDb21wb25lbnQpIH0sXG4gICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNDb21wb25lbnRTdGF0ZWZ1bCkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICByZW5kZXJlci5faW5zdGFuY2VcbiAgICAgICAgICAgICAgJiYgZWwucHJvcHMgPT09IHJlbmRlcmVyLl9pbnN0YW5jZS5wcm9wc1xuICAgICAgICAgICAgICAmJiAhc2hhbGxvd0VxdWFsKGNvbnRleHQsIHJlbmRlcmVyLl9pbnN0YW5jZS5jb250ZXh0KVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHsgcmVzdG9yZSB9ID0gc3B5TWV0aG9kKFxuICAgICAgICAgICAgICAgIHJlbmRlcmVyLFxuICAgICAgICAgICAgICAgICdfdXBkYXRlQ2xhc3NDb21wb25lbnQnLFxuICAgICAgICAgICAgICAgIChvcmlnaW5hbE1ldGhvZCkgPT4gZnVuY3Rpb24gX3VwZGF0ZUNsYXNzQ29tcG9uZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHsgcHJvcHMgfSA9IHJlbmRlcmVyLl9pbnN0YW5jZTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb25lZFByb3BzID0geyAuLi5wcm9wcyB9O1xuICAgICAgICAgICAgICAgICAgcmVuZGVyZXIuX2luc3RhbmNlLnByb3BzID0gY2xvbmVkUHJvcHM7XG5cbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9yaWdpbmFsTWV0aG9kLmFwcGx5KHJlbmRlcmVyLCBhcmdzKTtcblxuICAgICAgICAgICAgICAgICAgcmVuZGVyZXIuX2luc3RhbmNlLnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICAgICAgICByZXN0b3JlKCk7XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZml4IHJlYWN0IGJ1Zzsgc2VlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRFbXB0eVN0YXRlVmFsdWVgXG4gICAgICAgICAgICBjb25zdCBlbXB0eVN0YXRlVmFsdWUgPSBnZXRFbXB0eVN0YXRlVmFsdWUoKTtcbiAgICAgICAgICAgIGlmIChlbXB0eVN0YXRlVmFsdWUpIHtcbiAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbXBvbmVudC5wcm90b3R5cGUsICdzdGF0ZScsIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBlbXB0eVN0YXRlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzdGF0ZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHdpdGhTZXRTdGF0ZUFsbG93ZWQoKCkgPT4gcmVuZGVyRWxlbWVudChyZW5kZXJlZEVsLCBjb250ZXh0KSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1bm1vdW50KCkge1xuICAgICAgICByZW5kZXJlci51bm1vdW50KCk7XG4gICAgICB9LFxuICAgICAgZ2V0Tm9kZSgpIHtcbiAgICAgICAgaWYgKGlzRE9NKSB7XG4gICAgICAgICAgcmV0dXJuIGVsZW1lbnRUb1RyZWUoY2FjaGVkTm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gcmVuZGVyZXIuZ2V0UmVuZGVyT3V0cHV0KCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbm9kZVR5cGU6IG5vZGVUeXBlRnJvbVR5cGUoY2FjaGVkTm9kZS50eXBlKSxcbiAgICAgICAgICB0eXBlOiBjYWNoZWROb2RlLnR5cGUsXG4gICAgICAgICAgcHJvcHM6IGNhY2hlZE5vZGUucHJvcHMsXG4gICAgICAgICAga2V5OiBlbnN1cmVLZXlPclVuZGVmaW5lZChjYWNoZWROb2RlLmtleSksXG4gICAgICAgICAgcmVmOiBjYWNoZWROb2RlLnJlZixcbiAgICAgICAgICBpbnN0YW5jZTogcmVuZGVyZXIuX2luc3RhbmNlLFxuICAgICAgICAgIHJlbmRlcmVkOiBBcnJheS5pc0FycmF5KG91dHB1dClcbiAgICAgICAgICAgID8gZmxhdHRlbihvdXRwdXQpLm1hcCgoZWwpID0+IGVsZW1lbnRUb1RyZWUoZWwpKVxuICAgICAgICAgICAgOiBlbGVtZW50VG9UcmVlKG91dHB1dCksXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgc2ltdWxhdGVFcnJvcihub2RlSGllcmFyY2h5LCByb290Tm9kZSwgZXJyb3IpIHtcbiAgICAgICAgc2ltdWxhdGVFcnJvcihcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgICByZW5kZXJlci5faW5zdGFuY2UsXG4gICAgICAgICAgY2FjaGVkTm9kZSxcbiAgICAgICAgICBub2RlSGllcmFyY2h5LmNvbmNhdChjYWNoZWROb2RlKSxcbiAgICAgICAgICBub2RlVHlwZUZyb21UeXBlLFxuICAgICAgICAgIGFkYXB0ZXIuZGlzcGxheU5hbWVPZk5vZGUsXG4gICAgICAgICAgY2FjaGVkTm9kZS50eXBlLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIHNpbXVsYXRlRXZlbnQobm9kZSwgZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IG5vZGUucHJvcHNbcHJvcEZyb21FdmVudChldmVudCwgZXZlbnRPcHRpb25zKV07XG4gICAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgICAgd2l0aFNldFN0YXRlQWxsb3dlZCgoKSA9PiB7XG4gICAgICAgICAgICAvLyBUT0RPKGxtcik6IGNyZWF0ZS91c2Ugc3ludGhldGljIGV2ZW50c1xuICAgICAgICAgICAgLy8gVE9ETyhsbXIpOiBlbXVsYXRlIFJlYWN0J3MgZXZlbnQgcHJvcGFnYXRpb25cbiAgICAgICAgICAgIC8vIFJlYWN0RE9NLnVuc3RhYmxlX2JhdGNoZWRVcGRhdGVzKCgpID0+IHtcbiAgICAgICAgICAgIGhhbmRsZXIoLi4uYXJncyk7XG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGJhdGNoZWRVcGRhdGVzKGZuKSB7XG4gICAgICAgIHJldHVybiBmbigpO1xuICAgICAgICAvLyByZXR1cm4gUmVhY3RET00udW5zdGFibGVfYmF0Y2hlZFVwZGF0ZXMoZm4pO1xuICAgICAgfSxcbiAgICAgIGNoZWNrUHJvcFR5cGVzKHR5cGVTcGVjcywgdmFsdWVzLCBsb2NhdGlvbiwgaGllcmFyY2h5KSB7XG4gICAgICAgIHJldHVybiBjaGVja1Byb3BUeXBlcyhcbiAgICAgICAgICB0eXBlU3BlY3MsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGRpc3BsYXlOYW1lT2ZOb2RlKGNhY2hlZE5vZGUpLFxuICAgICAgICAgICgpID0+IGdldENvbXBvbmVudFN0YWNrKGhpZXJhcmNoeS5jb25jYXQoW2NhY2hlZE5vZGVdKSksXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBjcmVhdGVTdHJpbmdSZW5kZXJlcihvcHRpb25zKSB7XG4gICAgaWYgKGhhcyhvcHRpb25zLCAnc3VzcGVuc2VGYWxsYmFjaycpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdgc3VzcGVuc2VGYWxsYmFja2Agc2hvdWxkIG5vdCBiZSBzcGVjaWZpZWQgaW4gb3B0aW9ucyBvZiBzdHJpbmcgcmVuZGVyZXInKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbmRlcihlbCwgY29udGV4dCkge1xuICAgICAgICBpZiAob3B0aW9ucy5jb250ZXh0ICYmIChlbC50eXBlLmNvbnRleHRUeXBlcyB8fCBvcHRpb25zLmNoaWxkQ29udGV4dFR5cGVzKSkge1xuICAgICAgICAgIGNvbnN0IGNoaWxkQ29udGV4dFR5cGVzID0ge1xuICAgICAgICAgICAgLi4uKGVsLnR5cGUuY29udGV4dFR5cGVzIHx8IHt9KSxcbiAgICAgICAgICAgIC4uLm9wdGlvbnMuY2hpbGRDb250ZXh0VHlwZXMsXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb25zdCBDb250ZXh0V3JhcHBlciA9IGNyZWF0ZVJlbmRlcldyYXBwZXIoZWwsIGNvbnRleHQsIGNoaWxkQ29udGV4dFR5cGVzKTtcbiAgICAgICAgICByZXR1cm4gUmVhY3RET01TZXJ2ZXIucmVuZGVyVG9TdGF0aWNNYXJrdXAoUmVhY3QuY3JlYXRlRWxlbWVudChDb250ZXh0V3JhcHBlcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdERPTVNlcnZlci5yZW5kZXJUb1N0YXRpY01hcmt1cChlbCk7XG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICAvLyBQcm92aWRlZCBhIGJhZyBvZiBvcHRpb25zLCByZXR1cm4gYW4gYEVuenltZVJlbmRlcmVyYC4gU29tZSBvcHRpb25zIGNhbiBiZSBpbXBsZW1lbnRhdGlvblxuICAvLyBzcGVjaWZpYywgbGlrZSBgYXR0YWNoYCBldGMuIGZvciBSZWFjdCwgYnV0IG5vdCBwYXJ0IG9mIHRoaXMgaW50ZXJmYWNlIGV4cGxpY2l0bHkuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjbGFzcy1tZXRob2RzLXVzZS10aGlzXG4gIGNyZWF0ZVJlbmRlcmVyKG9wdGlvbnMpIHtcbiAgICBzd2l0Y2ggKG9wdGlvbnMubW9kZSkge1xuICAgICAgY2FzZSBFbnp5bWVBZGFwdGVyLk1PREVTLk1PVU5UOiByZXR1cm4gdGhpcy5jcmVhdGVNb3VudFJlbmRlcmVyKG9wdGlvbnMpO1xuICAgICAgY2FzZSBFbnp5bWVBZGFwdGVyLk1PREVTLlNIQUxMT1c6IHJldHVybiB0aGlzLmNyZWF0ZVNoYWxsb3dSZW5kZXJlcihvcHRpb25zKTtcbiAgICAgIGNhc2UgRW56eW1lQWRhcHRlci5NT0RFUy5TVFJJTkc6IHJldHVybiB0aGlzLmNyZWF0ZVN0cmluZ1JlbmRlcmVyKG9wdGlvbnMpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbnp5bWUgSW50ZXJuYWwgRXJyb3I6IFVucmVjb2duaXplZCBtb2RlOiAke29wdGlvbnMubW9kZX1gKTtcbiAgICB9XG4gIH1cblxuICB3cmFwKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gd3JhcChlbGVtZW50KTtcbiAgfVxuXG4gIC8vIGNvbnZlcnRzIGFuIFJTVE5vZGUgdG8gdGhlIGNvcnJlc3BvbmRpbmcgSlNYIFByYWdtYSBFbGVtZW50LiBUaGlzIHdpbGwgYmUgbmVlZGVkXG4gIC8vIGluIG9yZGVyIHRvIGltcGxlbWVudCB0aGUgYFdyYXBwZXIubW91bnQoKWAgYW5kIGBXcmFwcGVyLnNoYWxsb3coKWAgbWV0aG9kcywgYnV0IHNob3VsZFxuICAvLyBiZSBwcmV0dHkgc3RyYWlnaHRmb3J3YXJkIGZvciBwZW9wbGUgdG8gaW1wbGVtZW50LlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2xhc3MtbWV0aG9kcy11c2UtdGhpc1xuICBub2RlVG9FbGVtZW50KG5vZGUpIHtcbiAgICBpZiAoIW5vZGUgfHwgdHlwZW9mIG5vZGUgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB7IHR5cGUgfSA9IG5vZGU7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQodW5tZW1vVHlwZSh0eXBlKSwgcHJvcHNXaXRoS2V5c0FuZFJlZihub2RlKSk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2xhc3MtbWV0aG9kcy11c2UtdGhpc1xuICBtYXRjaGVzRWxlbWVudFR5cGUobm9kZSwgbWF0Y2hpbmdUeXBlKSB7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgY29uc3QgeyB0eXBlIH0gPSBub2RlO1xuICAgIHJldHVybiB1bm1lbW9UeXBlKHR5cGUpID09PSB1bm1lbW9UeXBlKG1hdGNoaW5nVHlwZSk7XG4gIH1cblxuICBlbGVtZW50VG9Ob2RlKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudFRvVHJlZShlbGVtZW50KTtcbiAgfVxuXG4gIG5vZGVUb0hvc3ROb2RlKG5vZGUsIHN1cHBvcnRzQXJyYXkgPSBmYWxzZSkge1xuICAgIGNvbnN0IG5vZGVzID0gbm9kZVRvSG9zdE5vZGUobm9kZSk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZXMpICYmICFzdXBwb3J0c0FycmF5KSB7XG4gICAgICByZXR1cm4gbm9kZXNbMF07XG4gICAgfVxuICAgIHJldHVybiBub2RlcztcbiAgfVxuXG4gIGRpc3BsYXlOYW1lT2ZOb2RlKG5vZGUpIHtcbiAgICBpZiAoIW5vZGUpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHsgdHlwZSwgJCR0eXBlb2YgfSA9IG5vZGU7XG4gICAgY29uc3QgYWRhcHRlciA9IHRoaXM7XG5cbiAgICBjb25zdCBub2RlVHlwZSA9IHR5cGUgfHwgJCR0eXBlb2Y7XG5cbiAgICAvLyBuZXdlciBub2RlIHR5cGVzIG1heSBiZSB1bmRlZmluZWQsIHNvIG9ubHkgdGVzdCBpZiB0aGUgbm9kZVR5cGUgZXhpc3RzXG4gICAgaWYgKG5vZGVUeXBlKSB7XG4gICAgICBzd2l0Y2ggKG5vZGVUeXBlKSB7XG4gICAgICAgIGNhc2UgQ29uY3VycmVudE1vZGUgfHwgTmFOOiByZXR1cm4gJ0NvbmN1cnJlbnRNb2RlJztcbiAgICAgICAgY2FzZSBGcmFnbWVudCB8fCBOYU46IHJldHVybiAnRnJhZ21lbnQnO1xuICAgICAgICBjYXNlIFN0cmljdE1vZGUgfHwgTmFOOiByZXR1cm4gJ1N0cmljdE1vZGUnO1xuICAgICAgICBjYXNlIFByb2ZpbGVyIHx8IE5hTjogcmV0dXJuICdQcm9maWxlcic7XG4gICAgICAgIGNhc2UgUG9ydGFsIHx8IE5hTjogcmV0dXJuICdQb3J0YWwnO1xuICAgICAgICBjYXNlIFN1c3BlbnNlIHx8IE5hTjogcmV0dXJuICdTdXNwZW5zZSc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgJCR0eXBlb2ZUeXBlID0gdHlwZSAmJiB0eXBlLiQkdHlwZW9mO1xuXG4gICAgc3dpdGNoICgkJHR5cGVvZlR5cGUpIHtcbiAgICAgIGNhc2UgQ29udGV4dENvbnN1bWVyIHx8IE5hTjogcmV0dXJuICdDb250ZXh0Q29uc3VtZXInO1xuICAgICAgY2FzZSBDb250ZXh0UHJvdmlkZXIgfHwgTmFOOiByZXR1cm4gJ0NvbnRleHRQcm92aWRlcic7XG4gICAgICBjYXNlIE1lbW8gfHwgTmFOOiB7XG4gICAgICAgIGNvbnN0IG5vZGVOYW1lID0gZGlzcGxheU5hbWVPZk5vZGUobm9kZSk7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygbm9kZU5hbWUgPT09ICdzdHJpbmcnID8gbm9kZU5hbWUgOiBgTWVtbygke2FkYXB0ZXIuZGlzcGxheU5hbWVPZk5vZGUodHlwZSl9KWA7XG4gICAgICB9XG4gICAgICBjYXNlIEZvcndhcmRSZWYgfHwgTmFOOiB7XG4gICAgICAgIGlmICh0eXBlLmRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHR5cGUuZGlzcGxheU5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZSA9IGFkYXB0ZXIuZGlzcGxheU5hbWVPZk5vZGUoeyB0eXBlOiB0eXBlLnJlbmRlciB9KTtcbiAgICAgICAgcmV0dXJuIG5hbWUgPyBgRm9yd2FyZFJlZigke25hbWV9KWAgOiAnRm9yd2FyZFJlZic7XG4gICAgICB9XG4gICAgICBjYXNlIExhenkgfHwgTmFOOiB7XG4gICAgICAgIHJldHVybiAnbGF6eSc7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiByZXR1cm4gZGlzcGxheU5hbWVPZk5vZGUobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgaXNWYWxpZEVsZW1lbnQoZWxlbWVudCkge1xuICAgIHJldHVybiBpc0VsZW1lbnQoZWxlbWVudCk7XG4gIH1cblxuICBpc1ZhbGlkRWxlbWVudFR5cGUob2JqZWN0KSB7XG4gICAgcmV0dXJuICEhb2JqZWN0ICYmIGlzVmFsaWRFbGVtZW50VHlwZShvYmplY3QpO1xuICB9XG5cbiAgaXNGcmFnbWVudChmcmFnbWVudCkge1xuICAgIHJldHVybiB0eXBlT2ZOb2RlKGZyYWdtZW50KSA9PT0gRnJhZ21lbnQ7XG4gIH1cblxuICBpc0N1c3RvbUNvbXBvbmVudCh0eXBlKSB7XG4gICAgY29uc3QgZmFrZUVsZW1lbnQgPSBtYWtlRmFrZUVsZW1lbnQodHlwZSk7XG4gICAgcmV0dXJuICEhdHlwZSAmJiAoXG4gICAgICB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgfHwgaXNGb3J3YXJkUmVmKGZha2VFbGVtZW50KVxuICAgICAgfHwgaXNDb250ZXh0UHJvdmlkZXIoZmFrZUVsZW1lbnQpXG4gICAgICB8fCBpc0NvbnRleHRDb25zdW1lcihmYWtlRWxlbWVudClcbiAgICAgIHx8IGlzU3VzcGVuc2UoZmFrZUVsZW1lbnQpXG4gICAgKTtcbiAgfVxuXG4gIGlzQ29udGV4dENvbnN1bWVyKHR5cGUpIHtcbiAgICByZXR1cm4gISF0eXBlICYmIGlzQ29udGV4dENvbnN1bWVyKG1ha2VGYWtlRWxlbWVudCh0eXBlKSk7XG4gIH1cblxuICBpc0N1c3RvbUNvbXBvbmVudEVsZW1lbnQoaW5zdCkge1xuICAgIGlmICghaW5zdCB8fCAhdGhpcy5pc1ZhbGlkRWxlbWVudChpbnN0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pc0N1c3RvbUNvbXBvbmVudChpbnN0LnR5cGUpO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJGcm9tQ29uc3VtZXIoQ29uc3VtZXIpIHtcbiAgICAvLyBSZWFjdCBzdG9yZXMgcmVmZXJlbmNlcyB0byB0aGUgUHJvdmlkZXIgb24gYSBDb25zdW1lciBkaWZmZXJlbnRseSBhY3Jvc3MgdmVyc2lvbnMuXG4gICAgaWYgKENvbnN1bWVyKSB7XG4gICAgICBsZXQgUHJvdmlkZXI7XG4gICAgICBpZiAoQ29uc3VtZXIuX2NvbnRleHQpIHsgLy8gY2hlY2sgdGhpcyBmaXJzdCwgdG8gYXZvaWQgYSBkZXByZWNhdGlvbiB3YXJuaW5nXG4gICAgICAgICh7IFByb3ZpZGVyIH0gPSBDb25zdW1lci5fY29udGV4dCk7XG4gICAgICB9IGVsc2UgaWYgKENvbnN1bWVyLlByb3ZpZGVyKSB7XG4gICAgICAgICh7IFByb3ZpZGVyIH0gPSBDb25zdW1lcik7XG4gICAgICB9XG4gICAgICBpZiAoUHJvdmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb3ZpZGVyO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VuenltZSBJbnRlcm5hbCBFcnJvcjogY2Fu4oCZdCBmaWd1cmUgb3V0IGhvdyB0byBnZXQgUHJvdmlkZXIgZnJvbSBDb25zdW1lcicpO1xuICB9XG5cbiAgY3JlYXRlRWxlbWVudCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoLi4uYXJncyk7XG4gIH1cblxuICB3cmFwV2l0aFdyYXBwaW5nQ29tcG9uZW50KG5vZGUsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgUm9vdEZpbmRlcixcbiAgICAgIG5vZGU6IHdyYXBXaXRoV3JhcHBpbmdDb21wb25lbnQoUmVhY3QuY3JlYXRlRWxlbWVudCwgbm9kZSwgb3B0aW9ucyksXG4gICAgfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0U2V2ZW50ZWVuQWRhcHRlcjtcbiJdfQ==
//# sourceMappingURL=ReactSeventeenAdapter.js.map