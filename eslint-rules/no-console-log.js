export default {
  meta: {
    type: "problem", // Can be "problem", "suggestion", or "layout"
    docs: {
      description: "Disallow the use of console.log",
      category: "Best Practices",
      recommended: false,
    },
    messages: {
      noConsoleLog: "Avoid using console.log in production code.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.object?.name === "console" &&
          node.callee.property?.name === "log"
        ) {
          context.report({
            node,
            messageId: "noConsoleLog",
          });
        }
      },
    };
  },
};
