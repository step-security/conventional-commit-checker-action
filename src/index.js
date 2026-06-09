import core from "@actions/core";
import github from "@actions/github";

const ESC = String.fromCharCode(27);
const c = {
  red: (s) => `${ESC}[31m${s}${ESC}[0m`,
  green: (s) => `${ESC}[32m${s}${ESC}[0m`,
  yellow: (s) => `${ESC}[33m${s}${ESC}[0m`,
  dim: (s) => `${ESC}[90m${s}${ESC}[0m`,
};

const DIVIDER = c.dim("─".repeat(88));

function checkTitle(titlePattern, titleText) {
  const matched = new RegExp(titlePattern).test(titleText);
  if (!matched) {
    throw new Error(
      [
        c.red("✗ PR title does not satisfy the required format."),
        DIVIDER,
        titleText,
        DIVIDER,
        `${c.yellow("Expected pattern:")} ${titlePattern}`,
      ].join("\n")
    );
  }
  core.info(
    [c.green("✓ PR title is valid."), DIVIDER, titleText, DIVIDER].join("\n")
  );
}

function checkBody(bodyPattern, bodyText) {
  const matched = new RegExp(bodyPattern).test(bodyText);
  if (!matched) {
    throw new Error(
      [
        c.red("✗ PR body does not satisfy the required format."),
        DIVIDER,
        bodyText,
        DIVIDER,
        `${c.yellow("Expected pattern:")} ${bodyPattern}`,
      ].join("\n")
    );
  }
  core.info(
    [c.green("✓ PR body is valid."), DIVIDER, bodyText, DIVIDER].join("\n")
  );
}

async function run() {
  try {
    const { title, body } = github.context.payload.pull_request;
    const titlePattern = core.getInput("pr-title-regex");
    const bodyPattern = core.getInput("pr-body-regex");

    checkTitle(titlePattern, title);
    checkBody(bodyPattern, body);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
