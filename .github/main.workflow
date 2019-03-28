workflow "publish on release" {
  on = "release"
  resolves = ["publish"]
}

workflow "test on push" {
  on = "push"
  resolves = ["test"]
}

action "install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "install"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "test" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "test"
  needs = ["install"]
}

action "build" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["test"]
  args = "run build"
}

action "publish" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["build"]
  args = "publish"
  secrets = ["NPM_AUTH_TOKEN"]
}
