# workflows
workflow "On release" {
  on = "release"
  resolves = ["GitHub Action on release"]
}

workflow "On push" {
  on = "push"
  resolves = ["Test"]
}

# actions
action "Install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "install"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "Lint" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Install"]
  args = "run lint"
}

action "Test" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Lint"]
  args = "test"
}

action "Build" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Test"]
  args = "run build"
}

action "Filter release" {
  uses = "juankaram/regex-filter@aef0873c702fdc574e6cd9eb59d303b0df5e0d49"
  needs = ["Build"]
  args = "refs/tags/v.*"
}

action "Publish" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Filter release"]
  args = "publish"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "GitHub Action on release" {
  uses = "Ilshidur/action-slack@ab5f0955362cfdff2e0f0990f0272624e8cb5d13"
  needs = ["Publish"]
  args = "Successfully released {{ EVENT_PAYLOAD.release.tag_name }} "
  secrets = ["SLACK_WEBHOOK"]
  env = {
    SLACK_CHANNEL = "#devops"
  }
}
