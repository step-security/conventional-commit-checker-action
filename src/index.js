import fs from "fs";
import core from "@actions/core";
import github from "@actions/github";
import axios from 'axios'

const ESC = String.fromCharCode(27);
const c = {
  red: (s) => `${ESC}[31m${s}${ESC}[0m`,
  green: (s) => `${ESC}[32m${s}${ESC}[0m`,
  yellow: (s) => `${ESC}[33m${s}${ESC}[0m`,
  dim: (s) => `${ESC}[90m${s}${ESC}[0m`,
};

const DIVIDER = c.dim("─".repeat(88));

async function validateSubscription() {
  let repoPrivate;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && fs.existsSync(eventPath)) {
    const payload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
    repoPrivate = payload?.repository?.private;
  }
  
  const upstream = 'agenthunt/conventional-commit-checker-action';
  const action = process.env.GITHUB_ACTION_REPOSITORY;
  const docsUrl = 'https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions';
  core.info('');
  core.info('\u001b[1;36mStepSecurity Maintained Action\u001b[0m');
  core.info(`Secure drop-in replacement for ${upstream}`);
  if (repoPrivate === false) core.info('\u001b[32m\u2713 Free for public repositories\u001b[0m');
  core.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`);
  core.info('');
  if (repoPrivate === false) return;
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const body = { action: action || '' };
  if (serverUrl !== 'https://github.com') body.ghes_server = serverUrl;
  try {
    await axios.post(
      `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`,
      body, { timeout: 3000 }
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      core.error(`\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m`);
      core.error(`\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`);
      process.exit(1);
    }
    core.info('Timeout or API not reachable. Continuing to next step.');
  }
}

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
    await validateSubscription();
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
