var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};

// packages/LXReact/dist/index.js
__markAsModule(exports);
__export(exports, {
  default: () => LXReact_default
});
var __defProp2 = Object.defineProperty;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
var __assign = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export2 = (target, all) => {
  for (var name in all)
    __defProp2(target, name, {get: all[name], enumerable: true});
};
var LXReact_exports = {};
__export2(LXReact_exports, {
  Fragment: () => Fragment,
  LXComponent: () => LXComponent,
  LXPurComponent: () => LXPurComponent,
  createLXContext: () => createLXContext,
  createLXRef: () => createLXRef,
  lxCreateElement: () => lxCreateElement,
  useLXState: () => useLXState
});
var PhaseEnum;
(function(PhaseEnum2) {
  PhaseEnum2["INIT"] = "init";
  PhaseEnum2["UPDATE"] = "update";
  PhaseEnum2["COMMIT"] = "commit";
  PhaseEnum2["FREE"] = "free";
})(PhaseEnum || (PhaseEnum = {}));
var HooksName = {
  STATE: "state"
};
var LXComponentAbstract = class {
  constructor(props) {
    this.props = props;
    this.setState.bind(this);
  }
  forceUpdate() {
  }
  setState(state) {
    this.state = __assign(__assign({}, this.state), state);
    this.forceUpdate();
  }
  componentWillMount() {
  }
  componentDidMount() {
  }
  componentWillReceiveProps(nextProps) {
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUpdate() {
  }
  componentDidUpdate() {
  }
};
LXComponentAbstract.isComponent = true;
var LXContextComponent = class extends LXComponentAbstract {
};
var CustomComponent = {
  Fragment: "Fragment",
  Provider: "Provider",
  Consumer: "Consumer"
};
function lxCreateElement(elementType, props, ...children) {
  const formatChildren = (child = []) => {
    return child.map((item, index) => {
      if (typeof item === "string" || typeof item === "number") {
        return {
          component: "text",
          children: [],
          props: {__value: item},
          name: "text",
          key: null,
          ref: null
        };
      }
      if (Array.isArray(item)) {
        item.forEach((itemChild, childIndex) => {
          itemChild.key = itemChild.key || `${index}-${childIndex}`;
        });
      }
      item.key = item.key || index;
      return item;
    });
  };
  const finalProps = props || {};
  const key = (finalProps == null ? void 0 : finalProps.key) || null;
  const ref = (finalProps == null ? void 0 : finalProps.ref) || null;
  delete finalProps["key"];
  const element = {
    component: elementType,
    props: finalProps,
    children: formatChildren(children).flat(),
    name: typeof elementType === "function" ? elementType.name : elementType,
    key,
    ref
  };
  return element;
}
var createLXContext = () => {
  const id = Symbol("lxContext");
  class Provider extends LXContextComponent {
    render() {
      return lxCreateElement(CustomComponent.Fragment, null, this.props.children);
    }
  }
  Provider.contextId = id;
  class Consumer extends LXContextComponent {
    render() {
      const {children, value} = this.props;
      return lxCreateElement(CustomComponent.Fragment, null, children[0](value));
    }
  }
  Consumer.contextId = id;
  return {
    Provider,
    Consumer
  };
};
var LXComponent = class extends LXComponentAbstract {
  render() {
  }
};
var LXPurComponent = class extends LXComponent {
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  render() {
  }
};
var Fragment = class extends LXComponent {
  render() {
    return lxCreateElement(CustomComponent.Fragment, null, this.props.children);
  }
};
function createLXRef() {
  return {
    current: null
  };
}
var LXShare = class {
  constructor() {
    this.state = {
      phase: PhaseEnum.INIT,
      hooksList: [],
      hooksIndex: 0
    };
  }
  setState(data) {
    if (Object.prototype.toString.call(data) !== "[object Object]") {
      throw Error("data must be a object");
    }
    this.state = __assign(__assign({}, this.state), data);
  }
  getState() {
    return this.state;
  }
};
var share = new LXShare();
var initHooks = {
  useLXState: (initState) => {
    let state = null;
    if (typeof initState === "function") {
      state = initState();
    } else {
      state = initState;
    }
    const hook = {
      name: HooksName.STATE,
      state,
      setState: null
    };
    const setState = (newState) => {
      hook.state = newState;
    };
    hook.setState = setState;
    const {hooksIndex, hooksList} = share.getState();
    const newList = [...hooksList];
    newList.push(hook);
    share.setState({
      hooksList: newList,
      hooksIndex: hooksIndex + 1
    });
    return [state, setState];
  }
};
var updateHooks = {
  useLXState: (_unused) => {
    const {hooksIndex, hooksList} = share.getState();
    const hook = hooksList[hooksIndex];
    if (hook.name !== HooksName.STATE) {
      throw Error("hooks must be used in top function");
    }
    share.setState({
      hooksIndex: hooksIndex + 1
    });
    return [
      hook.state,
      hook.setState
    ];
  }
};
function useHook(name) {
  return (...rest) => {
    const {phase} = share.getState();
    if (phase === PhaseEnum.INIT) {
      return initHooks[name].apply(null, rest);
    }
    return updateHooks[name].apply(null, rest);
  };
}
var hooks = {
  useLXState: useHook("useLXState")
};
var {useLXState} = hooks;
var LXReact_default = LXReact_exports;
