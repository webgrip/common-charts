'use strict';

// Helm chart library: manifest:'helm' bumps ops/helm/common-helpers/Chart.yaml .version (bare
// semver), the prepareCmd keeps .appVersion in lockstep (replacing semantic-release-helm3).
// NB tag line moves from bare `1.0.13` to `v1.0.14` — a v1.0.13 baseline tag was seeded at the
// last bare release so the sequence continues instead of restarting.
const { makeConfig } = require('@webgrip/semantic-release-config');

module.exports = makeConfig({
  manifest: 'helm',
  chartPath: 'ops/helm/common-helpers',
  prepareCmd: 'yq -i \'.appVersion = "${nextRelease.version}"\' ops/helm/common-helpers/Chart.yaml',
});
