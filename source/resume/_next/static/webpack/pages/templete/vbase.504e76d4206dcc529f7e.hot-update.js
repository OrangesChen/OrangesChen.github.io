/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/templete/vbase",{

/***/ "./components/info-view.tsx":
/*!**********************************!*\
  !*** ./components/info-view.tsx ***!
  \**********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"InfoView\": function() { return /* binding */ InfoView; },\n/* harmony export */   \"TagsView\": function() { return /* binding */ TagsView; },\n/* harmony export */   \"SkillView\": function() { return /* binding */ SkillView; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _titile_view__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./titile-view */ \"./components/titile-view.tsx\");\n/* module decorator */ module = __webpack_require__.hmd(module);\n\n\nvar _jsxFileName = \"/Users/cfq/Workspace/Resume/components/info-view.tsx\",\n    _this = undefined;\n\n\n\nvar InfoView = function InfoView(props) {\n  return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n    className: \"ml-5 mt-4\",\n    children: props.infoList.map(function (info) {\n      return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"flex flex-row text-gray-500 font-light mb-1 text-sm\",\n        children: [/*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n          className: \"\",\n          children: [info.name, \"\\uFF1A\"]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 25,\n          columnNumber: 21\n        }, _this), info.type && /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"a\", {\n          href: (info.type === 'link' ? '' : info.type + ':') + info.content,\n          target: \"_blank\",\n          children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"\",\n            style: info.color && {\n              color: info.color\n            },\n            children: info.content\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 27,\n            columnNumber: 25\n          }, _this)\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 26,\n          columnNumber: 35\n        }, _this), !info.type && /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n          className: \"\",\n          children: info.content\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 31,\n          columnNumber: 36\n        }, _this)]\n      }, info.key, true, {\n        fileName: _jsxFileName,\n        lineNumber: 24,\n        columnNumber: 17\n      }, _this);\n    })\n  }, void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 22,\n    columnNumber: 9\n  }, _this);\n};\n_c = InfoView;\nvar TagsView = function TagsView(props) {\n  return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n    className: \"grid grid-flow-col grid-rows-3 grid-cols-3 gap-6 ml-16\",\n    children: props.tags.map(function (tag, index) {\n      return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"transform scale-110 -rotate-6 translate-x-10 text-gray-400\",\n        children: tag\n      }, 'tag' + index, false, {\n        fileName: _jsxFileName,\n        lineNumber: 44,\n        columnNumber: 17\n      }, _this);\n    })\n  }, void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 42,\n    columnNumber: 9\n  }, _this);\n};\n_c2 = TagsView;\nvar SkillView = function SkillView(props) {\n  return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n    className: \"flex flex-col mr-14 mb-6\",\n    children: props.skill.map(function (s, index) {\n      return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        children: [/*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_titile_view__WEBPACK_IMPORTED_MODULE_2__.TitileView, {\n          title: s.title,\n          type: s.infoType\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 55,\n          columnNumber: 21\n        }, _this), /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n          className: \"mt-3\",\n          children: s.fields.map(function (val, index) {\n            return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n              className: \"flex flex-row\",\n              children: [/*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                className: \"h-1 w-1 rounded-full bg-gray-500 self-center\"\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 59,\n                columnNumber: 33\n              }, _this), /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                className: \"ml-2 text-gray-500 text-sm mt-1 font-mono\",\n                children: val\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 60,\n                columnNumber: 33\n              }, _this)]\n            }, 'field' + index, true, {\n              fileName: _jsxFileName,\n              lineNumber: 58,\n              columnNumber: 29\n            }, _this);\n          })\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 56,\n          columnNumber: 21\n        }, _this)]\n      }, 'skill' + index, true, {\n        fileName: _jsxFileName,\n        lineNumber: 54,\n        columnNumber: 17\n      }, _this);\n    })\n  }, void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 52,\n    columnNumber: 9\n  }, _this);\n};\n_c3 = SkillView;\n\nvar _c, _c2, _c3;\n\n$RefreshReg$(_c, \"InfoView\");\n$RefreshReg$(_c2, \"TagsView\");\n$RefreshReg$(_c3, \"SkillView\");\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vY29tcG9uZW50cy9pbmZvLXZpZXcudHN4PzQ1YjAiXSwibmFtZXMiOlsiSW5mb1ZpZXciLCJwcm9wcyIsImluZm9MaXN0IiwibWFwIiwiaW5mbyIsIm5hbWUiLCJ0eXBlIiwiY29udGVudCIsImNvbG9yIiwia2V5IiwiVGFnc1ZpZXciLCJ0YWdzIiwidGFnIiwiaW5kZXgiLCJTa2lsbFZpZXciLCJza2lsbCIsInMiLCJ0aXRsZSIsImluZm9UeXBlIiwiZmllbGRzIiwidmFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFrQk8sSUFBTUEsUUFBUSxHQUFHLFNBQVhBLFFBQVcsQ0FBQ0MsS0FBRCxFQUFpQztBQUNyRCxzQkFDSTtBQUFLLGFBQVMsRUFBQyxXQUFmO0FBQUEsY0FDS0EsS0FBSyxDQUFDQyxRQUFOLENBQWVDLEdBQWYsQ0FBbUIsVUFBQUMsSUFBSTtBQUFBLDBCQUNwQjtBQUFLLGlCQUFTLEVBQUMscURBQWY7QUFBQSxnQ0FDSTtBQUFLLG1CQUFTLEVBQUMsRUFBZjtBQUFBLHFCQUFtQkEsSUFBSSxDQUFDQyxJQUF4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBREosRUFFS0QsSUFBSSxDQUFDRSxJQUFMLGlCQUFhO0FBQUcsY0FBSSxFQUFFLENBQUNGLElBQUksQ0FBQ0UsSUFBTCxLQUFjLE1BQWQsR0FBdUIsRUFBdkIsR0FBNEJGLElBQUksQ0FBQ0UsSUFBTCxHQUFZLEdBQXpDLElBQWdERixJQUFJLENBQUNHLE9BQTlEO0FBQXVFLGdCQUFNLEVBQUMsUUFBOUU7QUFBQSxpQ0FDVjtBQUFLLHFCQUFTLEVBQUMsRUFBZjtBQUFrQixpQkFBSyxFQUFFSCxJQUFJLENBQUNJLEtBQUwsSUFBYztBQUFFQSxtQkFBSyxFQUFFSixJQUFJLENBQUNJO0FBQWQsYUFBdkM7QUFBQSxzQkFDS0osSUFBSSxDQUFDRztBQURWO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFEVTtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUZsQixFQU9LLENBQUNILElBQUksQ0FBQ0UsSUFBTixpQkFBYztBQUFLLG1CQUFTLEVBQUMsRUFBZjtBQUFBLG9CQUNWRixJQUFJLENBQUNHO0FBREs7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFQbkI7QUFBQSxTQUEwRUgsSUFBSSxDQUFDSyxHQUEvRTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBRG9CO0FBQUEsS0FBdkI7QUFETDtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBREo7QUFpQkgsQ0FsQk07S0FBTVQsUTtBQW9CTixJQUFNVSxRQUFRLEdBQUcsU0FBWEEsUUFBVyxDQUFDVCxLQUFELEVBQStCO0FBQ25ELHNCQUNJO0FBQUssYUFBUyxFQUFDLHdEQUFmO0FBQUEsY0FDS0EsS0FBSyxDQUFDVSxJQUFOLENBQVdSLEdBQVgsQ0FBZSxVQUFDUyxHQUFELEVBQU1DLEtBQU47QUFBQSwwQkFDWjtBQUFLLGlCQUFTLEVBQUMsNERBQWY7QUFBQSxrQkFBaUdEO0FBQWpHLFNBQWlGLFFBQVFDLEtBQXpGO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFEWTtBQUFBLEtBQWY7QUFETDtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBREo7QUFPSCxDQVJNO01BQU1ILFE7QUFVTixJQUFNSSxTQUFTLEdBQUcsU0FBWkEsU0FBWSxDQUFDYixLQUFELEVBQXVCO0FBQzVDLHNCQUNJO0FBQUssYUFBUyxFQUFDLDBCQUFmO0FBQUEsY0FDS0EsS0FBSyxDQUFDYyxLQUFOLENBQVlaLEdBQVosQ0FBZ0IsVUFBQ2EsQ0FBRCxFQUFJSCxLQUFKO0FBQUEsMEJBQ2I7QUFBQSxnQ0FDSSw4REFBQyxvREFBRDtBQUFZLGVBQUssRUFBRUcsQ0FBQyxDQUFDQyxLQUFyQjtBQUE0QixjQUFJLEVBQUVELENBQUMsQ0FBQ0U7QUFBcEM7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFESixlQUVJO0FBQUssbUJBQVMsRUFBQyxNQUFmO0FBQUEsb0JBQ0tGLENBQUMsQ0FBQ0csTUFBRixDQUFTaEIsR0FBVCxDQUFhLFVBQUNpQixHQUFELEVBQU1QLEtBQU47QUFBQSxnQ0FDVjtBQUFLLHVCQUFTLEVBQUMsZUFBZjtBQUFBLHNDQUNJO0FBQU0seUJBQVMsRUFBQztBQUFoQjtBQUFBO0FBQUE7QUFBQTtBQUFBLHVCQURKLGVBRUk7QUFBTSx5QkFBUyxFQUFDLDJDQUFoQjtBQUFBLDBCQUE2RE87QUFBN0Q7QUFBQTtBQUFBO0FBQUE7QUFBQSx1QkFGSjtBQUFBLGVBQW9DLFVBQVVQLEtBQTlDO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBRFU7QUFBQSxXQUFiO0FBREw7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFGSjtBQUFBLFNBQVUsVUFBVUEsS0FBcEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQURhO0FBQUEsS0FBaEI7QUFETDtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBREo7QUFpQkgsQ0FsQk07TUFBTUMsUyIsImZpbGUiOiIuL2NvbXBvbmVudHMvaW5mby12aWV3LnRzeC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBJbmZvVHlwZSwgVGl0aWxlVmlldyB9IGZyb20gJy4vdGl0aWxlLXZpZXcnO1xuZXhwb3J0IGludGVyZmFjZSBJbmZvIHtcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgY29udGVudDogc3RyaW5nLFxuICAgIGtleTogc3RyaW5nLFxuICAgIHR5cGU/OiBzdHJpbmcsXG4gICAgY29sb3I/OiBzdHJpbmcsXG59XG5leHBvcnQgaW50ZXJmYWNlIFNraWxsUHJvcHMge1xuICAgIHNraWxsOiBTa2lsbFtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2tpbGwge1xuICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgaW5mb1R5cGU6IEluZm9UeXBlLFxuICAgIGZpZWxkczogc3RyaW5nW11cbn1cblxuZXhwb3J0IGNvbnN0IEluZm9WaWV3ID0gKHByb3BzOiB7IGluZm9MaXN0OiBJbmZvW10gfSkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdtbC01IG10LTQnPlxuICAgICAgICAgICAge3Byb3BzLmluZm9MaXN0Lm1hcChpbmZvID0+IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nZmxleCBmbGV4LXJvdyB0ZXh0LWdyYXktNTAwIGZvbnQtbGlnaHQgbWItMSB0ZXh0LXNtJyBrZXk9e2luZm8ua2V5fT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9Jyc+e2luZm8ubmFtZX3vvJo8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge2luZm8udHlwZSAmJiA8YSBocmVmPXsoaW5mby50eXBlID09PSAnbGluaycgPyAnJyA6IGluZm8udHlwZSArICc6JykgKyBpbmZvLmNvbnRlbnR9IHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9Jycgc3R5bGU9e2luZm8uY29sb3IgJiYgeyBjb2xvcjogaW5mby5jb2xvciB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aW5mby5jb250ZW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvYT59XG4gICAgICAgICAgICAgICAgICAgIHshaW5mby50eXBlICYmIDxkaXYgY2xhc3NOYW1lPScnPlxuICAgICAgICAgICAgICAgICAgICAgICAge2luZm8uY29udGVudH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgIClcbn1cblxuZXhwb3J0IGNvbnN0IFRhZ3NWaWV3ID0gKHByb3BzOiB7IHRhZ3M6IHN0cmluZ1tdIH0pID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1mbG93LWNvbCBncmlkLXJvd3MtMyBncmlkLWNvbHMtMyBnYXAtNiBtbC0xNlwiPlxuICAgICAgICAgICAge3Byb3BzLnRhZ3MubWFwKCh0YWcsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0cmFuc2Zvcm0gc2NhbGUtMTEwIC1yb3RhdGUtNiB0cmFuc2xhdGUteC0xMCB0ZXh0LWdyYXktNDAwXCIga2V5PXsndGFnJyArIGluZGV4fT57dGFnfTwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgIClcbn1cblxuZXhwb3J0IGNvbnN0IFNraWxsVmlldyA9IChwcm9wczogU2tpbGxQcm9wcykgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdmbGV4IGZsZXgtY29sIG1yLTE0IG1iLTYnPlxuICAgICAgICAgICAge3Byb3BzLnNraWxsLm1hcCgocywgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8ZGl2IGtleT17J3NraWxsJyArIGluZGV4fT5cbiAgICAgICAgICAgICAgICAgICAgPFRpdGlsZVZpZXcgdGl0bGU9e3MudGl0bGV9IHR5cGU9e3MuaW5mb1R5cGV9PjwvVGl0aWxlVmlldz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J210LTMnPlxuICAgICAgICAgICAgICAgICAgICAgICAge3MuZmllbGRzLm1hcCgodmFsLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdmbGV4IGZsZXgtcm93JyBrZXk9eydmaWVsZCcgKyBpbmRleH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0naC0xIHctMSByb3VuZGVkLWZ1bGwgYmctZ3JheS01MDAgc2VsZi1jZW50ZXInPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdtbC0yIHRleHQtZ3JheS01MDAgdGV4dC1zbSBtdC0xIGZvbnQtbW9ubyc+e3ZhbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgKVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./components/info-view.tsx\n");

/***/ })

});